import Request from './request.model.js';
import Company from '../company/company.model.js';
// We will import your notification utilities here
import { sendEmail } from '../../utils/sendEmail.js';
import { sendWhatsapp } from '../../utils/sendWhatsapp.js';

export const submitGiftRequest = async (requestData) => {
  // 1. Save the request to the database
  const request = await Request.create(requestData);

  // 2. Fetch company details to make the notification look nice
  const company = await Company.findById(requestData.companyId);

  // 3. Trigger Real-Time Notifications (Non-blocking)
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPhone = process.env.ADMIN_WHATSAPP;
    const employee = requestData.employeeDetails;

    const messageBody = `
      New Gift Selection!
      Company: ${company ? company.name : 'Unknown'}
      Employee: ${employee.name} (${employee.email})
      Items Selected: ${requestData.selectedProducts.length}
      Phone: ${employee.phone}
    `;

    // Send Email to Admin
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Gift Request - ${employee.name}`,
        text: messageBody
      });
    }

    // Send Confirmation Email to Employee
    await sendEmail({
      to: employee.email,
      subject: `Order Confirmation - Gift Pro`,
      text: `Hello ${employee.name},\n\nThank you for choosing your gift! We have received your order (#${request._id.toString().slice(-6).toUpperCase()}) and are processing it.\n\nShipping Address: ${employee.address}\n\nYou can track your order status in the employee portal.\n\nBest Regards,\nCorporate Gift Team`
    });

    // Send WhatsApp to Admin
    if (adminPhone) {
      await sendWhatsapp(adminPhone, messageBody);
    }
  } catch (notifyError) {
    console.error('Notification failed, but request was saved:', notifyError.message);
    // We don't throw an error here because the employee's request was successfully saved.
  }

  return request;
};

// For the Admin Dashboard: Get all requests, optionally filtered by company
export const getAllRequests = async (filter = {}) => {
  return await Request.find(filter)
    .populate('companyId', 'name subdomain')
    .populate('eventId', 'name')
    .populate('selectedProducts.productId', 'name image price')
    .sort({ createdAt: -1 });
};

// For the Employee Dashboard: Get all requests for a specific email
export const getUserRequests = async (email) => {
  return await Request.find({ 'employeeDetails.email': email })
    .populate('eventId', 'name')
    .populate('selectedProducts.productId', 'name image price')
    .sort({ createdAt: -1 });
};

// For the Admin Dashboard: Update request status
export const updateRequestStatus = async (requestId, status) => {
  return await Request.findByIdAndUpdate(
    requestId,
    { status },
    { new: true, runValidators: true }
  ).populate('eventId', 'name').populate('selectedProducts.productId', 'name image price');
};