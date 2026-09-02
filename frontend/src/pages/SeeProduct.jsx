import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import Navbar from "../components/Navbar";
import axiosInstance from "../lib/axios";
import { useAuth } from "../context/AuthContext";

const SeeProduct = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the logged-in user is the seller of this product
  const isOwnProduct = user && product?.seller?._id === user.id;

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
                      className={"badge font-semibold " + (
                        product.condition === "New"
                          ? "badge-success text-success-content"
                          : "badge-warning text-warning-content"
                      )}
                    >
                      {product.condition === "New" ? "Brand New" : "Used / Pre-owned"}
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
                      <button
                        type="button"
                        className="btn btn-primary w-full gap-2 shadow-md"
                        onClick={() => alert("Buy Now feature coming soon!")}
                      >
                        <Zap className="w-5 h-5" />
                        Buy Now
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-primary w-full gap-2"
                        onClick={() => alert("Add to Cart feature coming soon!")}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>

                      <p className="text-[11px] text-base-content/40 text-center pt-1">
                        These features will be available soon.
                      </p>
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
    </div>
  );
};

export default SeeProduct;
