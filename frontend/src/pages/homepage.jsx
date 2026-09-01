import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Package, 
  Tag, 
  User, 
  Sparkles, 
  PlusCircle, 
  ArrowUpDown 
} from "lucide-react";
import Navbar from "../components/Navbar";
import axiosInstance from "../lib/axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion & Clothing",
  "Vehicles & Motors",
  "Home & Furniture",
  "Books & Stationery",
  "Sports & Outdoors",
  "Toys & Hobbies",
  "Other",
];

const Homepage = () => {
  const { isSeller } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/products");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter & Sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesCondition =
        selectedCondition === "All" || product.condition === selectedCondition;

      return matchesSearch && matchesCategory && matchesCondition;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // newest first
    });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedCondition("All");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col">
      <Navbar />

      {/* Hero & Search Header Section */}
      <section className="bg-base-100 border-b border-base-content/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover & Shop Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-base-content">
            Find whatever you are looking for
          </h1>
          <p className="text-base-content/70 max-w-2xl mx-auto text-sm sm:text-base">
            Explore verified listings from individual and commercial sellers. Search by item name, category, or keywords.
          </p>

          {/* Search Bar Input */}
          <div className="pt-2 max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-base-content/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by title, category, description, or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered input-lg w-full pl-12 pr-10 rounded-2xl shadow-sm focus:outline-primary bg-base-200/60 focus:bg-base-100 transition-all text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 p-1 rounded-full text-base-content/40 hover:text-base-content hover:bg-base-300 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar justify-start sm:justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm rounded-full capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "btn-primary shadow-sm"
                    : "btn-ghost bg-base-200/70 hover:bg-base-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area: Filter Bar + Product Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Controls Row: Condition & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-base-content/10">
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>
              Showing <strong className="text-base-content">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "product" : "products"}
            </span>
            {(searchQuery || selectedCategory !== "All" || selectedCondition !== "All") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs link link-primary ml-2 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Condition Filter */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="text-base-content/60 font-medium">Condition:</span>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="select select-bordered select-xs sm:select-sm rounded-lg"
              >
                <option value="All">All Conditions</option>
                <option value="New">Brand New</option>
                <option value="Used">Used / Pre-owned</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-base-content/50" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-bordered select-xs sm:select-sm rounded-lg"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-md animate-pulse p-4 space-y-4">
                <div className="h-44 bg-base-300 rounded-xl w-full" />
                <div className="h-4 bg-base-300 rounded w-3/4" />
                <div className="h-3 bg-base-300 rounded w-1/2" />
                <div className="h-6 bg-base-300 rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-200 border border-base-content/5 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="card-body p-5 space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge badge-ghost badge-sm gap-1 text-xs">
                      <Tag className="w-3 h-3" />
                      {product.category}
                    </span>
                    <span
                      className={`badge badge-sm font-semibold ${
                        product.condition === "New"
                          ? "badge-success text-success-content"
                          : "badge-warning text-warning-content"
                      }`}
                    >
                      {product.condition === "New"
                        ? "Brand New"
                        : `Used (${product.ownerCount || 1} owners)`}
                    </span>
                  </div>

                  {/* Title & Price */}
                  <div>
                    <h2 className="card-title text-base sm:text-lg font-bold text-base-content line-clamp-1">
                      {product.name}
                    </h2>
                    <p className="text-2xl font-black text-primary mt-1">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Seller Info */}
                  <div className="pt-3 border-t border-base-content/10 flex items-center justify-between text-xs text-base-content/60">
                    <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                      <User className="w-3.5 h-3.5 text-base-content/40 flex-shrink-0" />
                      <span className="truncate">{product.seller?.name || "Seller"}</span>
                    </div>
                    <span className="text-[11px] text-base-content/40">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="card bg-base-100 shadow-sm border border-base-content/10 py-16 px-4 text-center max-w-lg mx-auto">
            <div className="p-4 bg-base-200 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4 text-base-content/40">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-base-content mb-1">No products found</h3>
            <p className="text-sm text-base-content/60 mb-6">
              {searchQuery || selectedCategory !== "All" || selectedCondition !== "All"
                ? "No listings match your active filters. Try adjusting your search query."
                : "No products have been listed yet. Be the first to create one!"}
            </p>

            <div className="flex items-center justify-center gap-3">
              {(searchQuery || selectedCategory !== "All" || selectedCondition !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-outline btn-sm"
                >
                  Clear Filters
                </button>
              )}
              {isSeller && (
                <Link to="/create" className="btn btn-primary btn-sm gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  List a Product
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Homepage;
