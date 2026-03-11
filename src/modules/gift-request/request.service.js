import Request from './request.model.js';
import Company from '../company/company.model.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { sendWhatsapp } from '../../utils/sendWhatsapp.js';
import { generateInvoice } from '../../utils/generateInvoice.js';
import axios from 'axios';

export const submitGiftRequest = async (requestData) => {
  // 1. Save the request to the database
  const request = await Request.create(requestData);

  // 2. Populate for rich notification data
  const populatedRequest = await Request.findById(request._id)
    .populate('companyId')
    .populate('eventId')
    .populate('selectedProducts.productId');

  // 3. Trigger Real-Time Notifications (Non-blocking)
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const company = populatedRequest.companyId;
    const event = populatedRequest.eventId;
    const employee = populatedRequest.employeeDetails;
    const products = populatedRequest.selectedProducts;

    const grandTotal = products.reduce((acc, p) => acc + (p.discountedPrice * p.quantity), 0);

    const productRows = products.map(p => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center;">
            <img src="${p.productId.image}" alt="${p.productId.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 10px;" />
            <span>${p.productId.name}</span>
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${p.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${p.discountedPrice.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(p.discountedPrice * p.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const sharedStyles = `
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
    `;

    // --- Admin Email HTML ---
    const adminHtml = `
      <div style="${sharedStyles}">
        <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">New Gift Selection Received!</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Order #${request.orderId}</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; color: #1e40af; border-bottom: 2px solid #eff6ff; padding-bottom: 8px;">Company Information</h2>
            <p><strong>Name:</strong> ${company?.name || 'N/A'}</p>
            <p><strong>Subdomain:</strong> ${company?.subdomain || 'N/A'}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; color: #1e40af; border-bottom: 2px solid #eff6ff; padding-bottom: 8px;">Employee Details</h2>
            <p><strong>Name:</strong> ${employee.name}</p>
            <p><strong>Email:</strong> ${employee.email}</p>
            <p><strong>Phone:</strong> ${employee.phone}</p>
            <p><strong>Employee ID:</strong> ${employee.employeeId || 'N/A'}</p>
            <p><strong>Address:</strong> ${employee.address}</p>
          </div>

          ${request.customization?.isBrandingRequired ? `
          <div style="margin-bottom: 25px; background: #fff7ed; padding: 15px; border-radius: 8px; border: 1px solid #ffedd5;">
            <h2 style="font-size: 18px; color: #9a3412; border-bottom: 2px solid #ffedd5; padding-bottom: 8px; margin-top: 0;">Branding Requirements</h2>
            <p><strong>Type:</strong> ${request.customization.brandingType}</p>
            <p><strong>Positions:</strong> ${request.customization.brandingPositions}</p>
            <p><strong>Size:</strong> ${request.customization.brandingSize}</p>
            ${request.customization.brandingLogo ? `
              <p><strong>Branding Logo:</strong> <a href="${request.customization.brandingLogo}" target="_blank" style="color: #2563eb; font-weight: bold;">View Logo File</a></p>
              <div style="margin-top: 10px;">
                <img src="${request.customization.brandingLogo}" alt="Logo" style="max-width: 200px; max-height: 100px; border: 1px solid #ddd; border-radius: 4px;" />
              </div>
            ` : ''}
          </div>
          ` : `
          <div style="margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #64748b; font-weight: bold;">NO BRANDING REQUIRED</p>
          </div>
          `}

          <div style="margin-bottom: 25px; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #dcfce7;">
            <h2 style="font-size: 18px; color: #166534; border-bottom: 2px solid #dcfce7; padding-bottom: 8px; margin-top: 0;">Shipping & Timeline</h2>
            <p><strong>Delivery Type:</strong> ${request.shippingDetails?.deliveryType || 'Single Location'}</p>
            ${request.shippingDetails?.deliveryType === 'Multiple Locations' ? `
              <p><strong>Multiple Locations Info:</strong> ${request.shippingDetails.multipleLocations}</p>
            ` : ''}
            <p><strong>Required Timeline:</strong> ${request.shippingDetails?.deliveryTimeline || 'N/A'}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; color: #1e40af; border-bottom: 2px solid #eff6ff; padding-bottom: 8px;">Event: ${event?.name || 'Standard'}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 15px 12px; text-align: right; font-weight: bold;">Grand Total:</td>
                  <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #2563eb; font-size: 18px;">₹${grandTotal.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.ADMIN_FRONTEND_URL || '#'}/requests" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Manage Order</a>
          </div>
        </div>
      </div>
    `;

    // --- Employee Email HTML ---
    const employeeHtml = `
      <div style="${sharedStyles}">
        <div style="background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Order Confirmed!</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Hello ${employee.name}, your choice has been reserved.</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Thank you for participating in the <strong>${event?.name || 'Corporate Gift'}</strong> event! We have received your selection and are preparing it for delivery.</p>
          
          <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 8px;">
            <p style="margin: 0;"><strong>Shipping To:</strong></p>
            <p style="margin: 5px 0 0;">${employee.address}</p>
            ${request.shippingDetails?.deliveryTimeline ? `
              <p style="margin: 10px 0 0; font-size: 13px; color: #166534;"><strong>Timeline:</strong> ${request.shippingDetails.deliveryTimeline}</p>
            ` : ''}
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="color: #6b7280; font-size: 12px; text-transform: uppercase;">
                <th style="padding: 10px 0; text-align: left; border-bottom: 1px solid #eee;">Item</th>
                <th style="padding: 10px 0; text-align: right; border-bottom: 1px solid #eee;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${p.productId.name}</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">${p.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p style="margin-top: 25px; font-size: 14px; color: #6b7280; text-align: center;">
            Need help? Contact your HR department or reply to this email.
          </p>
        </div>
      </div>
    `;

    // Generate Invoice PDF
    let invoicePdf = null;
    try {
      invoicePdf = await generateInvoice(populatedRequest);
    } catch (pdfErr) {
      console.error('Invoice PDF generation failed:', pdfErr.message);
    }

    // Send Email to Admin (with invoice PDF attachment)
    if (adminEmail) {
      const attachments = invoicePdf
        ? [{
          filename: `Invoice-${populatedRequest.orderId}.pdf`,
          content: invoicePdf,
          contentType: 'application/pdf'
        }]
        : [];

      // Add Branding Logo to attachments if present
      if (request.customization?.brandingLogo) {
        try {
          const logoResponse = await axios.get(request.customization.brandingLogo, { responseType: 'arraybuffer' });
          const logoBuffer = Buffer.from(logoResponse.data, 'binary');

          // Get extension from URL or fallback to png
          const extension = request.customization.brandingLogo.split('.').pop().split(/\#|\?/)[0] || 'png';

          attachments.push({
            filename: `Branding-Logo.${extension}`,
            content: logoBuffer
          });
        } catch (logoErr) {
          console.error('Failed to attach logo to email:', logoErr.message);
        }
      }

      await sendEmail({
        to: adminEmail,
        subject: `New Order: ${company?.name || 'N/A'} - ${employee.name}`,
        html: adminHtml,
        text: `New order from ${employee.name} at ${company?.name}. Items: ${products.length}. Total: ₹${grandTotal.toLocaleString()}`,
        attachments
      });
    }

    // Send Confirmation Email to Employee
    // await sendEmail({
    //   to: employee.email,
    //   subject: `🎁 Order Confirmed: ${event?.name || 'Your Gift Selection'}`,
    //   html: employeeHtml,
    //   text: `Hello ${employee.name}, your order has been received and is being processed.`
    // });

    // Send WhatsApp to Admin
    // if (adminPhone) {
    //   await sendWhatsapp(adminPhone, messageBody);
    // }
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
    .populate('selectedProducts.productId', 'name image category')
    .sort({ createdAt: -1 });
};

// For the Employee Dashboard: Get all requests for a specific email
export const getUserRequests = async (email) => {
  return await Request.find({ 'employeeDetails.email': email })
    .populate('eventId', 'name')
    .populate('selectedProducts.productId', 'name image category')
    .sort({ createdAt: -1 });
};

// For the Admin Dashboard: Update request status
export const updateRequestStatus = async (requestId, status) => {
  return await Request.findByIdAndUpdate(
    requestId,
    { status },
    { new: true, runValidators: true }
  ).populate('eventId', 'name').populate('selectedProducts.productId', 'name image category');
};