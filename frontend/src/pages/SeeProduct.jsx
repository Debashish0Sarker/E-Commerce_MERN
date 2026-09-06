import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import CheckoutDialog from "../components/CheckoutDialog";
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

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Key/value rows under the description.
  const specs = product
    ? [
        ["Category", product.category],
        ["Condition", product.condition === "New" ? "Brand new" : "Used"],
        [
          "Previous owners",
          product.condition === "New"
            ? "None"
            : `${product.ownerCount || 0} ${(product.ownerCount || 0) === 1 ? "owner" : "owners"}`,
        ],
        ["Listed", product.createdAt ? formatDate(product.createdAt) : "Unknown"],
        product.updatedAt && product.updatedAt !== product.createdAt
          ? ["Last updated", formatDate(product.updatedAt)]
          : null,
        ["Reference", product._id],
      ].filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-[76rem] w-full px-5 sm:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/55 hover:text-base-content transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All listings
        </Link>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-10 mt-6 animate-pulse">
            <div className="aspect-[4/3] rounded-box bg-base-200" />
            <div className="space-y-4 pt-2">
              <div className="h-7 w-3/4 rounded bg-base-200" />
              <div className="h-5 w-1/4 rounded bg-base-200" />
              <div className="h-24 w-full rounded bg-base-200" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="py-24 text-center">
            <p className="font-display text-xl text-base-content">
              This listing isn&rsquo;t here
            </p>
            <p className="mt-2 text-sm text-base-content/55">{error}</p>
            <Link to="/" className="btn btn-outline btn-sm mt-6 normal-case font-medium">
              Back to listings
            </Link>
          </div>
        )}

        {/* Product */}
        {product && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-x-12 gap-y-8 mt-6 items-start">
            {/* Left: image + copy */}
            <div>
              <div className="aspect-[4/3] rounded-box overflow-hidden bg-base-200 border border-base-300/60">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center gap-2 text-base-content/25">
                    <ShoppingBag className="w-8 h-8 stroke-[1.25] mx-auto" />
                    <span className="font-display text-sm">{product.category}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <section className="mt-10">
                <h2 className="eyebrow mb-3">Description</h2>
                <p className="text-[15px] leading-[1.75] text-base-content/80 whitespace-pre-wrap max-w-prose">
                  {product.description}
                </p>
              </section>

              {/* Specs */}
              <section className="mt-10">
                <h2 className="eyebrow mb-1">Details</h2>
                <dl className="divide-y divide-base-300/70">
                  {specs.map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-6 py-3">
                      <dt className="text-sm text-base-content/50 shrink-0">{label}</dt>
                      <dd
                        className={
                          "text-sm text-base-content text-right " +
                          (label === "Reference" ? "font-mono text-xs text-base-content/50 break-all" : "")
                        }
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>

            {/* Right: buy panel */}
            <div className="lg:sticky lg:top-[76px] space-y-6">
              <div>
                <p className="text-sm text-base-content/50">
                  {product.condition === "New" ? "Brand new" : "Used"}
                  {" · "}
                  Listed {getTimeAgo(product.createdAt)}
                </p>

                <h1 className="mt-2 font-display text-[1.9rem] leading-[1.15] font-semibold tracking-tightish text-base-content">
                  {product.name}
                </h1>

                <p className="mt-3 text-[1.75rem] leading-none font-semibold tnum text-base-content">
                  ${Number(product.price).toFixed(2)}
                </p>

                <p className="mt-2.5 text-sm text-base-content/55 tnum">
                  {maxStock <= 0
                    ? "Out of stock"
                    : maxStock === 1
                    ? "Only one left"
                    : `${maxStock} available`}
                </p>
              </div>

              {isOwnProduct ? (
                <div className="rounded-box border border-base-300 bg-base-200/50 p-4">
                  <p className="text-sm font-medium text-base-content">
                    This is your listing
                  </p>
                  <p className="mt-1 text-sm text-base-content/55">
                    You can&rsquo;t buy from yourself, but this is how buyers see it.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Quantity */}
                  <div className="flex items-center justify-between gap-4 py-3 border-y border-base-300">
                    <span className="text-sm text-base-content/60">Quantity</span>
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center rounded-btn border border-base-300">
                        <button
                          type="button"
                          onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                          disabled={selectedQuantity <= 1}
                          className="w-8 h-8 grid place-items-center text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-l-btn transition-colors disabled:opacity-25 disabled:hover:bg-transparent"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm tnum font-medium text-base-content">
                          {selectedQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedQuantity((q) => Math.min(maxStock, q + 1))}
                          disabled={selectedQuantity >= maxStock}
                          className="w-8 h-8 grid place-items-center text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-r-btn transition-colors disabled:opacity-25 disabled:hover:bg-transparent"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {selectedQuantity > 1 && (
                        <span className="text-sm font-medium tnum text-base-content">
                          ${(Number(product.price) * selectedQuantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary w-full normal-case font-medium"
                    onClick={handleOpenBuyNow}
                    disabled={maxStock <= 0}
                  >
                    Buy now
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline w-full normal-case font-medium"
                    onClick={handleAddToCart}
                    disabled={maxStock <= 0}
                  >
                    Add to cart
                  </button>

                  <p className="hint text-center pt-1">Free delivery on every order.</p>
                </div>
              )}

              {/* Seller */}
              <section className="rounded-box border border-base-300 p-5">
                <h2 className="eyebrow mb-4">Sold by</h2>

                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-base-200 border border-base-300 grid place-items-center text-sm font-medium text-base-content/70">
                    {product.seller?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-base-content truncate">
                      {product.seller?.name || "Unknown seller"}
                    </p>
                    {product.seller?.username && (
                      <p className="text-xs text-base-content/50 truncate">
                        @{product.seller.username}
                      </p>
                    )}
                  </div>
                </div>

                {(product.seller?.email || product.seller?.phoneNumber) && (
                  <dl className="mt-4 pt-4 border-t border-base-300/70 space-y-2">
                    {product.seller?.email && (
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-xs text-base-content/50">Email</dt>
                        <dd className="text-xs text-base-content/80 truncate">
                          {product.seller.email}
                        </dd>
                      </div>
                    )}
                    {product.seller?.phoneNumber && (
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-xs text-base-content/50">Phone</dt>
                        <dd className="text-xs text-base-content/80 tnum">
                          {product.seller.phoneNumber}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {product && (
        <CheckoutDialog
          open={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          lines={[
            {
              id: product._id,
              name: product.name,
              meta: `${selectedQuantity} × $${Number(product.price).toFixed(2)} · ${
                product.condition === "New" ? "New" : "Used"
              }`,
              amount: Number(product.price) * selectedQuantity,
            },
          ]}
          total={Number(product.price) * selectedQuantity}
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
      )}
    </div>
  );
};

export default SeeProduct;
