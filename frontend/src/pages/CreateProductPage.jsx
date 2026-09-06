import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
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
  const { isSeller, isSellerMode, switchMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Electronics",
    description: "",
    condition: "New",
    ownerCount: 0,
    stock: 1,
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ownerCount" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
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
        stock: Math.max(1, Number(formData.stock) || 1),
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

  const inputClass =
    "w-full h-11 px-3.5 rounded-btn border border-base-300 bg-base-100 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      <div className="mx-auto max-w-[42rem] px-5 sm:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-base-content/55 hover:text-base-content transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All listings
        </Link>

        <header className="mt-5 mb-8 pb-6 border-b border-base-300">
          <h1 className="font-display text-[2rem] leading-none font-semibold tracking-tightish text-base-content">
            List an item
          </h1>
          <p className="mt-2.5 text-sm text-base-content/55">
            The more you say about condition and history, the fewer questions
            buyers will ask you.
          </p>
        </header>

        {!isSellerMode && isSeller && (
          <div className="mb-8 rounded-box border border-warning/40 bg-warning/[0.08] p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-base-content/80">
              You&rsquo;re browsing as a customer right now.
            </p>
            <button
              type="button"
              onClick={() => switchMode("seller")}
              className="btn btn-sm btn-neutral normal-case font-medium"
            >
              Switch to seller
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-9">
          {/* The item */}
          <fieldset className="space-y-5">
            <legend className="eyebrow mb-4">The item</legend>

            <div>
              <label htmlFor="name" className="field-label">What are you selling?</label>
              <input
                id="name"
                type="text"
                name="name"
                className={inputClass}
                value={formData.name}
                onChange={handleChange}
                required
              />
              <p className="hint mt-1.5">
                Make, model and size if they apply — that&rsquo;s what people search for.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="field-label">Description</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                className="w-full px-3.5 py-3 rounded-btn border border-base-300 bg-base-100 text-sm leading-relaxed text-base-content focus:outline-none focus:border-primary transition-colors resize-y"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <p className="hint mt-1.5">
                Wear and tear, what&rsquo;s in the box, whether it&rsquo;s still under warranty.
              </p>
            </div>
          </fieldset>

          {/* Photo */}
          <fieldset>
            <legend className="eyebrow mb-4">Photo</legend>

            {formData.image ? (
              <div className="relative w-full max-w-sm">
                <div className="aspect-[4/3] rounded-box overflow-hidden border border-base-300 bg-base-200">
                  <img
                    src={formData.image}
                    alt="Listing preview"
                    className="w-full h-full object-cover"
                    onError={() => toast.error("Could not load image from this URL")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-base-100/90 backdrop-blur border border-base-300 text-base-content/60 hover:text-error transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 h-28 rounded-box border border-dashed border-base-300 text-sm text-base-content/55 hover:border-base-content/30 hover:text-base-content/75 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Choose a photo from your device
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                <div className="flex items-center gap-3 text-xs text-base-content/35">
                  <span className="h-px flex-1 bg-base-300" />
                  or paste a link
                  <span className="h-px flex-1 bg-base-300" />
                </div>

                <input
                  type="url"
                  name="image"
                  className={inputClass}
                  value={formData.image}
                  onChange={handleChange}
                  aria-label="Image URL"
                />
                <p className="hint">JPG, PNG or WebP, up to 5MB.</p>
              </div>
            )}
          </fieldset>

          {/* Price and stock */}
          <fieldset className="space-y-5">
            <legend className="eyebrow mb-4">Price and stock</legend>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="field-label">Price</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-base-content/40">$</span>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    className={inputClass + " pl-7 tnum"}
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="field-label">How many</label>
                <input
                  id="stock"
                  type="number"
                  name="stock"
                  min="1"
                  className={inputClass + " tnum"}
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="field-label">Category</label>
                <select
                  id="category"
                  name="category"
                  className={inputClass + " cursor-pointer"}
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
          </fieldset>

          {/* Condition */}
          <fieldset>
            <legend className="eyebrow mb-4">Condition</legend>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "New", label: "Brand new", blurb: "Unused, sealed or as sold." },
                { value: "Used", label: "Used", blurb: "Has had at least one owner." },
              ].map((option) => {
                const active = formData.condition === option.value;
                return (
                  <label
                    key={option.value}
                    className={
                      "cursor-pointer rounded-box border p-3.5 transition-colors " +
                      (active
                        ? "border-primary bg-primary/[0.06]"
                        : "border-base-300 hover:border-base-content/25")
                    }
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={option.value}
                      checked={active}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span
                      className={
                        "block text-sm font-medium " +
                        (active ? "text-primary" : "text-base-content")
                      }
                    >
                      {option.label}
                    </span>
                    <span className="block mt-1 text-xs leading-snug text-base-content/55">
                      {option.blurb}
                    </span>
                  </label>
                );
              })}
            </div>

            {formData.condition === "Used" && (
              <div className="mt-4 max-w-[12rem]">
                <label htmlFor="ownerCount" className="field-label">Previous owners</label>
                <input
                  id="ownerCount"
                  type="number"
                  name="ownerCount"
                  min="1"
                  className={inputClass + " tnum"}
                  value={formData.ownerCount || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </fieldset>

          <div className="pt-2 border-t border-base-300">
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto sm:px-8 mt-6 normal-case font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Publish listing"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
