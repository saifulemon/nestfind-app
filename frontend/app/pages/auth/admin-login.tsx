// @ts-nocheck
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '~/hooks/api/useAuth';
import { setUser, saveRefreshToken } from '~/redux/features/authSlice';
import { RoleEnum } from '~/enums/role.enum';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState('');
  const { login, loading, error } = useLogin();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setRoleError('');
    login(email, password).then((res: any) => {
      if (res?.success) {
        const user = res.result;
        if (user?.role !== RoleEnum.ADMIN) {
          setRoleError('Access denied: This account does not have admin privileges.');
          return;
        }
        if (res.refreshToken) saveRefreshToken(res.refreshToken);
        dispatch(setUser(user));
        navigate('/admin/dashboard');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-xl font-bold text-primary">A</span>
          </div>
          <h2 className="text-2xl font-bold">Admin Login</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to the admin dashboard.</p>
        </div>

        {error && (
          <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
            {error || 'Login failed'}
          </div>
        )}

        {roleError && (
          <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
            {roleError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@nestfind.com" className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-10 rounded-md border bg-background px-3 pr-10 text-sm" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-0"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">User Login</Link>
        </p>
      </div>
    </div>
  );
}
