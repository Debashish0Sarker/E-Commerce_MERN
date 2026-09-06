import { GoogleGenAI } from "@google/genai";
import Product from "../models/Product.js";

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

// Fallback rule-based semantic parser when GEMINI_API_KEY is not configured
const parseSemantics = (query, catalog) => {
  const q = query.toLowerCase();

  let category = "All";
  for (const cat of CATEGORIES) {
    const cleanCat = cat.toLowerCase().split("&")[0].trim();
    if (
      q.includes(cleanCat) ||
      (cat.includes("Clothing") &&
        (q.includes("cloth") ||
          q.includes("shoe") ||
          q.includes("shirt") ||
          q.includes("dress") ||
          q.includes("sneaker") ||
          q.includes("jacket")))
    ) {
      category = cat;
      break;
    }
  }

  let condition = null;
  if (q.includes("brand new") || (q.includes("new") && !q.includes("newest"))) {
    condition = "New";
  } else if (q.includes("used") || q.includes("pre-owned") || q.includes("second hand")) {
    condition = "Used";
  }

  let maxPrice = null;
  let minPrice = null;
  const underMatch = q.match(/(?:under|less than|below|cheaper than|max|maximum)\s*\$?(\d+(?:\.\d+)?)/i);
  if (underMatch) {
    maxPrice = parseFloat(underMatch[1]);
  }
  const overMatch = q.match(/(?:over|more than|above|at least|minimum)\s*\$?(\d+(?:\.\d+)?)/i);
  if (overMatch) {
    minPrice = parseFloat(overMatch[1]);
  }
  const betweenMatch = q.match(/between\s*\$?(\d+)\s*(?:and|to|-)\s*\$?(\d+)/i);
  if (betweenMatch) {
    minPrice = parseFloat(betweenMatch[1]);
    maxPrice = parseFloat(betweenMatch[2]);
  }

  let minStock = null;
  const stockMatch = q.match(/(\d+)\s*(?:in stock|units|items|stock)/i);
  if (stockMatch) {
    minStock = parseInt(stockMatch[1], 10);
  }

  let sortBy = "default";
  if (q.includes("cheapest") || q.includes("lowest price") || q.includes("inexpensive") || q.includes("affordable")) {
    sortBy = "price-low";
  } else if (q.includes("expensive") || q.includes("highest price") || q.includes("premium")) {
    sortBy = "price-high";
  } else if (q.includes("newest") || q.includes("latest") || q.includes("recent")) {
    sortBy = "newest";
  } else if (q.includes("most stock") || q.includes("most in stock")) {
    sortBy = "stock";
  }

  // Filter catalog based on extracted parameters
  let matches = catalog.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (condition && p.condition !== condition) return false;
    if (maxPrice !== null && p.price > maxPrice) return false;
    if (minPrice !== null && p.price < minPrice) return false;
    if (minStock !== null && (p.stock || 1) < minStock) return false;
    return true;
  });

  // Keyword check
  const nonFilterWords = [
    "show", "me", "find", "i", "want", "need", "give", "the", "with",
    "a", "an", "and", "or", "for", "please", "can", "you", "under",
    "over", "dollar", "dollars", "new", "used", "stock", "in", "item", "items", "product", "products",
    "brand", "price", "cheapest", "expensive", "best", "affordable", "available", "good"
  ];
  const words = q
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !nonFilterWords.includes(w) && !category.toLowerCase().includes(w));

  if (words.length > 0 && matches.length === catalog.length) {
    matches = matches.filter((p) => {
      const pText = `${p.name} ${p.description} ${p.category}`.toLowerCase();
      return words.some((word) => pText.includes(word));
    });
  }

  // Sorting
  if (sortBy === "price-low") {
    matches.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    matches.sort((a, b) => b.price - a.price);
  } else if (sortBy === "stock") {
    matches.sort((a, b) => (b.stock || 1) - (a.stock || 1));
  }

  let reply = "";
  if (matches.length > 0) {
    reply = `I found ${matches.length} product${
      matches.length === 1 ? "" : "s"
    } matching your request. I've highlighted them for you below and applied the filters to your dashboard!`;
  } else {
    reply =
      "I couldn't find any products matching those exact criteria right now, but I've updated the dashboard filters so you can explore similar items!";
  }

  return {
    reply,
    filters: {
      category,
      condition,
      maxPrice,
      minPrice,
      minStock,
      searchKeyword: words[0] || "",
      sortBy,
    },
    matchedProductIds: matches.map((m) => m._id.toString()),
  };
};

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch all active products
    const products = await Product.find({ stock: { $gt: 0 } })
      .populate("seller", "name username")
      .lean();

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Try Gemini API if GEMINI_API_KEY is configured
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const catalogSummary = products.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          price: p.price,
          category: p.category,
          condition: p.condition,
          stock: p.stock,
          ownerCount: p.ownerCount,
          description: p.description?.substring(0, 100),
        }));

        const prompt = `You are an AI Shopping Assistant for an online e-commerce platform.
Current store inventory:
${JSON.stringify(catalogSummary, null, 2)}

Available Categories: ${CATEGORIES.join(", ")}.

User query: "${message}"

Your task:
1. 'reply': Provide a warm, concise, conversational recommendation answering the user. Mention 1-3 matching products by name and price.
2. 'filters': Extract structured filter values:
   - 'category': Exact category name or 'All'
   - 'condition': 'New', 'Used', or null
   - 'maxPrice': number or null
   - 'minPrice': number or null
   - 'minStock': number or null
   - 'searchKeyword': brief keyword string or ""
   - 'sortBy': 'price-low', 'price-high', 'newest', 'stock', or 'default'
3. 'matchedProductIds': Array of product string 'id' values from the inventory that best match the query.

Respond ONLY with valid JSON matching this schema:
{
  "reply": "Conversational reply text",
  "filters": {
    "category": "All",
    "condition": null,
    "maxPrice": null,
    "minPrice": null,
    "minStock": null,
    "searchKeyword": "",
    "sortBy": "default"
  },
  "matchedProductIds": ["id1", "id2"]
}`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const parsed = JSON.parse(geminiRes.text);

        const matchedProducts = products.filter((p) =>
          parsed.matchedProductIds?.includes(p._id.toString())
        );

        return res.json({
          success: true,
          reply: parsed.reply,
          filters: parsed.filters,
          products: matchedProducts.length > 0 ? matchedProducts : products.slice(0, 4),
          source: "gemini",
        });
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to semantic parser:", geminiError.message);
      }
    }

    // 2. Fallback to built-in semantic parser
    const result = parseSemantics(message, products);
    const matchedProducts = products.filter((p) =>
      result.matchedProductIds.includes(p._id.toString())
    );

    return res.json({
      success: true,
      reply: result.reply,
      filters: result.filters,
      products: matchedProducts,
      source: "semantic-fallback",
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
};