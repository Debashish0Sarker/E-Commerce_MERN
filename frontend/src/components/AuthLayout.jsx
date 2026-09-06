import { Link } from "react-router-dom";

/**
 * Split layout shared by sign in / register / password reset.
 * The left panel is decorative and drops away below `lg`.
 */
const AuthLayout = ({ title, subtitle, children, footer, wide = false }) => {
  return (
    <div className="min-h-screen bg-base-100 lg:grid lg:grid-cols-[minmax(0,1fr)_1.1fr]">
      {/* Left: quiet editorial panel */}
      <aside className="hidden lg:flex flex-col justify-between bg-primary text-primary-content p-12 xl:p-16">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tightish">
          Fantastic Buys
        </Link>

        <div className="max-w-sm">
          <p className="font-display text-[2.6rem] leading-[1.1] font-medium tracking-tightish">
            Somebody else&rsquo;s shelf is somebody&rsquo;s shopping list.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-primary-content/70">
            New stock and second-hand finds, listed side by side by the people
            who actually own them.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-6 pt-10 border-t border-primary-content/15">
          {[
            ["Listings", "Open to all"],
            ["Delivery", "Free"],
            ["Payment", "Card or cash"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-primary-content/50">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </aside>

      {/* Right: the form itself */}
      <main className="flex flex-col min-h-screen lg:min-h-0">
        <div className="lg:hidden px-6 pt-7">
          <Link to="/" className="font-display text-xl font-semibold tracking-tightish">
            Fantastic Buys
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10">
          <div className={`w-full ${wide ? "max-w-[30rem]" : "max-w-[24rem]"}`}>
            <header className="mb-8">
              <h1 className="font-display text-[2rem] leading-tight font-semibold tracking-tightish text-base-content">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-base-content/60">{subtitle}</p>
              )}
            </header>

            {children}

            {footer && (
              <div className="mt-8 pt-6 border-t border-base-300 text-sm text-base-content/60">
                {footer}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
