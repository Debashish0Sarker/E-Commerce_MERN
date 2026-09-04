import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useAuth } from "../context/AuthContext";

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
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-primary/10 p-4 rounded-full">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-base-content">Welcome Back</h1>
          <p className="text-base-content/60 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identifier */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Username or Email</span>
                </label>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Enter your username or email"
                  className="input input-bordered w-full"
                  value={formData.identifier}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="input input-bordered w-full pr-12"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Forgot Password */}
                <label className="label">
                  <Link
                    to="/forgot-password"
                    className="label-text-alt link link-hover text-primary"
                  >
                    Forgot password?
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider text-base-content/40">OR</div>

            {/* Register link */}
            <p className="text-center text-base-content/70 text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="link link-primary font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
