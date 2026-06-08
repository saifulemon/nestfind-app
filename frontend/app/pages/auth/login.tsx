// @ts-nocheck
import { useState } from 'react';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLogin } from '~/hooks/api/useAuth';
import { setUser, saveRefreshToken } from '~/redux/features/authSlice';
import { loginSchema, type LoginFormData } from '~/utils/validations/auth';

const inputClass =
  'h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 text-[#F1F5F9] text-sm outline-none font-[inherit] placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-[border-color,box-shadow]';

const btnPrimaryClass =
  'inline-flex items-center justify-center font-semibold cursor-pointer border-none transition-all duration-200 font-[inherit] w-full h-[48px] px-6 rounded-[12px] text-sm text-white bg-[linear-gradient(135deg,#4A90D9,#7C3AED)] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed';

export default function Login() {
  useDocumentTitle('Sign In - NestFind');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = (data: LoginFormData) => {
    login(data.email, data.password).then((res: any) => {
      if (res?.success) {
        if (res.refreshToken) saveRefreshToken(res.refreshToken);
        dispatch(setUser(res.result));
        navigate('/');
      }
    });
  };

  return (
    <div className="bg-[#0B0F1A] min-h-screen text-[#F1F5F9]">
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)] p-6">
        <div className="w-full max-w-[420px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-[40px]">
          <h2 className="text-[28px] font-bold mb-2 tracking-[-0.02em]">
            Welcome back
          </h2>
          <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
            Sign in to access your saved properties and inquiries.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] text-[#F87171] text-sm">
              {error || 'Login failed'}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="login-email" className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                data-testid="login-email"
                {...form.register('email')}
                className={inputClass}
              />
              {form.formState.errors.email && (
                <p className="text-[#F87171] text-xs mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-[6px]">
                <label htmlFor="login-password" className="block text-[13px] font-medium text-[#94A3B8] mb-0">
                  Password
                </label>
                <Link  to="/forgot-password" className="text-[#4A90D9] text-[13px] font-medium no-underline hover:text-[#5BA0E9]" data-testid="login-forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  data-testid="login-password"
                  {...form.register('password')}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="m14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-[#F87171] text-xs mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-[13px] text-[#94A3B8] cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 accent-[#4A90D9] cursor-pointer" data-testid="login-remember" />
                Remember me
              </label>
            </div>

            <button type="submit" disabled={loading} data-testid="login-submit" className={btnPrimaryClass}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 text-[#64748B] text-xs my-6">
            <span className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
            or
            <span className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          </div>

          <div className="text-center text-[13px] text-[#94A3B8] mt-6">
            Don&apos;t have an account?{' '}
            <Link  to="/signup" className="text-[#4A90D9] font-medium no-underline hover:text-[#5BA0E9]" data-testid="login-signup-link">
              Sign up
            </Link>
          </div>

          <p className="text-xs text-[#64748B] text-center mt-6 leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#4A90D9] no-underline hover:text-[#5BA0E9]" data-testid="login-terms-link">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-[#4A90D9] no-underline hover:text-[#5BA0E9]" data-testid="login-privacy-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
