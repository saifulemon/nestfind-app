// @ts-nocheck
import { useState } from 'react';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { useRegister } from '~/hooks/api/useAuth';
import { setUser } from '~/redux/features/authSlice';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';

const registerFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

const inputClasses =
  'h-[48px] w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[16px] text-[#F1F5F9] text-sm outline-none font-[inherit] placeholder:text-[#64748B] focus:border-[rgba(74,144,217,0.5)] focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-[border-color,box-shadow]';

export default function Register() {
  useDocumentTitle('Create Account - NestFind');
  const { register: doRegister, loading: isRegistering, isError: registerError, error: registerErr } = useRegister();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await doRegister({ name: data.name, email: data.email, password: data.password });
      if (res?.success) {
        dispatch(setUser(res.result));
        navigate('/');
      }
    } catch {
      // error state is already set in the hook
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 text-[#F1F5F9]">
      <div className="w-full max-w-[420px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-[24px] sm:p-[40px]">
        <h2 className="text-[28px] font-bold mb-[8px] tracking-[-0.02em]">Create your account</h2>
        <p className="text-[#94A3B8] text-[14px] mb-[32px] leading-[1.5]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4A90D9] font-medium no-underline hover:text-[#5BA0E9]">Sign in</Link>
        </p>

        {registerError && (
          <div className="mb-4 p-3 rounded bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] text-[#F87171] text-sm">
            {(registerErr as Error)?.message || 'Registration failed'}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium text-[#94A3B8]">Full Name</FormLabel>
                <FormControl><Input placeholder="Enter your name" className={inputClasses} {...field} /></FormControl>
                <FormMessage className="text-[#F87171] text-xs mt-1" />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium text-[#94A3B8]">Email</FormLabel>
                <FormControl><Input placeholder="Enter your email" className={inputClasses} {...field} /></FormControl>
                <FormMessage className="text-[#F87171] text-xs mt-1" />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium text-[#94A3B8]">Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Create a password" className={`${inputClasses} pr-10`} {...field} />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] bg-transparent border-none cursor-pointer p-0"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage className="text-[#F87171] text-xs mt-1" />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium text-[#94A3B8]">Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" className={`${inputClasses} pr-10`} {...field} />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] bg-transparent border-none cursor-pointer p-0"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage className="text-[#F87171] text-xs mt-1" />
              </FormItem>
            )} />
            <Button type="submit" className="w-full h-[48px] rounded-[12px] text-[14px] font-semibold text-white bg-[linear-gradient(135deg,#4A90D9,#7C3AED)] hover:shadow-[0_0_24px_rgba(74,144,217,0.3)] hover:-translate-y-px transition-all border-0" disabled={isRegistering}>
              {isRegistering ? 'Creating...' : 'Create account'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
