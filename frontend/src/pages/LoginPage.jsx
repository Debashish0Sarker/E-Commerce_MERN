import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identifier || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      const { token, user } = res.data;

      login(user, token);

      toast.success(`Welcome back, ${user.name}!`);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-medium text-base-content underline underline-offset-4 decoration-base-content/30 hover:decoration-base-content">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="identifier" className="field-label">
            Username or email
          </label>
          <input
            id="identifier"
            type="text"
            name="identifier"
            className="input input-bordered w-full bg-base-100 focus:border-primary"
            value={formData.identifier}
            onChange={handleChange}
            autoComplete="username"
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="password" className="field-label mb-0">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-base-content/50 hover:text-base-content transition-colors">
              Forgot it?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              className="input input-bordered w-full pr-11 bg-base-100 focus:border-primary"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full normal-case font-medium"
          disabled={isLoading}
        >
          {isLoading ? <span className="loading loading-spinner loading-sm" /> : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
