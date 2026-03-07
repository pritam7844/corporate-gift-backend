import Cart from '../cart/cart.model.js';

// Fetch a cart by the employee's ID
export const getCartByEmployeeId = async (employeeId) => {
  const cart = await Cart.findOne({ employeeId }).populate('items.productId');
  if (!cart) {
    return { items: [] }; // Return empty structure if no cart exists
  }
  return cart;
};

// Add or update an item in the cart
export const addItemToCart = async (employeeId, companyId, productId, quantity) => {
  let cart = await Cart.findOne({ employeeId });

  if (!cart) {
    // Create new cart
    cart = new Cart({
      employeeId,
      companyId,
      items: [{ productId, quantity }]
    });
  } else {
    // Update existing cart
    const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
  }

  await cart.save();
  return cart;
};

// Remove a specific item from the cart entirely
export const removeItemFromCart = async (employeeId, productId) => {
  let cart = await Cart.findOne({ employeeId });
  
  if (!cart) {
    throw new Error('Cart not found');
  }

  // Filter out the item to be removed
  cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  
  await cart.save();
  return cart;
};

// Delete the entire cart (useful after a successful checkout)
export const clearEmployeeCart = async (employeeId) => {
  await Cart.findOneAndDelete({ employeeId });
  return { message: 'Cart cleared successfully' };
};