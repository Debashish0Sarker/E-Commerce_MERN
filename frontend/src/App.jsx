import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/homepage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import CreateProductPage from "./pages/CreateProductPage";
import SeeProduct from "./pages/SeeProduct";
import CartPage from "./pages/CartPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import "./App.css";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Homepage / Dashboard */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/create" element={<CreateProductPage />} />
            <Route path="/product/:id" element={<SeeProduct />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
