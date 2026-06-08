// @ts-nocheck
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { useRegister } from '~/hooks/api/useAuth';
import { setUser, saveRefreshToken } from '~/redux/features/authSlice';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';

const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
  .refine((data) => data.terms === true, { message: 'You must agree to the terms', path: ['terms'] });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { register: doRegister, loading: isRegistering, isError: registerError, error: registerErr } = useRegister();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '', terms: false },
    mode: 'onChange',
  });

  async function onSubmit(data: SignupFormData) {
    try {
      const res = await doRegister({
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });
      if (res?.success) {
        if (res.refreshToken) saveRefreshToken(res.refreshToken);
        dispatch(setUser(res.result));
        navigate('/');
      }
    } catch {
      // error state is already set in the hook
    }
  }

  const inputClasses =
    'h-[48px] rounded-[10px] bg-white/[0.04] border border-white/[0.08] px-[16px] text-[14px] text-[#F1F5F9] placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)]';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)] p-[24px] bg-[#0B0F1A]">
      <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-[12px] border border-white/[0.08] rounded-[16px] p-[40px]">
        <h2 className="text-[28px] font-bold mb-[8px] tracking-[-0.02em] text-[#F1F5F9]">Create your account</h2>
        <p className="text-[#94A3B8] text-[14px] mb-[32px] leading-[1.5]">Join NestFind to save favorites and submit inquiries</p>

        {registerError && (
          <div className="mb-4 p-3 rounded bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] text-[#F87171] text-sm">
            {(registerErr as Error)?.message || 'Registration failed'}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem className="mb-[16px] space-y-0">
                <FormLabel className="text-[13px] font-medium text-[#94A3B8] mb-[6px]">Full Name</FormLabel>
                <FormControl><Input placeholder="John Doe" className={inputClasses} data-testid="A-03-signup-fullname" {...field} /></FormControl>
                <FormMessage className="text-[#F87171] text-[12px] mt-[4px]" />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="mb-[16px] space-y-0">
                <FormLabel className="text-[13px] font-medium text-[#94A3B8] mb-[6px]">Email address</FormLabel>
                <FormControl><Input type="email" placeholder="you@example.com" className={inputClasses} data-testid="A-03-signup-email" {...field} /></FormControl>
                <FormMessage className="text-[#F87171] text-[12px] mt-[4px]" />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem className="mb-[16px] space-y-0">
                <div className="flex items-center gap-[8px] mb-[6px]">
                  <FormLabel className="text-[13px] font-medium text-[#94A3B8] mb-0">Phone number</FormLabel>
                  <span className="inline-block px-[10px] py-[2px] rounded-full text-[11px] font-semibold text-[#FBBF24] shadow-[0_0_8px_rgba(251,191,36,0.3)]">Optional</span>
                </div>
                <FormControl><Input type="tel" placeholder="+1 (555) 000-0000" className={inputClasses} data-testid="A-03-signup-phone" {...field} /></FormControl>
                <FormMessage className="text-[#F87171] text-[12px] mt-[4px]" />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem className="mb-[16px] space-y-0">
                <FormLabel className="text-[13px] font-medium text-[#94A3B8] mb-[6px]">Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className={`${inputClasses} pr-[48px]`} data-testid="A-03-signup-password" {...field} />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] bg-transparent border-none cursor-pointer p-0"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage className="text-[#F87171] text-[12px] mt-[4px]" />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem className="mb-[16px] space-y-0">
                <FormLabel className="text-[13px] font-medium text-[#94A3B8] mb-[6px]">Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter your password" className={`${inputClasses} pr-[48px]`} data-testid="A-03-signup-confirm-password" {...field} />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] bg-transparent border-none cursor-pointer p-0"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage className="text-[#F87171] text-[12px] mt-[4px]" />
              </FormItem>
            )} />
            <FormField control={form.control} name="terms" render={({ field }) => (
              <FormItem className="mb-[16px] space-y-0">
                <div className="flex items-center gap-[8px]">
                  <FormControl>
                    <input type="checkbox" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked ? true : false)} className="w-[16px] h-[16px] accent-[#4A90D9] cursor-pointer shrink-0" data-testid="A-03-signup-terms" />
                  </FormControl>
                  <span className="text-[13px] text-[#94A3B8]">
                    I agree to the{' '}
                    <a href="#" className="text-[#4A90D9] text-[13px] font-medium no-underline hover:text-[#5BA0E9]">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-[#4A90D9] text-[13px] font-medium no-underline hover:text-[#5BA0E9]">Privacy Policy</a>
                  </span>
                </div>
                <FormMessage className="text-[#F87171] text-[12px] mt-[4px]" />
              </FormItem>
            )} />
            <Button type="submit" disabled={isRegistering} className="w-full h-[48px] px-[24px] rounded-[12px] text-[14px] font-semibold text-white bg-[linear-gradient(135deg,#4A90D9,#7C3AED)] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-px transition-all cursor-pointer border-0" data-testid="A-03-signup-submit">
              {isRegistering ? 'Creating...' : 'Create Account'}
            </Button>
            <div className="flex items-center gap-[12px] text-[#64748B] text-[12px] my-[24px]">
              <span className="flex-1 h-px bg-white/[0.08]" /> or <span className="flex-1 h-px bg-white/[0.08]" />
            </div>
            <p className="text-center text-[13px] text-[#94A3B8] mt-[24px]">
              Already have an account?{' '}
              <Link  to="/login" className="text-[#4A90D9] font-medium no-underline hover:text-[#5BA0E9]" data-testid="A-03-signup-signin">Sign in</Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
