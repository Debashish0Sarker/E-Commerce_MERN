import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync cart from MongoDB when user logs in or auth state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchCart = async () => {
        setIsLoading(true);
        try {
          const res = await axiosInstance.get("/cart");
          setCartItems(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Failed to fetch cart from database:", err);
          setCartItems([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCart();
    } else {
      // When logged out or guest, cart is cleared and not linked to any seller/user
      setCartItems([]);
      localStorage.removeItem("cart");
    }
  }, [isAuthenticated, token]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      return false;
    }

    const sellerId = product.seller?._id || product.seller;
    if (user && sellerId && sellerId.toString() === user.id.toString()) {
      toast.error("You cannot add your own product to your cart");
      return false;
    }

    try {
      const res = await axiosInstance.post("/cart/add", {
        productId: product._id,
        quantity,
      });

      if (res.data.cart) {
        setCartItems(res.data.cart);
      }
      toast.success("Item added to cart!");
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add item to cart";
      toast.error(msg);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;

    try {
      const res = await axiosInstance.delete(`/cart/remove/${productId}`);
      if (res.data.cart) {
        setCartItems(res.data.cart);
      }
      toast.success("Item removed from cart");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to remove item";
      toast.error(msg);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (!isAuthenticated) return;

    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const res = await axiosInstance.put("/cart/update", {
        productId,
        quantity: newQuantity,
      });
      if (res.data.cart) {
        setCartItems(res.data.cart);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update quantity";
      toast.error(msg);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      await axiosInstance.delete("/cart/clear");
      setCartItems([]);
    } catch (err) {
      console.error("Failed to clear cart in database:", err);
      setCartItems([]);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
