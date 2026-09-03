import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  User,
  CreditCard,
  Truck,
  CheckCircle2,
  X,
  ShieldCheck,
  MapPin,
  Lock,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
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

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/70 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        {/* Page Title */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
                Shopping Cart
              </h1>
              <p className="text-xs sm:text-sm text-base-content/60">
                {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="btn btn-ghost btn-xs sm:btn-sm text-error hover:bg-error/10 gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Cart Contents */}
        {!user ? (
          /* Not Logged In State */
          <div className="card bg-base-100 shadow-sm border border-base-content/10 py-16 px-4 text-center max-w-md mx-auto my-8">
            <div className="p-4 bg-base-200 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 text-base-content/40">
              <ShoppingCart className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-base-content mb-2">
              Sign in to view your cart
            </h2>
            <p className="text-sm text-base-content/60 mb-6">
              Your shopping cart is securely saved to your account. Sign in to view your items and proceed to checkout.
            </p>
            <Link to="/login" className="btn btn-primary btn-sm gap-2">
              Sign In to Your Account
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty State */
          <div className="card bg-base-100 shadow-sm border border-base-content/10 py-16 px-4 text-center max-w-md mx-auto my-8">
            <div className="p-4 bg-base-200 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 text-base-content/40">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-base-content mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-base-content/60 mb-6">
              Looks like you haven&apos;t added any items to your cart yet. Browse our marketplace to find great products!
            </p>
            <Link to="/" className="btn btn-primary btn-sm gap-2">
              <Package className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-content/5 p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Item Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="badge badge-ghost badge-xs gap-1 text-[11px]">
                          <Tag className="w-2.5 h-2.5" />
                          {item.category}
                        </span>
                        <span
                          className={
                            "badge badge-xs font-semibold " +
                            (item.condition === "New"
                              ? "badge-success text-success-content"
                              : "badge-warning text-warning-content")
                          }
                        >
                          {item.condition === "New" ? "Brand New" : "Used"}
                        </span>
                      </div>

                      <Link
                        to={`/product/${item._id}`}
                        className="font-bold text-base text-base-content hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>

                      <div className="flex items-center gap-2 text-xs text-base-content/60">
                        <User className="w-3.5 h-3.5" />
                        <span>Seller: {item.seller?.name || "Verified Seller"}</span>
                      </div>

                      <p className="text-sm font-semibold text-base-content/80">
                        ${Number(item.price).toFixed(2)} each
                      </p>
                    </div>

                    {/* Quantity & Action Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-base-content/10">
                      {/* Quantity Modifier */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center border border-base-content/20 rounded-lg bg-base-200/50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                            className="btn btn-ghost btn-xs btn-square"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-base-content">
                            {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentQty = item.quantity || 1;
                              const maxStock = item.stock !== undefined ? item.stock : 999;
                              if (currentQty >= maxStock) {
                                toast.error(`Only ${maxStock} units available in stock`);
                                return;
                              }
                              updateQuantity(item._id, currentQty + 1);
                            }}
                            disabled={item.stock !== undefined && (item.quantity || 1) >= item.stock}
                            className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
                            title={
                              item.stock !== undefined && (item.quantity || 1) >= item.stock
                                ? "Maximum stock reached"
                                : "Increase quantity"
                            }
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.stock !== undefined && (item.quantity || 1) >= item.stock && (
                          <span className="text-[10px] text-warning font-semibold">
                            Max ({item.stock})
                          </span>
                        )}
                      </div>

                      {/* Subtotal for Item */}
                      <div className="text-right min-w-[70px]">
                        <p className="text-base font-black text-primary">
                          ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Buy Now Column (1/3 width) */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="card bg-base-100 shadow-md border border-base-content/5">
                <div className="card-body p-6 space-y-4">
                  <h2 className="text-lg font-bold text-base-content pb-2 border-b border-base-content/10">
                    Order Summary
                  </h2>

                  <div className="space-y-2.5 text-sm text-base-content/70">
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span className="font-semibold text-base-content">{cartCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-base-content">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span className="text-success font-semibold">Free Delivery</span>
                    </div>

                    <div className="divider my-2" />

                    <div className="flex justify-between items-center text-base font-extrabold text-base-content">
                      <span>Estimated Total:</span>
                      <span className="text-2xl font-black text-primary">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Buy Now / Checkout Button */}
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="btn btn-primary w-full gap-2 shadow-md hover:scale-[1.01] transition-transform text-base mt-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Buy Now & Checkout</span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-base-content/50 pt-1">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <span>Safe & Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkout / Buy Now Modal */}
      {isCheckoutOpen && cartItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-base-content/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">Checkout</h3>
                  <p className="text-xs text-base-content/60">Choose your preferred payment method</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Mini Preview */}
            <div className="bg-base-200/60 rounded-xl p-4 space-y-2 max-h-36 overflow-y-auto">
              <div className="text-xs font-semibold text-base-content/70 pb-1 border-b border-base-content/10 flex justify-between">
                <span>Items ({cartCount})</span>
                <span>Subtotal: ${cartTotal.toFixed(2)}</span>
              </div>
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-xs text-base-content/80">
                  <span className="truncate max-w-[240px]">
                    {item.name} <span className="text-base-content/50">x{item.quantity}</span>
                  </span>
                  <span className="font-semibold">
                    ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-base-content uppercase tracking-wider">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Credit Card Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={
                    "p-3.5 rounded-xl border flex flex-col items-start gap-2 transition-all " +
                    (paymentMethod === "card"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                      : "border-base-content/15 bg-base-100 hover:bg-base-200/50 text-base-content")
                  }
                >
                  <div className="flex items-center justify-between w-full">
                    <CreditCard className="w-5 h-5" />
                    {paymentMethod === "card" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">Credit / Debit Card</p>
                    <p className="text-[10px] opacity-70">Pay securely online</p>
                  </div>
                </button>

                {/* Pay on Delivery Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={
                    "p-3.5 rounded-xl border flex flex-col items-start gap-2 transition-all " +
                    (paymentMethod === "cod"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                      : "border-base-content/15 bg-base-100 hover:bg-base-200/50 text-base-content")
                  }
                >
                  <div className="flex items-center justify-between w-full">
                    <Truck className="w-5 h-5" />
                    {paymentMethod === "cod" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">Pay on Delivery</p>
                    <p className="text-[10px] opacity-70">Cash at your doorstep</p>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4">
              {/* Conditional Payment Details */}
              {paymentMethod === "card" ? (
                /* Credit Card Form */
                <div className="space-y-3 p-4 bg-base-200/40 rounded-xl border border-base-content/10">
                  <div className="flex items-center justify-between text-xs text-base-content/70 pb-1">
                    <span className="font-semibold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-success" />
                      Card Details
                    </span>
                    <span className="text-[10px] text-base-content/50">Encrypted 256-bit</span>
                  </div>

                  {/* Cardholder Name */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Cardholder Name</span>
                    </label>
                    <input
                      type="text"
                      name="cardHolder"
                      placeholder="e.g. John Doe"
                      value={cardDetails.cardHolder}
                      onChange={handleCardChange}
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>

                  {/* Card Number */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Card Number</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                      <input
                        type="text"
                        name="cardNumber"
                        maxLength="19"
                        placeholder="4532 •••• •••• 8892"
                        value={cardDetails.cardNumber}
                        onChange={handleCardChange}
                        className="input input-bordered input-sm w-full pl-9"
                        required
                      />
                    </div>
                  </div>

                  {/* Expiry & CVV Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">Expiry (MM/YY)</span>
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        maxLength="5"
                        placeholder="12/28"
                        value={cardDetails.expiryDate}
                        onChange={handleCardChange}
                        className="input input-bordered input-sm w-full"
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">CVV / CVC</span>
                      </label>
                      <input
                        type="password"
                        name="cvv"
                        maxLength="4"
                        placeholder="•••"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        className="input input-bordered input-sm w-full"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Pay on Delivery Info Box */
                <div className="p-4 bg-info/10 border border-info/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-info font-bold text-xs">
                    <Truck className="w-4 h-4" />
                    Cash on Delivery Terms
                  </div>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    Please keep the exact cash amount (${cartTotal.toFixed(2)}) ready. You can inspect the delivery parcel when our courier arrives.
                  </p>
                </div>
              )}

              {/* Delivery Information */}
              <div className="space-y-3 pt-1">
                <label className="text-xs font-bold text-base-content uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Delivery Information
                </label>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-medium">Shipping Address *</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="House / Flat No., Road, City, Zip Code"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="textarea textarea-bordered textarea-sm w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-medium">Contact Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-base-content/10 space-y-1 text-xs">
                <div className="flex justify-between text-base-content/70">
                  <span>Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base-content/70">
                  <span>Delivery Fee:</span>
                  <span className="text-success font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-base-content pt-1 border-t border-base-content/5">
                  <span>Total Amount:</span>
                  <span className="text-primary font-black text-base">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="btn btn-ghost btn-sm flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  className="btn btn-primary btn-sm flex-1 gap-1.5"
                >
                  {isPlacingOrder ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{paymentMethod === "card" ? "Pay & Place Order" : "Confirm Order"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
