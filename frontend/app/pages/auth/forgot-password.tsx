// @ts-nocheck
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useForgotPassword } from '~/hooks/api/useAuth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { send, loading, sent, error: forgotError } = useForgotPassword();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(email);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)] p-[24px]">
      <div className="w-full max-w-[420px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-[40px] text-center">
        <div className="flex items-center justify-center w-[56px] h-[56px] rounded-[14px] bg-[rgba(74,144,217,0.1)] mx-auto mb-[24px] text-[#4A90D9]">
          <LockKeyhole size={28} />
        </div>
        <h2 className="text-[28px] font-bold mb-[8px] tracking-[-0.02em]">Reset your password</h2>
        <p className="text-[#94A3B8] text-[14px] mb-[32px] leading-[1.5]">Enter your email and we&apos;ll send you a reset link</p>

        {sent && (
          <p className="mb-[16px] p-[12px] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] rounded-[8px] text-[#4ADE80] text-[13px]">
            If an account with that email exists, a password reset link has been sent.
          </p>
        )}
        {forgotError && (
          <p className="mb-[16px] p-[12px] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] rounded-[8px] text-[#F87171] text-[13px]">
            {forgotError || 'Something went wrong'}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="text-left mb-[16px]">
            <label htmlFor="email" className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Email address</label>
            <input
              type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" data-testid="A-04-forgot-password-email"
              className="w-full h-[48px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-[14px] outline-none placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)]"
            />
          </div>
          <button type="submit" disabled={loading} data-testid="A-04-forgot-password-submit"
            className="w-full inline-flex items-center justify-center font-semibold cursor-pointer border-none transition-all duration-200 font-[inherit] no-underline bg-[linear-gradient(135deg,#4A90D9,#7C3AED)] text-white h-[48px] px-[24px] rounded-[12px] text-[14px] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:translate-y-[-1px] disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link  to="/login" data-testid="A-04-forgot-password-back-to-login"
          className="block text-center text-[#94A3B8] text-[13px] no-underline mt-[20px] font-medium hover:text-[#F1F5F9] transition-colors duration-200">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
