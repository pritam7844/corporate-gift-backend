import PDFDocument from 'pdfkit';

/**
 * Generates an invoice PDF using pdfkit and returns it as a Buffer.
 * @param {Object} request - The fully populated Mongoose Request document
 * @returns {Promise<Buffer>} - The generated PDF as a buffer
 */
export const generateInvoice = (request) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            const companyName = request.companyId?.name || 'Corporate Gift Portal';
            const orderId = request.orderId;
            const date = new Date(request.createdAt).toLocaleDateString('en-IN');
            const employee = request.employeeDetails;
            const products = request.selectedProducts;
            const event = request.eventId; // populated eventId object

            // ── Header ──────────────────────────────────────────────────────────────
            doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e40af').text('INVOICE', { align: 'right' });
            doc.moveUp();
            doc.fontSize(18).fillColor('#111827').text(companyName, { align: 'left' });
            doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text('Corporate Gifting Services', { align: 'left' });
            doc.moveDown(1.5);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#1e40af').lineWidth(2).stroke();
            doc.moveDown();

            // ── Bill To + Order Details ──────────────────────────────────────────────
            const yInfo = doc.y;

            doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('Delivery Details:', 50, yInfo);
            let addressText = employee.address || 'N/A';

            doc.fontSize(10).font('Helvetica').fillColor('#111827')
                .text('Name: ' + employee.name, 50, yInfo + 18)
                .text('Email: ' + employee.email, 50, yInfo + 33)
                .text('Phone: ' + employee.phone, 50, yInfo + 48)
                .text('Delivery Address: ' + addressText, 50, yInfo + 63, { width: 220 });

            doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('Order Details:', 350, yInfo);
            doc.fontSize(10).font('Helvetica').fillColor('#111827')
                .text('Order ID: #' + orderId, 350, yInfo + 18)
                .text('Order Date: ' + date, 350, yInfo + 33)
                .text('Event: ' + (event?.name || 'N/A'), 350, yInfo + 48);


            doc.moveDown(6);

            // ── Table ──────────────────────────────────────────────────────────────
            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
            doc.moveDown(0.5);

            const tableTop = doc.y;
            // Column positions
            const col = { name: 50, qty: 290, price: 360, total: 480 };

            // Table header background
            doc.rect(50, tableTop, 500, 20).fill('#eff6ff');
            doc.fillColor('#1e40af').font('Helvetica-Bold').fontSize(9);
            doc.text('DESCRIPTION', col.name, tableTop + 6);
            doc.text('QTY', col.qty, tableTop + 6, { width: 55, align: 'center' });
            doc.text('RATE (Incl. GST)', col.price, tableTop + 6, { width: 100, align: 'right' });
            doc.text('AMOUNT', col.total, tableTop + 6, { width: 70, align: 'right' });

            let rowY = tableTop + 25;
            doc.fillColor('#111827').font('Helvetica').fontSize(9);

            let grandTotal = 0;

            products.forEach((p, index) => {
                const pricePerUnit = p.discountedPrice || p.actualPrice || 0;
                const itemTotal = pricePerUnit * p.quantity;
                grandTotal += itemTotal;

                // Alternating row background
                if (index % 2 === 0) {
                    doc.rect(50, rowY - 5, 500, 18).fill('#f9fafb');
                }

                const name = p.productId?.name || 'Product';
                const truncName = name.length > 38 ? name.substring(0, 38) + '...' : name;

                doc.fillColor('#111827')
                    .text(truncName, col.name, rowY, { width: 240 })
                    .text(String(p.quantity), col.qty, rowY, { width: 60, align: 'center' })
                    .text('Rs. ' + pricePerUnit.toFixed(2), col.price, rowY, { width: 90, align: 'right' })
                    .text('Rs. ' + itemTotal.toFixed(2), col.total, rowY, { width: 60, align: 'right' });

                rowY += 20;
            });

            // ── Totals ──────────────────────────────────────────────────────────────
            doc.moveTo(50, rowY).lineTo(550, rowY).strokeColor('#e5e7eb').lineWidth(1).stroke();
            rowY += 12;

            doc.fillColor('#6b7280').font('Helvetica').fontSize(9);
            doc.text('Amount (Incl. of all taxes):', 350, rowY, { width: 130, align: 'right' });
            doc.text('Rs. ' + grandTotal.toFixed(2), col.total, rowY, { width: 60, align: 'right' });
            rowY += 16;

            doc.text('Delivery Charges:', 350, rowY, { width: 130, align: 'right' });
            doc.text('FREE', col.total, rowY, { width: 60, align: 'right' });
            rowY += 16;

            // Grand total box
            doc.rect(340, rowY, 210, 26).fill('#1e40af');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11);
            doc.text('GRAND TOTAL:', 350, rowY + 8, { width: 130, align: 'right' });
            doc.text('Rs. ' + grandTotal.toFixed(2), col.total, rowY + 8, { width: 60, align: 'right' });

            // ── Footer note ──────────────────────────────────────────────────────────
            const footerY = doc.page.height - 90;
            doc.moveTo(50, footerY - 15).lineTo(550, footerY - 15).strokeColor('#e5e7eb').lineWidth(1).stroke();
            doc.fontSize(9).font('Helvetica-Oblique').fillColor('#6b7280')
                .text('This is a system-generated invoice and does not require a physical signature.', 50, footerY + 14, { align: 'center', width: 500 });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};
