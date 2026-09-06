import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const ROLES = [
  { value: "customer", label: "Buy", blurb: "Browse and order from sellers." },
  { value: "seller", label: "Buy & sell", blurb: "Also list your own items." },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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

      login(user, token);

      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "input input-bordered w-full bg-base-100 focus:border-primary";

  return (
    <AuthLayout
      wide
      title="Create an account"
      subtitle="Takes a minute. You can start selling whenever you feel like it."
      footer={
        <>
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-base-content underline underline-offset-4 decoration-base-content/30 hover:decoration-base-content"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-7" noValidate>
        {/* About you */}
        <fieldset className="space-y-4">
          <legend className="eyebrow mb-3">About you</legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="field-label">Full name</label>
              <input
                id="name"
                type="text"
                name="name"
                className={inputClass}
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="username" className="field-label">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/35 text-sm">@</span>
                <input
                  id="username"
                  type="text"
                  name="username"
                  className={inputClass + " pl-8"}
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className={inputClass}
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <p className="hint mt-1.5">Order confirmations and delivery updates go here.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1.6fr_1fr] gap-4">
            <div>
              <label htmlFor="phoneNumber" className="field-label">Phone number</label>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                className={inputClass}
                value={formData.phoneNumber}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div>
              <label htmlFor="age" className="field-label">Age</label>
              <input
                id="age"
                type="number"
                name="age"
                min="18"
                className={inputClass + " tnum"}
                value={formData.age}
                onChange={handleChange}
              />
              <p className="hint mt-1.5">18 or over.</p>
            </div>
          </div>

          <div>
            <label htmlFor="identificationNumber" className="field-label">Identification number</label>
            <input
              id="identificationNumber"
              type="text"
              name="identificationNumber"
              className={inputClass + " tnum"}
              value={formData.identificationNumber}
              onChange={handleChange}
            />
            <p className="hint mt-1.5">National ID, passport or SSN — whichever you have.</p>
          </div>
        </fieldset>

        {/* Account type */}
        <fieldset>
          <legend className="eyebrow mb-3">What brings you here?</legend>

          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const active = formData.role === r.value;
              return (
                <label
                  key={r.value}
                  className={
                    "cursor-pointer rounded-box border p-3.5 transition-colors " +
                    (active
                      ? "border-primary bg-primary/[0.06]"
                      : "border-base-300 hover:border-base-content/25")
                  }
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={active}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span
                    className={
                      "block text-sm font-medium " +
                      (active ? "text-primary" : "text-base-content")
                    }
                  >
                    {r.label}
                  </span>
                  <span className="block mt-1 text-xs leading-snug text-base-content/55">
                    {r.blurb}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Password */}
        <fieldset>
          <legend className="eyebrow mb-3">Security</legend>

          <label htmlFor="password" className="field-label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              className={inputClass + " pr-11"}
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
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
          <p className="hint mt-1.5">At least 6 characters.</p>
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary w-full normal-case font-medium"
          disabled={isLoading}
        >
          {isLoading ? <span className="loading loading-spinner loading-sm" /> : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
