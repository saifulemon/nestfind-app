# Deploy NestFind to Production

You need **two free services** to go live:

1. **Frontend (React)** → [Vercel](https://vercel.com) (free)
2. **Backend (NestJS)** → [Render](https://render.com) (free) or [Railway](https://railway.app) (free tier)

---

## Step 1: Deploy Backend to Render (Free)

### 1.1 Push your code to GitHub
Make sure your latest code is pushed to `https://github.com/saifulemon/nestfind-app`

### 1.2 Create a PostgreSQL Database on Render
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Choose the **Free** plan
4. Name it `nestfind-db`
5. Click **Create Database**
6. Copy the **Internal Database URL** (looks like `postgres://user:pass@host:5432/dbname`)

### 1.3 Create a Web Service for the Backend
1. In Render dashboard, click **New +** → **Web Service**
2. Connect your GitHub repo: `saifulemon/nestfind-app`
3. Configure:
   - **Name**: `nestfind-api`
   - **Region**: Choose closest to you
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Add **Environment Variables**:

| Key | Value | Example |
|-----|-------|---------|
| `DATABASE_URL` | Your Render Postgres URL | `postgres://nestfind:...@...:5432/nestfind` |
| `JWT_ACCESS_SECRET` | Random 64-char string | `super_random_secret_change_me_1234567890abcdef` |
| `JWT_REFRESH_SECRET` | Random 64-char string | `another_super_random_secret_change_me_now` |
| `AUTH_JWT_SECRET` | Same as JWT_ACCESS_SECRET | `super_random_secret_change_me_1234567890abcdef` |
| `AUTH_TOKEN_COOKIE_NAME` | `access_token` | `access_token` |
| `AUTH_REFRESH_COOKIE_NAME` | `refresh_token` | `refresh_token` |
| `FRONTEND_URL` | Your future Vercel URL | `https://nestfind.vercel.app` |
| `APP_URL` | Your Render service URL | `https://nestfind-api.onrender.com` |
| `NODE_ENV` | `production` | `production` |

> **Note**: After you deploy the frontend, come back and update `FRONTEND_URL` with your actual Vercel URL.

5. Click **Create Web Service**

Render will build and deploy your backend. Wait for it to say **"Live"**.

Copy the **URL** (e.g., `https://nestfind-api.onrender.com`) — you'll need it for the frontend.

---

## Step 2: Deploy Frontend to Vercel (Free)

### 2.1 Create Environment File
In your project, create `frontend/.env.production`:

```env
VITE_API_URL=https://YOUR_RENDER_BACKEND_URL/api
```

Replace `YOUR_RENDER_BACKEND_URL` with your actual Render URL (e.g., `https://nestfind-api.onrender.com`).

### 2.2 Deploy to Vercel
**Option A: Via Web (Easiest)**
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `nestfind-app` repo
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   - `VITE_API_URL` = `https://YOUR_RENDER_BACKEND_URL/api`
6. Click **Deploy**

**Option B: Via CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# From project root
cd frontend

# Create .env.production
echo "VITE_API_URL=https://YOUR_RENDER_BACKEND_URL/api" > .env.production

# Deploy
vercel --prod
```

### 2.3 Update Backend CORS
After Vercel gives you a URL (e.g., `https://nestfind.vercel.app`), go back to **Render dashboard** → your Web Service → **Environment** and update:

```
FRONTEND_URL=https://nestfind.vercel.app
```

Then click **Manual Deploy** → **Clear Build Cache & Deploy**.

---

## Step 3: Verify Everything Works

| Check | URL |
|-------|-----|
| Backend health | `https://YOUR_RENDER_URL/api` should show Swagger or API response |
| Frontend | `https://YOUR_VERCEL_URL` should load your app |
| Login/Register | Test signing up on the deployed frontend |

---

## Important Notes

### Free Tier Limits
- **Render Free**: Sleeps after 15 min inactivity (first request takes ~30s to wake up)
- **Vercel Free**: Generous limits, perfect for frontend

### Images/Uploads
Your backend stores uploaded images in the `uploads/` folder. On Render free tier, this is **ephemeral** (deleted on redeploy). For production, consider:
- Using **Cloudinary** or **AWS S3** for image storage
- Or upgrade to Render's paid plan with persistent disk

### Database Migrations
The backend auto-creates tables (synchronize) in development but **NOT in production**.

To run migrations on Render:
1. Go to Render dashboard → your Web Service → **Shell**
2. Run:
```bash
npx typeorm migration:run -d dist/database/data-source.js
```

Or temporarily set `synchronize: true` in `app.module.ts` for the first deploy, then set it back.

---

## Alternative: Railway (instead of Render)

If you prefer Railway:
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add a **PostgreSQL** service
4. Add variables: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`
5. Deploy

Railway free tier also sleeps but is equally easy to use.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot connect to backend" | Check `VITE_API_URL` in Vercel env vars matches Render URL |
| CORS errors in browser | Update `FRONTEND_URL` in Render env vars |
| "Database not found" | Make sure `DATABASE_URL` is set correctly in Render |
| Images not loading | Expected on free Render — images are ephemeral |

---

**You're live!** 🚀
