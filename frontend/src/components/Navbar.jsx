import { Link, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  LogOut,
  Plus,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, isAuthenticated, isSeller, switchMode, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
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
    <header className="sticky top-0 z-40 bg-base-100/85 backdrop-blur border-b border-base-300">
      <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
        <div className="flex h-[60px] items-center justify-between gap-6">
          {/* Wordmark */}
          <Link to="/" className="flex items-baseline gap-2 group">
            <span className="font-display text-[1.35rem] leading-none font-semibold tracking-tightish text-base-content">
              Fantastic Buys
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-[0.16em] text-base-content/40 pb-[2px]">
              Marketplace
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {isSeller && (
              <Link
                to="/create"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-base-content/70 hover:text-base-content px-3 py-2 rounded-btn hover:bg-base-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Sell an item
              </Link>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-btn text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              aria-label="Toggle colour theme"
            >
              {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <Link
              to="/cart"
              className="relative p-2 rounded-btn text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-content text-[10px] font-semibold leading-4 text-center tnum">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="dropdown dropdown-end ml-1">
                <div
                  tabIndex={0}
                  role="button"
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-btn hover:bg-base-200 transition-colors cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-content grid place-items-center text-xs font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                  <span className="hidden md:block max-w-[110px] truncate text-sm font-medium text-base-content">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-base-content/40" />
                </div>

                <ul
                  tabIndex={0}
                  className="dropdown-content mt-2 w-60 p-1.5 surface shadow-lift z-50"
                >
                  <li className="px-3 py-2.5 border-b border-base-300/70 mb-1">
                    <p className="text-sm font-medium text-base-content truncate">{user?.name}</p>
                    <p className="text-xs text-base-content/50 truncate">
                      {user?.email || `@${user?.username}`}
                    </p>
                    <p className="mt-1.5 text-[11px] text-base-content/50 capitalize">
                      {user?.role}
                      {isSeller && user?.currentMode ? ` · browsing as ${user.currentMode}` : ""}
                    </p>
                  </li>

                  {isSeller && (
                    <>
                      <li>
                        <Link
                          to="/create"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-btn text-sm text-base-content/80 hover:bg-base-200 transition-colors sm:hidden"
                        >
                          <Plus className="w-4 h-4" />
                          Sell an item
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={handleToggleMode}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-btn text-sm text-base-content/80 hover:bg-base-200 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Switch to {user?.currentMode === "seller" ? "customer" : "seller"}
                        </button>
                      </li>
                    </>
                  )}

                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-btn text-sm text-error hover:bg-error/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-1 ml-1">
                <Link
                  to="/login"
                  className="text-sm font-medium text-base-content/70 hover:text-base-content px-3 py-2 rounded-btn hover:bg-base-200 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-base-content text-base-100 px-3.5 py-2 rounded-btn hover:opacity-90 transition-opacity"
                >
                  Join
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
