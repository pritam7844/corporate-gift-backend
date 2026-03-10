import * as requestService from './request.service.js';

export const createRequest = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const companyId = req.user.companyId || req.body.companyId;

    const { eventId, employeeDetails, selectedProducts } = req.body;

    if (!selectedProducts || selectedProducts.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const requestData = {
      companyId: companyId,
      eventId: eventId,
      employeeDetails: employeeDetails,
      selectedProducts: selectedProducts
    };

    // Submit the request
    const request = await requestService.submitGiftRequest(requestData);

    res.status(201).json({
      success: true,
      message: 'Gift selection submitted successfully!',
      data: request
    });
  } catch (error) {
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