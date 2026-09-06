import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import CheckoutDialog from "../components/CheckoutDialog";
import axiosInstance from "../lib/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    cartTotal,
    cartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "cod"
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Form states for checkout
  const [shippingAddress, setShippingAddress] = useState("");
  const [recipientPhone, setRecipientPhone] = useState(user?.phoneNumber || "");
  const [cardDetails, setCardDetails] = useState({
    cardHolder: user?.name || "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      toast.error("Please enter your shipping address");
      return;
    }

    if (paymentMethod === "card") {
      if (
        !cardDetails.cardHolder.trim() ||
        !cardDetails.cardNumber.trim() ||
        !cardDetails.expiryDate.trim() ||
        !cardDetails.cvv.trim()
      ) {
        toast.error("Please complete all credit card details");
        return;
      }
    } else {
      if (!recipientPhone.trim()) {
        toast.error("Please provide a contact phone number for delivery");
        return;
      }
    }

    setIsPlacingOrder(true);

    try {
      const res = await axiosInstance.post("/cart/checkout", {
        paymentMethod,
        shippingAddress,
        recipientPhone,
      });

      setIsCheckoutOpen(false);
      toast.success(res.data.message || "Order placed successfully!");
      // Empty cart in context & navigate back to dashboard
      await clearCart();
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Checkout failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const checkoutLines = cartItems.map((item) => ({
    id: item._id,
    name: item.name,
    meta: `${item.quantity || 1} × $${Number(item.price).toFixed(2)}`,
    amount: Number(item.price) * (item.quantity || 1),
  }));

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-[68rem] w-full px-5 sm:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/55 hover:text-base-content transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Keep browsing
        </Link>

        <div className="flex items-end justify-between gap-4 mt-5 mb-7 pb-5 border-b border-base-300">
          <div>
            <h1 className="font-display text-[2rem] leading-none font-semibold tracking-tightish text-base-content">
              Your cart
            </h1>
            <p className="mt-2 text-sm text-base-content/55">
              {cartCount === 0
                ? "Nothing here yet"
                : `${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-base-content/50 hover:text-error transition-colors"
            >
              Empty cart
            </button>
          )}
        </div>

        {!user ? (
          /* Signed out */
          <div className="py-20 text-center">
            <p className="font-display text-xl text-base-content">
              Sign in to see your cart
            </p>
            <p className="mt-2 text-sm text-base-content/55 max-w-sm mx-auto">
              Your cart is saved to your account, so it follows you between
              devices.
            </p>
            <Link to="/login" className="btn btn-primary btn-sm mt-6 normal-case font-medium">
              Sign in
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty */
          <div className="py-20 text-center">
            <p className="font-display text-xl text-base-content">Your cart is empty</p>
            <p className="mt-2 text-sm text-base-content/55 max-w-sm mx-auto">
              Once you add something it will show up here, ready to check out.
            </p>
            <Link to="/" className="btn btn-outline btn-sm mt-6 normal-case font-medium">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_19rem] gap-10 items-start">
            {/* Lines */}
            <ul className="divide-y divide-base-300">
              {cartItems.map((item) => {
                const quantity = item.quantity || 1;
                const atMax = item.stock !== undefined && quantity >= item.stock;

                return (
                  <li key={item._id} className="flex gap-4 py-5 first:pt-0">
                    {/* Thumbnail */}
                    <Link
                      to={`/product/${item._id}`}
                      className="w-[92px] h-[92px] shrink-0 rounded-box overflow-hidden bg-base-200 border border-base-300/60"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full grid place-items-center font-display text-[11px] text-base-content/25 px-2 text-center">
                          {item.category}
                        </span>
                      )}
                    </Link>

                    {/* Detail */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${item._id}`}
                          className="text-[15px] font-medium text-base-content hover:underline underline-offset-[3px] line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-[13px] text-base-content/50">
                          {item.seller?.name || "Private seller"}
                          {item.condition ? ` · ${item.condition === "New" ? "New" : "Used"}` : ""}
                        </p>
                        <p className="mt-1 text-[13px] text-base-content/50 tnum">
                          ${Number(item.price).toFixed(2)} each
                        </p>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id)}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-base-content/45 hover:text-error transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>

                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                        {/* Quantity */}
                        <div className="inline-flex items-center rounded-btn border border-base-300">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, quantity - 1)}
                            className="w-8 h-8 grid place-items-center text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-l-btn transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tnum font-medium text-base-content">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const maxStock = item.stock !== undefined ? item.stock : 999;
                              if (quantity >= maxStock) {
                                toast.error(`Only ${maxStock} available`);
                                return;
                              }
                              updateQuantity(item._id, quantity + 1);
                            }}
                            disabled={atMax}
                            className="w-8 h-8 grid place-items-center text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-r-btn transition-colors disabled:opacity-25 disabled:hover:bg-transparent"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {atMax && (
                          <span className="text-[11px] text-base-content/45 tnum">
                            All {item.stock} taken
                          </span>
                        )}

                        <p className="text-[15px] font-semibold tnum text-base-content sm:mt-1">
                          ${(Number(item.price) * quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Summary */}
            <aside className="lg:sticky lg:top-[76px] rounded-box border border-base-300 p-5">
              <h2 className="eyebrow mb-4">Summary</h2>

              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between text-base-content/60">
                  <dt>Items</dt>
                  <dd className="tnum">{cartCount}</dd>
                </div>
                <div className="flex justify-between text-base-content/60">
                  <dt>Subtotal</dt>
                  <dd className="tnum">${cartTotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-base-content/60">
                  <dt>Delivery</dt>
                  <dd>Free</dd>
                </div>
                <div className="flex justify-between items-baseline pt-3 mt-3 border-t border-base-300">
                  <dt className="text-sm font-medium text-base-content">Total</dt>
                  <dd className="text-xl font-semibold tnum text-base-content">
                    ${cartTotal.toFixed(2)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="btn btn-primary w-full mt-5 normal-case font-medium"
              >
                Check out
              </button>

              <p className="hint mt-3 text-center">
                You can review everything before confirming.
              </p>
            </aside>
          </div>
        )}
      </main>

      <CheckoutDialog
        open={isCheckoutOpen && cartItems.length > 0}
        onClose={() => setIsCheckoutOpen(false)}
        lines={checkoutLines}
        total={cartTotal}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        shippingAddress={shippingAddress}
        onShippingAddressChange={(e) => setShippingAddress(e.target.value)}
        recipientPhone={recipientPhone}
        onRecipientPhoneChange={(e) => setRecipientPhone(e.target.value)}
        cardDetails={cardDetails}
        onCardChange={handleCardChange}
        onSubmit={handleConfirmOrder}
        isSubmitting={isPlacingOrder}
        submitLabel={paymentMethod === "card" ? "Pay and order" : "Place order"}
      />
    </div>
  );
};

export default CartPage;
