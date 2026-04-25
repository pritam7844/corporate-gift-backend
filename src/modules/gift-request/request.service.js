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
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <img src="${p.productId.images?.[0] || p.productId.image}" alt="${p.productId.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 10px;" />
            <div>
              <span style="font-weight: bold; display: block;">${p.productId.name}</span>
              ${p.productId.description ? `<p style="margin: 4px 0 0; font-size: 11px; color: #64748b; line-height: 1.4;">${p.productId.description}</p>` : ''}
            </div>
          </div>
          ${populatedRequest.customization?.isBrandingRequired ? `
            <div style="font-size: 11px; color: #6b7280; background: #f9fafb; padding: 8px; border-radius: 6px; margin-top: 4px; border: 1px solid #f1f5f9;">
              <p style="margin: 2px 0;"><strong>Branding Type:</strong> ${p.brandingType || 'Standard'}</p>
              <p style="margin: 2px 0;"><strong>Positions:</strong> ${p.brandingPositions === 'Custom' ? p.customBrandingPositions : p.brandingPositions || 'N/A'}</p>
              <p style="margin: 2px 0;"><strong>Size:</strong> ${p.brandingSize === 'Custom' ? p.customBrandingSize : p.brandingSize || 'N/A'}</p>
            </div>
          ` : ''}
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
            <p><strong>Delivery Address:</strong><br/>${employee.address}</p>
          </div>

          ${request.customization?.isBrandingRequired ? `
          <div style="margin-bottom: 25px; background: #fff7ed; padding: 15px; border-radius: 8px; border: 1px solid #ffedd5;">
            <h2 style="font-size: 18px; color: #9a3412; border-bottom: 2px solid #ffedd5; padding-bottom: 8px; margin-top: 0;">Branding Information</h2>
            <p style="color: #64748b; font-size: 13px;">Individual branding details are listed below each product in the items table.</p>
            ${request.customization.brandingLogo ? `
              <p><strong>Shared Branding Logo:</strong> <a href="${request.customization.brandingLogo}" target="_blank" style="color: #2563eb; font-weight: bold;">View Logo File</a></p>
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
            <h2 style="font-size: 18px; color: #166534; border-bottom: 2px solid #dcfce7; padding-bottom: 8px; margin-top: 0;">Shipping</h2>
            <p><strong>Delivery Address:</strong><br/>${employee.address}</p>
          </div>

          ${employee.additionalRequirements ? `
          <div style="margin-bottom: 25px; background: #ebf5ff; padding: 15px; border-radius: 8px; border: 1px solid #d1e9ff;">
            <h2 style="font-size: 18px; color: #1e40af; border-bottom: 2px solid #d1e9ff; padding-bottom: 8px; margin-top: 0;">Additional Requirements / Notes</h2>
            <p style="margin: 5px 0 0; white-space: pre-wrap;">${employee.additionalRequirements}</p>
          </div>
          ` : ''}

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

    // Generate Invoice PDF
    let invoicePdf = null;
    try {
      invoicePdf = await generateInvoice(populatedRequest);
    } catch (pdfErr) {
      console.error('Invoice PDF generation failed:', pdfErr.message);
    }

    // Send Email to Admin (with invoice PDF attachment)
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

    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Order: ${company?.name || 'N/A'} - ${employee.name}`,
        html: adminHtml,
        text: `New order from ${employee.name} at ${company?.name}. Items: ${products.length}. Total: ₹${grandTotal.toLocaleString()}`,
        attachments
      });
    }

    // Prepare separate attachments for Employee (No Invoice)
    const employeeAttachments = attachments.filter(att => !att.filename.startsWith('Invoice-'));

    // --- Employee Email HTML (Refined with all details) ---
    const employeeHtml = `
      <div style="${sharedStyles}">
        <div style="background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Order Confirmed!</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Hello ${employee.name}, your gift choice for ${event?.name || 'the event'} has been reserved.</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="margin-bottom: 20px;">
            <p>We've received your selection from <strong>${company?.name || 'your company'}</strong>. You'll receive another notification once your gift is delivered.</p>
            <p style="font-weight: bold; color: #059669; background: #ecfdf5; padding: 10px; border-radius: 6px; display: inline-block;">🚚 Estimated Delivery: 4-5 working days</p>
          </div>

          <div style="margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h2 style="font-size: 16px; color: #1e40af; border-bottom: 2px solid #eff6ff; padding-bottom: 8px; margin-top: 0;">Employee & Shipping Details</h2>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${employee.name}</p>
            <p style="margin: 5px 0;"><strong>Employee ID:</strong> ${employee.employeeId || 'N/A'}</p>
            <p style="margin: 10px 0 0;"><strong>Delivery Address:</strong><br/>${employee.address}</p>
          </div>

          ${request.customization?.isBrandingRequired ? `
          <div style="margin-bottom: 25px; background: #fff7ed; padding: 15px; border-radius: 8px; border: 1px solid #ffedd5;">
            <h2 style="font-size: 16px; color: #9a3412; border-bottom: 2px solid #ffedd5; padding-bottom: 8px; margin-top: 0;">Branding Requirements</h2>
            <p style="font-size: 12px; color: #9a3412; margin-bottom: 10px;">Your unique branding choices for each item are detailed in the table below.</p>
            ${request.customization.brandingLogo ? `<p style="font-size: 11px; color: #9a3412;">Shared branding logo has been attached to this order.</p>` : ''}
          </div>
          ` : ''}

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; color: #1e40af; border-bottom: 2px solid #eff6ff; padding-bottom: 8px;">Your Selected Items</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 12px;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb; font-size: 12px;">Qty</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">
                      <div style="font-weight: bold; margin-bottom: 4px;">${p.productId.name}</div>
                      ${p.productId.description ? `<p style="margin: 0 0 8px; font-size: 11px; color: #64748b; line-height: 1.4;">${p.productId.description}</p>` : ''}
                      ${populatedRequest.customization?.isBrandingRequired ? `
                        <div style="font-size: 11px; color: #6b7280; background: #f9fafb; padding: 8px; border-radius: 4px; border: 1px solid #f1f5f9; margin-top: 5px;">
                          <p style="margin: 2px 0;"><strong>Branding:</strong> ${p.brandingType || 'Standard'}</p>
                          <p style="margin: 2px 0;"><strong>Position:</strong> ${p.brandingPositions === 'Custom' ? p.customBrandingPositions : p.brandingPositions || 'N/A'}</p>
                          <p style="margin: 2px 0;"><strong>Size/Dimension:</strong> ${p.brandingSize || 'N/A'}</p>
                        </div>
                      ` : ''}
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px; vertical-align: top;">${p.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <p style="margin-top: 25px; font-size: 13px; color: #6b7280; text-align: center;">
            Need to change something? Reach out to your HR department as soon as possible.
          </p>
        </div>
      </div>
    `;

    // Send Confirmation Email to Employee
    if (employee.email) {
      await sendEmail({
        to: employee.email,
        subject: `🎁 Order Confirmed: Your Selection for ${event?.name || 'Corporate Gift'}`,
        html: employeeHtml,
        text: `Hello ${employee.name}, your choice for ${event?.name} has been received and confirmed.`,
        attachments: employeeAttachments
      });
    }

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
    .populate('selectedProducts.productId', 'name images image category')
    .sort({ createdAt: -1 });
};

// For the Employee Dashboard: Get all requests for a specific email
export const getUserRequests = async (email) => {
  return await Request.find({ 'employeeDetails.email': email })
    .populate('eventId', 'name')
    .populate('selectedProducts.productId', 'name images image category')
    .sort({ createdAt: -1 });
};

// For the Admin Dashboard: Update request status
export const updateRequestStatus = async (requestId, status) => {
  const updatedRequest = await Request.findByIdAndUpdate(
    requestId,
    { status },
    { new: true, runValidators: true }
  ).populate('companyId', 'name subdomain')
    .populate('eventId', 'name')
    .populate('selectedProducts.productId', 'name images image category');

  if (!updatedRequest) return null;

  // Send Delivery Notification to Employee ONLY if status is 'Delivered'
  if (status === 'Delivered' && updatedRequest.employeeDetails?.email) {
    try {
      const company = updatedRequest.companyId;
      const event = updatedRequest.eventId;
      const employee = updatedRequest.employeeDetails;
      const products = updatedRequest.selectedProducts;

      const productList = products.map(p => `<li>${p.productId.name} (Qty: ${p.quantity})</li>`).join('');

      const deliveryHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #059669; color: white; padding: 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 15px;">🎁</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Your Gift Has Arrived!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Order #${updatedRequest.orderId}</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hello <strong>${employee.name}</strong>,</p>
            <p>Great news! Your selection for the <strong>${event?.name || 'Corporate Gift'}</strong> event by <strong>${company?.name || 'your company'}</strong> has been successfully delivered.</p>
            
            <div style="margin: 25px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; border: 1px solid #dcfce7;">
              <h3 style="margin-top: 0; color: #065f46; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Delivered Items</h3>
              <ul style="margin: 10px 0 0; padding-left: 20px; color: #065f46; font-weight: 500;">
                ${productList}
              </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px;">We hope you enjoy your gift! If you have any questions or feedback regarding your delivery, please reach out to your HR department.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; 2026 Corporate Gift Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: employee.email,
        subject: `🎁 Delivered: Your ${event?.name || 'Gift Selection'} is here!`,
        html: deliveryHtml,
        text: `Hello ${employee.name}, your choice for ${event?.name} has been delivered. Enjoy your gift!`
      });
    } catch (err) {
      console.error('Failed to send status update email:', err.message);
    }
  }

  return updatedRequest;
};