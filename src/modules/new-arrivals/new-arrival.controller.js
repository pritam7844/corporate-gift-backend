import cloudinary from '../../config/cloudinary.js';
import * as newArrivalService from './new-arrival.service.js';

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    // Convert buffer to base64 data URI
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    cloudinary.uploader.upload(dataURI, {
      folder: 'new-arrivals',
      resource_type: 'auto',
      timeout: 120000 
    })
    .then(result => resolve(result.secure_url))
    .catch(error => {
      console.error('Cloudinary Upload Error Details:', JSON.stringify(error, null, 2));
      reject(error);
    });
  });
};

export const addArrival = async (req, res, next) => {
  try {
    console.log('[NEW ARRIVAL] Starting creation...');
    const arrivalData = { ...req.body };

    if (req.files && req.files.length > 0) {
      console.log(`[NEW ARRIVAL] Uploading ${req.files.length} images...`);
      const imageUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }
      arrivalData.images = imageUrls;
    }

    if (arrivalData.isComingSoon === 'true') arrivalData.isComingSoon = true;
    if (arrivalData.isComingSoon === 'false') arrivalData.isComingSoon = false;
    
    if (arrivalData.comingSoonDate && arrivalData.comingSoonDate !== '' && arrivalData.comingSoonDate !== 'null') {
        arrivalData.comingSoonDate = new Date(arrivalData.comingSoonDate);
    } else {
        arrivalData.comingSoonDate = null;
    }

    const arrival = await newArrivalService.createArrival(arrivalData);
    res.status(201).json({ success: true, data: arrival });
  } catch (error) {
    console.error('[NEW ARRIVAL] Creation Error:', error);
    next(error);
  }
};

export const getArrivals = async (req, res, next) => {
  try {
    let filter = {};
    
    // Employee view: Only show valid upcoming items
    if (req.user.role !== 'admin') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filter = {
        $or: [
          { comingSoonDate: { $exists: false } }, // No date set
          { comingSoonDate: null },              // Explicitly null
          { comingSoonDate: { $gte: today } }    // Future or today
        ]
      };
      console.log('[GET ARRIVALS] Applying employee date filter');
    }

    const arrivals = await newArrivalService.getAllArrivals(filter);
    res.status(200).json({ success: true, data: arrivals });
  } catch (error) {
    next(error);
  }
};

export const updateArrival = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`[UPDATE ARRIVAL] Starting for ${id}...`);
    const arrivalData = { ...req.body };

    let existingImages = [];
    if (req.body.images) {
      try {
        existingImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (!Array.isArray(existingImages)) existingImages = [existingImages];
      } catch (e) {
        existingImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      }
    }

    if (req.files && req.files.length > 0) {
      console.log(`[UPDATE ARRIVAL] Uploading ${req.files.length} new images...`);
      const newImageUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file);
        newImageUrls.push(url);
      }
      arrivalData.images = [...existingImages, ...newImageUrls];
    } else {
      arrivalData.images = existingImages;
    }

    if (arrivalData.isComingSoon === 'true') arrivalData.isComingSoon = true;
    if (arrivalData.isComingSoon === 'false') arrivalData.isComingSoon = false;
    
    if (arrivalData.comingSoonDate && arrivalData.comingSoonDate !== '' && arrivalData.comingSoonDate !== 'null') {
        arrivalData.comingSoonDate = new Date(arrivalData.comingSoonDate);
    } else {
        arrivalData.comingSoonDate = null;
    }

    const arrival = await newArrivalService.updateArrival(id, arrivalData);
    if (!arrival) {
      return res.status(404).json({ success: false, message: 'New arrival not found' });
    }
    res.status(200).json({ success: true, data: arrival });
  } catch (error) {
    console.error('[UPDATE ARRIVAL] Error:', error);
    next(error);
  }
};

export const removeArrival = async (req, res, next) => {
  try {
    await newArrivalService.deleteArrival(req.params.id);
    res.status(200).json({ success: true, message: 'New arrival deleted' });
  } catch (error) {
    next(error);
  }
};
