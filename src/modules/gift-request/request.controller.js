import * as requestService from './request.service.js';
import Event from '../events/event.model.js';
import Request from './request.model.js';

export const createRequest = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const companyId = req.user.companyId || req.body.companyId;

    const { eventId, employeeDetails, selectedProducts, customization, shippingDetails } = req.body;

    if (!selectedProducts || selectedProducts.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Sample Order Constraints Validation
    if (selectedProducts.length > 3) {
      return res.status(400).json({ success: false, message: 'Maximum 3 different products are allowed for a sample order.' });
    }

    const hasInvalidQuantity = selectedProducts.some(p => p.quantity > 1);
    if (hasInvalidQuantity) {
      return res.status(400).json({ success: false, message: 'Maximum 1 unit per product is allowed for sample orders.' });
    }

    // One Order Per Event Cycle Validation
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const existingOrder = await Request.findOne({
      eventId: eventId,
      'employeeDetails.email': employeeDetails.email,
      createdAt: { $gte: event.startDate }
    });

    if (existingOrder) {
      return res.status(400).json({ 
        success: false, 
        message: `You have already placed a sample order for the "${event.name}" event during this period.` 
      });
    }

    const requestData = {
      companyId: companyId,
      eventId: eventId,
      employeeDetails: employeeDetails,
      selectedProducts: selectedProducts,
      customization: customization,
      shippingDetails: shippingDetails
    };

    // Submit the request
    const request = await requestService.submitGiftRequest(requestData);

    res.status(201).json({
      success: true,
      message: 'Gift selection submitted successfully!',
      data: request
    });
  } catch (error) {
    console.error('CREATE REQUEST ERROR:', error);
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    // Check for filters
    const companyId = req.query.companyId || req.params.companyId;
    const status = req.query.status;
    const excludeStatus = req.query.excludeStatus;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (status) filter.status = status;
    if (excludeStatus) filter.status = { $ne: excludeStatus };

    const requests = await requestService.getAllRequests(filter);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const getUserRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // We need to fetch the email since the token only holds the user ID
    const user = await import('../users/user.model.js').then(m => m.default.findById(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const requests = await requestService.getUserRequests(user.email);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedRequest = await requestService.updateRequestStatus(id, status);

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    next(error);
  }
};