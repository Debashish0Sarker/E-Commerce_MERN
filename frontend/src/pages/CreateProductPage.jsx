import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PlusCircle, ArrowLeft, Package, DollarSign, Tag, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import axiosInstance from "../lib/axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "Electronics",
  "Fashion & Clothing",
  "Vehicles & Motors",
  "Home & Furniture",
  "Books & Stationery",
  "Sports & Outdoors",
  "Toys & Hobbies",
  "Other",
];

const CreateProductPage = () => {
  const navigate = useNavigate();
  const { user, isSeller, isSellerMode, switchMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Electronics",
    description: "",
    condition: "New",
    ownerCount: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ownerCount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSeller) {
      toast.error("You must have a seller account to upload products");
      return;
    }

    if (!isSellerMode) {
      toast.error("Please switch to Seller mode from the navbar to upload products");
      return;
    }

    const { name, price, category, description, condition, ownerCount } = formData;
    if (!name || !price || !category || !description || !condition) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (condition === "Used" && (ownerCount === undefined || ownerCount === null || ownerCount < 1)) {
      toast.error("For used items, please enter the number of previous owners (at least 1)");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post("/products/upload", {
        ...formData,
        price: Number(formData.price),
        ownerCount: condition === "New" ? 0 : Number(ownerCount),
      });

      toast.success("Product uploaded successfully!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to upload product";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-base-content/70 hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        {!isSellerMode && isSeller && (
          <div className="alert alert-warning mb-6">
            <span>You are currently in <strong>Customer mode</strong>. Switch to Seller mode to publish products.</span>
            <button
              type="button"
              onClick={() => switchMode("seller")}
              className="btn btn-sm btn-primary"
            >
              Switch to Seller Mode
            </button>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl border border-base-content/5">
          <div className="card-body p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-content/10">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-base-content">List a New Product</h1>
                <p className="text-sm text-base-content/60">Fill in the details below to publish your listing</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Product Title *</span>
                </label>
                <div className="relative">
                  <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                    className="input input-bordered w-full pl-10"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Price & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Price ($) *</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      placeholder="99.99"
                      className="input input-bordered w-full pl-10"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Category *</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none" />
                    <select
                      name="category"
                      className="select select-bordered w-full pl-10"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Condition & Previous Owners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Condition *</span>
                  </label>
                  <select
                    name="condition"
                    className="select select-bordered w-full"
                    value={formData.condition}
                    onChange={handleChange}
                  >
                    <option value="New">Brand New</option>
                    <option value="Used">Used / Pre-owned</option>
                  </select>
                </div>

                {formData.condition === "Used" && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Previous Owners *</span>
                      <span className="label-text-alt text-base-content/50">Count</span>
                    </label>
                    <input
                      type="number"
                      name="ownerCount"
                      min="1"
                      placeholder="1"
                      className="input input-bordered w-full"
                      value={formData.ownerCount || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description *</span>
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Provide details about the item's condition, features, warranty, and specifications..."
                    className="textarea textarea-bordered w-full"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="btn btn-primary w-full gap-2 shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>Publish Product Listing</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;
