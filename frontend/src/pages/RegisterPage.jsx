import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShoppingBag, User, Mail, Phone, Hash, CreditCard, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

const ROLES = [
  { value: "customer", label: "Customer" },
  { value: "seller", label: "Seller" },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    age: "",
    password: "",
    identificationNumber: "",
    role: "customer",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const { name, username, email, phoneNumber, age, password, identificationNumber } = formData;
    if (!name || !username || !email || !phoneNumber || !age || !password || !identificationNumber) {
      toast.error("Please fill in all fields");
      return;
    }
    if (Number(age) < 18) {
      toast.error("You must be at least 18 years old to register");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/auth/register", {
        ...formData,
        age: Number(formData.age),
      });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-primary/10 p-4 rounded-full">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-base-content">Create Account</h1>
          <p className="text-base-content/60 mt-1">Join us today — it is free!</p>
        </div>

        {/* Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Row: Name + Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      className="input input-bordered w-full pl-9"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Username</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 font-medium text-sm">@</span>
                    <input
                      type="text"
                      name="username"
                      placeholder="johndoe"
                      className="input input-bordered w-full pl-8"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email Address</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    className="input input-bordered w-full pl-9"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Row: Phone + Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Phone Number</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="+1 234 567 8901"
                      className="input input-bordered w-full pl-9"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Age</span>
                    <span className="label-text-alt text-base-content/40">Min. 18</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                      type="number"
                      name="age"
                      placeholder="25"
                      min="18"
                      className="input input-bordered w-full pl-9"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Identification Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Identification Number</span>
                  <span className="label-text-alt text-base-content/40">NID / Passport / SSN</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input
                    type="text"
                    name="identificationNumber"
                    placeholder="Your ID number"
                    className="input input-bordered w-full pl-9"
                    value={formData.identificationNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Role */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Register As</span>
                </label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                  <select
                    name="role"
                    className="select select-bordered w-full appearance-none"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.role === "seller" && (
                  <label className="label">
                    <span className="label-text-alt text-info">
                      As a seller, you can list and sell products on the platform.
                    </span>
                  </label>
                )}
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                  <span className="label-text-alt text-base-content/40">Min. 6 chars</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    className="input input-bordered w-full pr-12"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider text-base-content/40">OR</div>

            {/* Login link */}
            <p className="text-center text-base-content/70 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
