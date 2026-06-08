# Frontend Convert Report — A-02-login

page: A-02-login
component_name: Login
component_path: frontend/app/pages/auth/login.tsx
suggested_route: /login
text_elements_matched: 15
form_fields_matched: 3
buttons_matched: 1
css_arbitrary_values_used: 53
testids_added: 8
fidelity_estimate: 0.95

## Summary

Converted `A-02-login.html` to React component at `frontend/app/pages/auth/login.tsx`.

### Visual fidelity
- All text content matches character-for-character (Welcome back, Sign in to your account, Email address, you@example.com, Password, Forgot password?, Enter your password, Remember me, Sign In, or, Don't have an account?, Sign up, Terms, Privacy Policy)
- All form fields preserved: email input, password input, remember me checkbox
- Button styling matches exactly: gradient background (linear-gradient 135deg #4A90D9 → #7C3AED), 48px height, 12px border-radius, hover glow shadow, lift effect
- Divider with horizontal rules (flex-1 lines + "or" text)
- Footer with signup link and terms/privacy links
- Exact CSS values extracted: auth-card padding 40px, border-radius 16px, backdrop-blur 12px, rgba background layers, etc.

### Exclusions (by design — handled by layout)
- Navbar excluded (owned by layout/header component)
- var-nav-bar excluded (prototype navigation tool)

### Integration
- React Hook Form + Zod validation (project pattern preserved)
- Server action for form submission (existing auth action pattern)
- i18n via react-i18next useTranslation() — 11 new keys added to en/ko locale files
- data-testid attributes on all interactive elements (login-email, login-password, login-forgot-password, login-remember, login-submit, login-signup-link, login-terms-link, login-privacy-link)
- Auth guard: page is already behind GuestGuard via auth/layout.tsx (no changes needed)
- Route already registered in routes/auth.routes.ts as `route('login', 'pages/auth/login.tsx')`

### New i18n keys added
| Key | EN | KO |
|-----|----|-----|
| auth.welcomeBack | Welcome back | 다시 오신 것을 환영합니다 |
| auth.signInSubtitle | Sign in to your account | 계정에 로그인하세요 |
| auth.emailAddress | Email address | 이메일 주소 |
| auth.emailPlaceholder | you@example.com | you@example.com |
| auth.passwordPlaceholder | Enter your password | 비밀번호를 입력하세요 |
| auth.orDivider | or | 또는 |
| auth.signUp | Sign up | 회원가입 |
| auth.termsPrefix | By signing in you agree to our | 로그인하면 당사의 |
| auth.terms | Terms | 이용약관 |
| auth.privacy | Privacy Policy | 개인정보 처리방침 |
