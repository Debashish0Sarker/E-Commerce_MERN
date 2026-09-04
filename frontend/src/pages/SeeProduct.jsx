import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  User,
  Mail,
  Phone,
  AtSign,
  Calendar,
  Package,
  ShoppingCart,
  Zap,
  Clock,
  Users,
  BadgeCheck,
  AlertTriangle,
  CreditCard,
  Truck,
  CheckCircle2,
  X,
  ShieldCheck,
  MapPin,
  Lock,
  Layers,
  Plus,
  Minus,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import axiosInstance from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const SeeProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

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

  // Check if the logged-in user is the seller of this product
  const isOwnProduct = user && product?.seller?._id === user.id;
  const maxStock = product?.stock !== undefined ? product.stock : 1;

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/products/" + id);
        setProduct(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Update phone if user changes
  useEffect(() => {
    if (user?.phoneNumber) {
      setRecipientPhone(user.phoneNumber);
    }
    if (user?.name) {
      setCardDetails((prev) => ({ ...prev, cardHolder: user.name }));
    }
  }, [user]);

  // Handle Add to Cart & navigate to dashboard
  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      toast.error("Please sign in to add items to your cart");
      navigate("/login");
      return;
    }
    if (isOwnProduct) {
      toast.error("You cannot add your own product to your cart");
      return;
    }
    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    const success = await addToCart(product, selectedQuantity);
    if (success) {
      navigate("/");
    }
  };

  // Handle Buy Now
  const handleOpenBuyNow = () => {
    if (!user) {
      toast.error("Please sign in to buy this product");
      navigate("/login");
      return;
    }
    if (isOwnProduct) {
      toast.error("You cannot buy your own product");
      return;
    }
    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    setIsCheckoutOpen(true);
  };

  // Handle Card inputs
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Order Confirmation
  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }

    if (paymentMethod === "card") {
      if (
        !cardDetails.cardHolder.trim() ||
        !cardDetails.cardNumber.trim() ||
        !cardDetails.expiryDate.trim() ||
        !cardDetails.cvv.trim()
      ) {
        toast.error("Please fill in all credit card details");
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
      const res = await axiosInstance.post(`/products/${product._id}/buy`, {
        quantity: selectedQuantity,
        paymentMethod,
        shippingAddress,
        recipientPhone,
      });

      setIsCheckoutOpen(false);
      toast.success(res.data.message || "Purchase completed successfully!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to complete purchase";
      toast.error(msg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Calculate how old the listing is
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Unknown";
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return diffMins + (diffMins === 1 ? " minute ago" : " minutes ago");
    if (diffHours < 24) return diffHours + (diffHours === 1 ? " hour ago" : " hours ago");
    if (diffDays < 7) return diffDays + (diffDays === 1 ? " day ago" : " days ago");
    if (diffWeeks < 5) return diffWeeks + (diffWeeks === 1 ? " week ago" : " weeks ago");
    return diffMonths + (diffMonths === 1 ? " month ago" : " months ago");
  };

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/70 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="text-base-content/50 text-sm">Loading product details...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="card bg-base-100 shadow-md border border-error/20 max-w-lg mx-auto">
            <div className="card-body items-center text-center py-16">
              <div className="p-4 bg-error/10 rounded-full mb-4">
                <AlertTriangle className="w-10 h-10 text-error" />
              </div>
              <h2 className="text-xl font-bold text-base-content mb-1">Product Not Found</h2>
              <p className="text-sm text-base-content/60 mb-6">{error}</p>
              <Link to="/" className="btn btn-primary btn-sm gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back to Marketplace
              </Link>
            </div>
          </div>
        )}

        {/* Product Details */}
        {product && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Product Info (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Header Card */}
              <div className="card bg-base-100 shadow-md border border-base-content/5">
                <div className="card-body p-6 sm:p-8">
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="badge badge-ghost gap-1.5 text-xs font-medium">
                      <Tag className="w-3 h-3" />
                      {product.category}
                    </span>
                    <span
                      className={
                        "badge font-semibold " +
                        (product.condition === "New"
                          ? "badge-success text-success-content"
                          : "badge-warning text-warning-content")
                      }
                    >
                      {product.condition === "New" ? "Brand New" : "Used / Pre-owned"}
                    </span>
                    <span
                      className={`badge font-semibold text-xs ${
                        (product.stock || 1) <= 1
                          ? "badge-error text-error-content"
                          : "badge-primary text-primary-content"
                      }`}
                    >
                      <Layers className="w-3 h-3 mr-1" />
                      {(product.stock || 1) <= 1
                        ? "Only 1 unit in stock!"
                        : `${product.stock} units available`}
                    </span>
                    <span className="badge badge-ghost gap-1.5 text-xs">
                      <Clock className="w-3 h-3" />
                      Listed {getTimeAgo(product.createdAt)}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content leading-tight">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <p className="text-3xl sm:text-4xl font-black text-primary mt-3">
                    ${Number(product.price).toFixed(2)}
                  </p>

                  {/* Divider */}
                  <div className="divider my-4" />

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-bold text-base-content uppercase tracking-wider mb-2">
                      Description
                    </h3>
                    <p className="text-base-content/80 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Details Card */}
              <div className="card bg-base-100 shadow-md border border-base-content/5">
                <div className="card-body p-6 sm:p-8">
                  <h3 className="text-sm font-bold text-base-content uppercase tracking-wider mb-4">
                    Product Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {/* Category */}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                        <Tag className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 font-medium">Category</p>
                        <p className="text-sm font-semibold text-base-content">{product.category}</p>
                      </div>
                    </div>

                    {/* Condition */}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                        <BadgeCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 font-medium">Condition</p>
                        <p className="text-sm font-semibold text-base-content">{product.condition}</p>
                      </div>
                    </div>

                    {/* Owner Count (for Used items) */}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 font-medium">Previous Owners</p>
                        <p className="text-sm font-semibold text-base-content">
                          {product.condition === "New"
                            ? "None (Brand New)"
                            : (product.ownerCount || 0) + (product.ownerCount === 1 ? " owner" : " owners")}
                        </p>
                      </div>
                    </div>

                    {/* Date Listed */}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 font-medium">Date Listed</p>
                        <p className="text-sm font-semibold text-base-content">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Unknown"}
                        </p>
                      </div>
                    </div>

                    {/* Last Updated */}
                    {product.updatedAt && product.updatedAt !== product.createdAt && (
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-base-content/50 font-medium">Last Updated</p>
                          <p className="text-sm font-semibold text-base-content">
                            {new Date(product.updatedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Product ID */}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 font-medium">Product ID</p>
                        <p className="text-xs font-mono text-base-content/70">{product._id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Seller + Action Buttons (1/3 width) */}
            <div className="space-y-6">
              {/* Action Buttons Card */}
              <div className="card bg-base-100 shadow-md border border-base-content/5 sticky top-24">
                <div className="card-body p-6 space-y-3">
                  <p className="text-3xl font-black text-primary text-center">
                    ${Number(product.price).toFixed(2)}
                  </p>

                  {isOwnProduct ? (
                    /* Seller viewing their own product */
                    <div className="text-center py-3 space-y-2">
                      <div className="badge badge-info gap-1.5 py-3 px-4 font-medium">
                        <Package className="w-4 h-4" />
                        This is your listing
                      </div>
                      <p className="text-xs text-base-content/50">
                        You cannot buy your own product.
                      </p>
                    </div>
                  ) : (
                    /* Regular buyer view */
                    <>
                      {/* Quantity Selector */}
                      <div className="bg-base-200/60 p-3.5 rounded-xl space-y-2 border border-base-content/10">
                        <div className="flex items-center justify-between text-xs font-semibold text-base-content/70">
                          <span>Select Quantity:</span>
                          <span className="text-base-content/50">
                            {maxStock} {maxStock === 1 ? "unit" : "units"} available
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center border border-base-content/20 rounded-lg bg-base-100">
                            <button
                              type="button"
                              onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                              disabled={selectedQuantity <= 1}
                              className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-base-content">
                              {selectedQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedQuantity((q) => Math.min(maxStock, q + 1))}
                              disabled={selectedQuantity >= maxStock}
                              className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-[11px] text-base-content/50">
                              Subtotal ({selectedQuantity} {selectedQuantity === 1 ? "unit" : "units"}):
                            </p>
                            <p className="text-primary font-black text-lg">
                              ${(Number(product.price) * selectedQuantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary w-full gap-2 shadow-md hover:scale-[1.01] transition-transform"
                        onClick={handleOpenBuyNow}
                        disabled={maxStock <= 0}
                      >
                        <Zap className="w-5 h-5" />
                        Buy Now {selectedQuantity > 1 ? `(${selectedQuantity} units)` : ""}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-primary w-full gap-2 hover:scale-[1.01] transition-transform"
                        onClick={handleAddToCart}
                        disabled={maxStock <= 0}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart {selectedQuantity > 1 ? `(${selectedQuantity} units)` : ""}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Seller Info Card */}
              <div className="card bg-base-100 shadow-md border border-base-content/5">
                <div className="card-body p-6">
                  <h3 className="text-sm font-bold text-base-content uppercase tracking-wider mb-4">
                    Seller Information
                  </h3>

                  <div className="space-y-4">
                    {/* Seller Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {product.seller?.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50">Seller</p>
                        <p className="text-sm font-bold text-base-content">
                          {product.seller?.name || "Unknown Seller"}
                        </p>
                      </div>
                    </div>

                    <div className="divider my-0" />

                    {/* Username */}
                    {product.seller?.username && (
                      <div className="flex items-center gap-3">
                        <AtSign className="w-4 h-4 text-base-content/40 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-base-content/50">Username</p>
                          <p className="text-sm text-base-content font-medium">@{product.seller.username}</p>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {product.seller?.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-base-content/40 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-base-content/50">Email</p>
                          <p className="text-sm text-base-content font-medium">{product.seller.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {product.seller?.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-base-content/40 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-base-content/50">Phone</p>
                          <p className="text-sm text-base-content font-medium">{product.seller.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkout / Buy Now Modal */}
      {isCheckoutOpen && product && (
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

            {/* Order Item Summary */}
            <div className="bg-base-200/60 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-base-content line-clamp-1">{product.name}</h4>
                <div className="flex items-center gap-2 text-xs text-base-content/60">
                  <span>Unit: ${Number(product.price).toFixed(2)}</span>
                  <span>•</span>
                  <span>Qty: {selectedQuantity}</span>
                  <span>•</span>
                  <span>{product.condition}</span>
                </div>
              </div>
              <p className="text-lg font-black text-primary flex-shrink-0">
                ${(Number(product.price) * selectedQuantity).toFixed(2)}
              </p>
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
              {/* Conditional Payment Fields */}
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
                    You can inspect the product package upon arrival and hand the exact cash amount (${Number(product.price).toFixed(2)}) to our courier partner.
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
                  <span>Product Price ({selectedQuantity} {selectedQuantity === 1 ? "unit" : "units"}):</span>
                  <span>${(Number(product.price) * selectedQuantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base-content/70">
                  <span>Delivery Fee:</span>
                  <span className="text-success font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-base-content pt-1 border-t border-base-content/5">
                  <span>Total Amount:</span>
                  <span className="text-primary font-black text-base">
                    ${(Number(product.price) * selectedQuantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
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
                      <span>
                        {paymentMethod === "card"
                          ? `Pay & Order (${selectedQuantity})`
                          : `Confirm Order (${selectedQuantity})`}
                      </span>
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

export default SeeProduct;
