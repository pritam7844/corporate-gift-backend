import * as requestService from './request.service.js';

export const createRequest = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const companyId = req.user.companyId;

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
    // If Admin wants to filter by a specific company (e.g., ?companyId=123)
    const filter = req.query.companyId ? { companyId: req.query.companyId } : {};

    const requests = await requestService.getAllRequests(filter);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const getUserRequests = async (req, res, next) => {
  try {
    const email = req.user.email; // Assuming user email is in the token payload
    const requests = await requestService.getUserRequests(email);
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