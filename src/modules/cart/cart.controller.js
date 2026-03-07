import * as cartService from '../cart/cart.service.js';

export const getCart = async (req, res) => {
  try {
    const employeeId = req.user.id; 
    const cart = await cartService.getCartByEmployeeId(employeeId);
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const companyId = req.user.companyId; 
    const { productId, quantity } = req.body;

    const updatedCart = await cartService.addItemToCart(employeeId, companyId, productId, quantity);
    
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { productId } = req.params; // usually passed in the URL: /api/cart/remove/:productId

    const updatedCart = await cartService.removeItemFromCart(employeeId, productId);
    
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const employeeId = req.user.id;
    
    const result = await cartService.clearEmployeeCart(employeeId);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};