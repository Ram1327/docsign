import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { RegisterFormData } from "@/types";

const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Full name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Please enter a valid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string({ required_error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success("Account created! Welcome to DocSign.");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pw: string) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-blue-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-400", width: "w-full" };
  };

  const strength = getPasswordStrength(password);

  if (authLoading) return null;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start signing documents in minutes. No credit card required."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Ada Lovelace"
          autoComplete="name"
          autoFocus
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Work email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          {strength && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                />
              </div>
              <span className="text-xs text-gray-400">{strength.label}</span>
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400 leading-relaxed">
        By creating an account, you agree to our{" "}
        <button className="text-brand-600 hover:underline">Terms of Service</button>{" "}
        and{" "}
        <button className="text-brand-600 hover:underline">Privacy Policy</button>.
      </p>

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
