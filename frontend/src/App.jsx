import { Route, Routes, Navigate } from "react-router-dom";
import Homepage from "./pages/homepage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import "./App.css";

// If no token in localStorage, user is not authenticated
const isAuthenticated = () => !!localStorage.getItem("token");

const App = () => {
  return (
    <Routes>
      {/* Redirect to /login if not logged in */}
      <Route
        path="/"
        element={isAuthenticated() ? <Homepage /> : <Navigate to="/login" replace />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  );
};

export default App;
