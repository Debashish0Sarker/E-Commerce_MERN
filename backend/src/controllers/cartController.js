import User from "../models/User.js";
import Product from "../models/Product.js";

// Helper to format and return populated cart
const getFormattedCart = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "cart.product",
    populate: { path: "seller", select: "name email username" },
  });

  if (!user) return [];

  // Filter out any products that may have been deleted
  const validCart = user.cart.filter((item) => item.product !== null);
  if (validCart.length !== user.cart.length) {
    user.cart = validCart;
    await user.save();
  }

  // Format so frontend receives expected product properties with quantity and stock
  return user.cart.map((item) => ({
    _id: item.product._id,
    name: item.product.name,
    price: item.product.price,
    category: item.product.category,
    condition: item.product.condition,
    ownerCount: item.product.ownerCount,
    description: item.product.description,
    seller: item.product.seller,
    quantity: item.quantity,
    stock: item.product.stock,
  }));
};

// @desc    Get current user's cart
// @route   GET /api/cart
export const getCart = async (req, res) => {
  try {
    const formattedCart = await getFormattedCart(req.user.id);
    res.status(200).json(formattedCart);
  } catch (error) {
    console.error("Failed to get cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/add
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user is the seller of this product
    if (product.seller.toString() === req.user.id.toString()) {
      return res.status(400).json({ error: "You cannot add your own product to your cart" });
    }

    // Check if product is in stock
    if (product.stock <= 0) {
      return res.status(400).json({ error: "This product is out of stock" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    const currentQty = existingIndex > -1 ? user.cart[existingIndex].quantity : 0;
    const requestedQty = Math.max(1, Math.floor(Number(quantity)));
    const totalQty = currentQty + requestedQty;

    // Disallow exceeding available product stock
    if (totalQty > product.stock) {
      const canAdd = product.stock - currentQty;
      if (canAdd <= 0) {
        return res.status(400).json({
          error: `You already have the maximum available stock (${product.stock} units) in your cart.`,
        });
      }
      return res.status(400).json({
        error: `Only ${product.stock} units in stock. You already have ${currentQty} in your cart, so you can only add ${canAdd} more.`,
      });
    }

    if (existingIndex > -1) {
      user.cart[existingIndex].quantity = totalQty;
    } else {
      user.cart.push({ product: productId, quantity: requestedQty });
    }

    await user.save();

    const formattedCart = await getFormattedCart(user._id);
    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("Failed to add to cart:", error);
    res.status(500).json({ error: "Failed to add product to cart" });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newQuantity = Math.floor(Number(quantity));

    if (newQuantity <= 0) {
      user.cart = user.cart.filter(
        (item) => item.product.toString() !== productId.toString()
      );
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product no longer available" });
      }

      // Check against product stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          error: `Cannot increase quantity beyond available stock (${product.stock} units).`,
        });
      }

      const item = user.cart.find(
        (item) => item.product.toString() === productId.toString()
      );
      if (item) {
        item.quantity = newQuantity;
      }
    }

    await user.save();

    const formattedCart = await getFormattedCart(user._id);
    res.status(200).json({
      success: true,
      cart: formattedCart,
    });
  } catch (error) {
    console.error("Failed to update cart quantity:", error);
    res.status(500).json({ error: "Failed to update quantity" });
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/remove/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await user.save();

    const formattedCart = await getFormattedCart(user._id);
    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    res.status(500).json({ error: "Failed to remove item" });
  }
};

// @desc    Clear all items in cart (used on checkout)
// @route   DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: [],
    });
  } catch (error) {
    console.error("Failed to clear cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};

// @desc    Checkout entire cart
// @route   POST /api/cart/checkout
export const checkoutCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ error: "Your cart is empty" });
    }

    // 1. Verify stock for all items
    for (const item of user.cart) {
      if (!item.product) continue;
      const currentProduct = await Product.findById(item.product._id);
      if (!currentProduct || currentProduct.stock < item.quantity) {
        return res.status(400).json({
          error: `Item "${item.product.name}" only has ${currentProduct ? currentProduct.stock : 0} units available in stock.`,
        });
      }
    }

    // 2. Deduct stock and remove sold out products
    for (const item of user.cart) {
      if (!item.product) continue;
      const currentProduct = await Product.findById(item.product._id);
      if (currentProduct) {
        currentProduct.stock -= item.quantity;
        if (currentProduct.stock <= 0) {
          // Sold out: remove completely from products list
          await Product.findByIdAndDelete(currentProduct._id);
          // Remove from all other users' carts
          await User.updateMany({}, { $pull: { cart: { product: currentProduct._id } } });
        } else {
          await currentProduct.save();
        }
      }
    }

    // 3. Clear the buyer's cart
    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Order placed successfully! Stock updated.",
    });
  } catch (error) {
    console.error("Checkout failed:", error);
    res.status(500).json({ error: "Checkout failed. Please try again." });
  }
};
