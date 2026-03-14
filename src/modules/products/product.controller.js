import cloudinary from '../../config/cloudinary.js';
import * as productService from './product.service.js';

export const addProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    // Handle Image Upload if file exists
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      productData.image = uploadResult.secure_url;
    }

    // Parse numeric fields if they come as strings from FormData
    if (productData.actualPrice) productData.actualPrice = Number(productData.actualPrice);
    if (productData.discountedPrice) productData.discountedPrice = Number(productData.discountedPrice);
    
    // Handle isGlobal and companyId
    if (productData.isGlobal === 'true' || productData.isGlobal === true) {
        productData.isGlobal = true;
        productData.companyId = null;
    } else {
        productData.isGlobal = false;
        // companyId should be provided in req.body
    }

    const product = await productService.createProduct(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// UPDATED: Build a filter based on the Admin's request
export const getProducts = async (req, res, next) => {
  try {
    const filter = {};
    
    // If the Admin only wants to see Global products
    if (req.query.global === 'true') {
      filter.companyId = null;
    } 
    // If the Admin wants to see products for a specific company
    else if (req.query.companyId) {
      // Typically, an Admin wants to see Global items + This Company's items
      filter.$or = [
        { companyId: null },
        { companyId: req.query.companyId }
      ];
    }

    const products = await productService.getAllProducts(filter);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      productData.image = uploadResult.secure_url;
    }

    if (productData.actualPrice) productData.actualPrice = Number(productData.actualPrice);
    if (productData.discountedPrice) productData.discountedPrice = Number(productData.discountedPrice);
    
    if (productData.isGlobal === 'true' || productData.isGlobal === true) {
        productData.isGlobal = true;
        productData.companyId = null;
    } else if (productData.isGlobal === 'false' || productData.isGlobal === false) {
        productData.isGlobal = false;
    }

    const product = await productService.updateProduct(req.params.id, productData);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const removeProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};