import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  PlusCircle, 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, isAuthenticated, isSeller, switchMode, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleToggleMode = async () => {
    const nextMode = user?.currentMode === "seller" ? "customer" : "seller";
    await switchMode(nextMode);
  };

  return (
    <header className="sticky top-0 z-50 bg-base-100/90 backdrop-blur-md border-b border-base-content/10 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand / Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-base-content hover:opacity-90 transition-opacity"
          >
            <div className="p-2 rounded-xl bg-primary text-primary-content shadow-md shadow-primary/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Commerce site
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Light / Dark mode) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle btn-sm sm:btn-md"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-warning transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-primary transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Authenticated Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Create Product button (for Sellers / Admins) */}
                {isSeller && (
                  <Link
                    to="/create"
                    className="btn btn-primary btn-sm hidden sm:inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Product</span>
                  </Link>
                )}

                {/* Seller Mode Switcher button */}
                {isSeller && (
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="btn btn-outline btn-xs sm:btn-sm gap-1 hidden md:inline-flex"
                    title={`Currently in ${user.currentMode} mode. Click to switch.`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="capitalize">{user.currentMode || "customer"} mode</span>
                  </button>
                )}

                {/* User Info / Badge */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-base-200 text-base-content text-xs sm:text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{user?.name}</span>
                  <span className="badge badge-primary badge-xs sm:badge-sm uppercase font-semibold">
                    {user?.role}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm sm:btn-md gap-1.5 text-error hover:bg-error/10"
                  title="Log out of your account"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              /* Unauthenticated Controls */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-primary btn-sm sm:btn-md gap-1.5 shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="btn btn-ghost btn-sm sm:btn-md hidden sm:inline-flex"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
