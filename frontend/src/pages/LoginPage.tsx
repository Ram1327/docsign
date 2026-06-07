import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { LoginFormData } from "@/types";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed. Please try again.";
      if (message.toLowerCase().includes("invalid")) {
        setError("password", { message });
      } else {
        toast.error(message);
      }
    }
  };

  if (authLoading) return null;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your DocSign account to continue"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end mt-0.5">
            <button
              type="button"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              onClick={() => toast("Password reset coming soon")}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-1"
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          Create one free
        </Link>
      </p>

      <div className="mt-6 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700 font-medium mb-1">Demo credentials</p>
        <p className="text-xs text-amber-600 font-mono">demo@docsign.app / Demo1234</p>
      </div>
    </AuthLayout>
  );
}
