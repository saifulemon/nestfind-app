// @ts-nocheck
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Eye, EyeOff } from 'lucide-react';
import { useResetPassword } from '~/hooks/api/useAuth';
import { resetPasswordSchema, type ResetPasswordFormData } from '~/utils/validations/auth';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [success, setSuccess] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    resetPassword.mutate(
      { token, password: data.newPassword },
      { onSuccess: () => setSuccess(true) }
    );
  };

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-[24px] text-[#F1F5F9]">
        <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[16px] p-[24px] sm:p-[40px] text-center">
          <div className="w-[64px] h-[64px] rounded-full bg-[#4ADE80]/10 flex items-center justify-center mx-auto mb-[20px] text-[#4ADE80] shadow-[0_0_24px_rgba(74,222,128,0.2)]">
            <Check size={32} />
          </div>
          <h2 className="text-[28px] font-bold mb-[8px] tracking-[-0.02em] text-center">Password reset successful</h2>
          <p className="text-[#94A3B8] text-[14px] mb-[32px] leading-[1.5] text-center">Your password has been reset. You can now sign in with your new password.</p>
          <Link to="/login" className="inline-flex items-center justify-center font-semibold cursor-pointer border-0 transition-all duration-200 bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] text-white h-[48px] px-[24px] rounded-[12px] text-[14px] w-full no-underline hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-[1px]" data-testid="A-05-reset-password-back-to-login">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-[24px] text-[#F1F5F9]">
      <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[16px] p-[24px] sm:p-[40px]">
        <h2 className="text-[28px] font-bold mb-[8px] tracking-[-0.02em]">Set new password</h2>
        <p className="text-[#94A3B8] text-[14px] mb-[32px] leading-[1.5]">Choose a strong password for your account</p>

        {resetPassword.isError && (
          <div className="mb-4 p-3 rounded bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] text-[#F87171] text-sm">
            {(resetPassword.error as Error)?.message || 'Failed to reset password'}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-[16px]">
            <label htmlFor="new-password" className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">New Password</label>
            <div className="relative">
              <input id="new-password" type={showNewPw ? 'text' : 'password'} placeholder="Enter new password" {...form.register('newPassword')}
                className="h-[48px] bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-[16px] pr-[48px] text-[#F1F5F9] text-[14px] outline-none w-full placeholder:text-[#64748B] focus:border-[#4A90D9]/50 focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)]"
                data-testid="A-05-reset-password-new-password" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] bg-transparent border-none cursor-pointer p-0"
                tabIndex={-1}>
                {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.formState.errors.newPassword ? (
              <p className="text-[#F87171] text-[12px] mt-[4px]">{form.formState.errors.newPassword.message}</p>
            ) : (
              <p className="text-[12px] text-[#64748B] mt-[6px]">At least 8 characters</p>
            )}
          </div>
          <div className="mb-[16px]">
            <label htmlFor="confirm-new-password" className="block text-[13px] font-medium text-[#94A3B8] mb-[6px]">Confirm New Password</label>
            <div className="relative">
              <input id="confirm-new-password" type={showConfirmPw ? 'text' : 'password'} placeholder="Re-enter new password" {...form.register('confirmNewPassword')}
                className="h-[48px] bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-[16px] pr-[48px] text-[#F1F5F9] text-[14px] outline-none w-full placeholder:text-[#64748B] focus:border-[#4A90D9]/50 focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)]"
                data-testid="A-05-reset-password-confirm-new-password" />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] bg-transparent border-none cursor-pointer p-0"
                tabIndex={-1}>
                {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.formState.errors.confirmNewPassword && (
              <p className="text-[#F87171] text-[12px] mt-[4px]">{form.formState.errors.confirmNewPassword.message}</p>
            )}
          </div>
          <button type="submit" disabled={resetPassword.isPending}
            className="inline-flex items-center justify-center font-semibold cursor-pointer border-0 transition-all duration-200 bg-gradient-to-br from-[#4A90D9] to-[#7C3AED] text-white h-[48px] px-[24px] rounded-[12px] text-[14px] w-full hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-[1px] disabled:opacity-50 mb-[20px]"
            data-testid="A-05-reset-password-submit">
            {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-[#4A90D9] text-[13px] font-medium no-underline hover:text-[#5BA0E9]">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
