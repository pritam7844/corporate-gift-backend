import * as newArrivalService from './new-arrival.service.js';

export const addArrival = async (req, res, next) => {
  try {
    const arrivalData = { ...req.body };

    // Images come as URLs from the frontend in req.body.images

    if (arrivalData.isComingSoon === 'true' || arrivalData.isComingSoon === true) arrivalData.isComingSoon = true;
    else arrivalData.isComingSoon = false;
    
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
    const arrivalData = { ...req.body };

    // images already come as an array of URLs from the frontend

    if (arrivalData.isComingSoon === 'true' || arrivalData.isComingSoon === true) arrivalData.isComingSoon = true;
    else arrivalData.isComingSoon = false;
    
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
