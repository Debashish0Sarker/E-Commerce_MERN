import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X, Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import AIChatbot from "../components/AIChatbot";
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
  const [maxPrice, setMaxPrice] = useState(null);
  const [minPrice, setMinPrice] = useState(null);
  const [minStock, setMinStock] = useState(null);

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

  // Handle AI extracted filters from chatbot
  const handleApplyAIFilters = (filters) => {
    if (!filters) return;

    if (filters.category && filters.category !== "All") {
      setSelectedCategory(filters.category);
    }
    if (filters.condition) {
      setSelectedCondition(filters.condition);
    }
    if (filters.searchKeyword) {
      setSearchQuery(filters.searchKeyword);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      setMaxPrice(filters.maxPrice);
    }
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      setMinPrice(filters.minPrice);
    }
    if (filters.minStock !== undefined && filters.minStock !== null) {
      setMinStock(filters.minStock);
    }
    if (filters.sortBy) {
      if (filters.sortBy === "price-low") setSortBy("price-asc");
      else if (filters.sortBy === "price-high") setSortBy("price-desc");
      else if (filters.sortBy === "newest") setSortBy("newest");
      else if (filters.sortBy === "stock") setSortBy("stock");
    }

    // Smoothly scroll to product results
    const el = document.getElementById("products-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter & Sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesCondition =
        selectedCondition === "All" || product.condition === selectedCondition;

      const matchesMaxPrice =
        maxPrice === null || product.price <= maxPrice;

      const matchesMinPrice =
        minPrice === null || product.price >= minPrice;

      const matchesMinStock =
        minStock === null || (product.stock || 1) >= minStock;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCondition &&
        matchesMaxPrice &&
        matchesMinPrice &&
        matchesMinStock
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "stock") return (b.stock || 1) - (a.stock || 1);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // newest first
    });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedCondition("All");
    setSortBy("newest");
    setMaxPrice(null);
    setMinPrice(null);
    setMinStock(null);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All" ||
    selectedCondition !== "All" ||
    maxPrice !== null ||
    minPrice !== null ||
    minStock !== null;

  // Price/stock chips set by the assistant, rendered next to the result count.
  const activeChips = [
    maxPrice !== null && { key: "max", label: `Under $${maxPrice}`, clear: () => setMaxPrice(null) },
    minPrice !== null && { key: "min", label: `Over $${minPrice}`, clear: () => setMinPrice(null) },
    minStock !== null && { key: "stock", label: `${minStock}+ in stock`, clear: () => setMinStock(null) },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />

      {/* Masthead */}
      <section className="border-b border-base-300">
        <div className="mx-auto max-w-[84rem] px-5 sm:px-8 pt-10 pb-0">
          <div className="max-w-2xl">
            <h1 className="font-display text-[2.1rem] sm:text-[2.6rem] leading-[1.08] font-semibold tracking-tightish text-base-content">
              Everything, second-hand and new
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-base-content/60">
              Listings from independent sellers and shops alike. Search by item,
              category, or the person selling it.
            </p>
          </div>

          {/* Search */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-base-content/35 pointer-events-none" />
              <input
                type="search"
                placeholder="Search listings"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-10 rounded-box border border-base-300 bg-base-200/60 text-[15px] text-base-content placeholder:text-base-content/35 focus:bg-base-100 focus:border-primary focus:outline-none transition-colors [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-base-content/40 hover:text-base-content hover:bg-base-300 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="mt-7 -mb-px flex items-center gap-6 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={
                  "shrink-0 pb-3 text-sm whitespace-nowrap border-b-2 transition-colors " +
                  (selectedCategory === cat
                    ? "border-base-content text-base-content font-medium"
                    : "border-transparent text-base-content/50 hover:text-base-content/80")
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <main
        id="products-section"
        className="flex-1 mx-auto max-w-[84rem] w-full px-5 sm:px-8 py-7"
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-sm text-base-content/60">
              <span className="tnum font-medium text-base-content">{filteredProducts.length}</span>{" "}
              {filteredProducts.length === 1 ? "listing" : "listings"}
            </p>

            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-badge border border-base-300 bg-base-200/70 text-xs text-base-content/70 hover:text-base-content hover:border-base-content/25 transition-colors"
              >
                {chip.label}
                <X className="w-3 h-3" />
              </button>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-base-content/50 hover:text-base-content underline underline-offset-4 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="h-9 px-2.5 pr-7 rounded-btn border border-base-300 bg-base-100 text-sm text-base-content/75 hover:border-base-content/25 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              aria-label="Filter by condition"
            >
              <option value="All">Any condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-2.5 pr-7 rounded-btn border border-base-300 bg-base-100 text-sm text-base-content/75 hover:border-base-content/25 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              aria-label="Sort listings"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
              <option value="stock">Most in stock</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-box bg-base-200" />
                <div className="mt-3 h-3.5 w-3/4 rounded bg-base-200" />
                <div className="mt-2 h-3 w-1/3 rounded bg-base-200" />
                <div className="mt-3 h-4 w-1/4 rounded bg-base-200" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
            {filteredProducts.map((product) => {
              const stock = product.stock ?? 1;
              return (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="group block"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] rounded-box overflow-hidden bg-base-200 border border-base-300/60">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center">
                        <span className="font-display text-sm text-base-content/25">
                          {product.category}
                        </span>
                      </div>
                    )}

                    {product.condition !== "New" && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-badge bg-base-100/90 backdrop-blur text-[11px] font-medium text-base-content/75">
                        Used · {product.ownerCount || 1} owner
                        {(product.ownerCount || 1) === 1 ? "" : "s"}
                      </span>
                    )}

                    {stock <= 1 && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-badge bg-accent text-accent-content text-[11px] font-medium">
                        Last one
                      </span>
                    )}
                  </div>

                  {/* Detail */}
                  <div className="mt-3">
                    <h2 className="text-[15px] leading-snug font-medium text-base-content line-clamp-2 group-hover:underline underline-offset-[3px] decoration-base-content/30">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-[13px] text-base-content/50 line-clamp-1">
                      {product.seller?.name || "Private seller"}
                      {product.category ? ` · ${product.category}` : ""}
                    </p>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-[17px] font-semibold tnum text-base-content">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {stock > 1 && (
                        <span className="text-xs text-base-content/45 tnum">
                          {stock} available
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty */
          <div className="py-24 text-center">
            <p className="font-display text-xl text-base-content">
              {hasActiveFilters ? "Nothing matched that" : "No listings yet"}
            </p>
            <p className="mt-2 text-sm text-base-content/55 max-w-sm mx-auto">
              {hasActiveFilters
                ? "Try a broader search or clear a filter or two."
                : "Nobody has listed anything so far. It could be you."}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-sm btn-outline normal-case font-medium"
                >
                  Clear filters
                </button>
              )}
              {isSeller && (
                <Link to="/create" className="btn btn-sm btn-primary normal-case font-medium gap-1.5">
                  <Plus className="w-4 h-4" />
                  List an item
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-base-300 mt-8">
        <div className="mx-auto max-w-[84rem] px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-display text-base font-semibold tracking-tightish text-base-content">
            Fantastic Buys
          </p>
          <p className="text-xs text-base-content/45">
            A student marketplace project. Orders here are not real.
          </p>
        </div>
      </footer>

      <AIChatbot onApplyFilters={handleApplyAIFilters} />
    </div>
  );
};

export default Homepage;
