import { Link } from "react-router-dom";
import { Clock, ArrowLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center py-16">
            {/* Icon */}
            <div className="bg-warning/10 p-6 rounded-full mb-6">
              <Clock className="w-16 h-16 text-warning" />
            </div>

            {/* Message */}
            <h1 className="text-2xl font-bold text-base-content mb-2">
              Coming Soon
            </h1>
            <p className="text-base-content/60 mb-2">
              Password reset via email is not yet set up.
            </p>
            <p className="text-base-content/40 text-sm italic">
              — For future purpose —
            </p>

            {/* Back to login */}
            <Link to="/login" className="btn btn-primary mt-8 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
