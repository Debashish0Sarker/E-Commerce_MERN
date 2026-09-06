import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const ForgotPasswordPage = () => {
  return (
    <AuthLayout
      title="Password resets aren't live yet"
      subtitle="Sending reset links needs email delivery wired up, and that hasn't been built."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-medium text-base-content hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-box border border-base-300 bg-base-200/50 p-5">
        <p className="text-sm leading-relaxed text-base-content/70">
          In the meantime, if you're locked out of an account, the quickest route
          is to register a new one — or reach the seller directly from any of
          their listings.
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
