import Product from './product.model.js';

export const createProduct = async (productData) => {
  return await Product.create(productData);
};

// UPDATED: Accept a filter object
export const getAllProducts = async (filter = {}) => {
  return await Product.find(filter).sort({ createdAt: -1 });
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  return product;
};

export const updateProduct = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};