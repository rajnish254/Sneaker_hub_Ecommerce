/**
 * EMAIL SERVICE
 * Handles sending emails using nodemailer with Gmail SMTP
 */

const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use App-specific password from Google
  },
  logger: true,
  debug: true
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
    console.log('⚠️  Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env');
  } else {
    console.log('✅ Email service is ready to send emails');
  }
});

/**
 * Send Order Confirmation Email
 */
async function sendOrderConfirmationEmail(order, userEmail) {
  try {
    // Format order items
    const itemsList = order.items
      .map(
        (item) =>
          `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">Qty: ${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toLocaleString()}</td>
      </tr>
    `
      )
      .join('');

    // Format shipping address
    const addressInfo = order.shippingAddress
      ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #333;">Delivery Address</h3>
        <p style="margin: 5px 0; color: #666;">
          <strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong><br/>
          ${order.shippingAddress.address}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
          Phone: ${order.shippingAddress.phone}
        </p>
      </div>
    `
      : '';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Confirmation - Order #${order._id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f9f9f9;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 30px 20px;
            }
            .order-info {
              background-color: #f0f4f8;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .order-info p {
              margin: 5px 0;
              color: #333;
            }
            .order-info strong {
              color: #667eea;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            table th {
              background-color: #f5f5f5;
              padding: 10px;
              text-align: left;
              font-weight: 600;
              color: #333;
              border-bottom: 2px solid #667eea;
            }
            .total-section {
              margin: 20px 0;
              padding: 15px;
              background-color: #f9f9f9;
              border-left: 4px solid #667eea;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              color: #666;
            }
            .total-row strong {
              color: #333;
            }
            .final-total {
              display: flex;
              justify-content: space-between;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #ddd;
              font-size: 18px;
              font-weight: 600;
              color: #667eea;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              border-radius: 5px;
              text-decoration: none;
              margin: 20px 0;
              font-weight: 600;
            }
            .info-box {
              background-color: #e8f4f8;
              border-left: 4px solid #0288d1;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box p {
              margin: 5px 0;
              color: #0288d1;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Confirmed!</h1>
              <p>Your order has been received</p>
            </div>

            <div class="content">
              <p style="color: #666; font-size: 16px;">Hi ${order.shippingAddress.firstName},</p>
              
              <p style="color: #666; line-height: 1.6;">
                Thank you for your order! We're excited to get your new sneakers to you. 👟
              </p>

              <div class="order-info">
                <p><strong>Order Number:</strong> #${order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod === 'razorpay' ? 'Razorpay' : order.paymentMethod === 'stripe' ? 'Stripe' : 'Cash on Delivery'}</p>
                <p><strong>Payment Status:</strong> <span style="color: #4caf50; font-weight: 600;">✓ Confirmed</span></p>
              </div>

              <h3 style="color: #333; margin: 20px 0 10px 0;">Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-row">
                  <strong>Subtotal:</strong>
                  <span>₹${(order.totalAmount - 400).toLocaleString()}</span>
                </div>
                <div class="total-row">
                  <strong>Shipping:</strong>
                  <span>₹0 (FREE)</span>
                </div>
                <div class="final-total">
                  <strong>Total Amount:</strong>
                  <span>₹${order.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              ${addressInfo}

              <div class="info-box">
                <p><strong>📦 What's Next?</strong></p>
                <p>We'll process your order and ship it out soon. You'll receive a tracking number via email as soon as your order ships.</p>
              </div>

              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}" class="button">Track Your Order</a>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  If you have any questions, feel free to reach out to our support team.
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">© 2026 SneakHub. All rights reserved.</p>
              <p style="margin: 5px 0 0 0; color: #999;">
                This is an automated email. Please don't reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Payment Confirmation Email
 */
async function sendPaymentConfirmationEmail(userEmail, orderData) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Payment Received - SneakHub',
      html: `
        <h2>Payment Confirmed</h2>
        <p>Your payment has been successfully received.</p>
        <p><strong>Amount:</strong> ₹${orderData.totalAmount}</p>
        <p>You will receive an order confirmation email shortly.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Payment confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Shipping Update Email
 */
async function sendShippingUpdateEmail(userEmail, orderData, trackingNumber) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Your Order Has Been Shipped - Tracking #${trackingNumber}`,
      html: `
        <h2>Your Order is On The Way! 🚚</h2>
        <p>Great news! Your order has been shipped.</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p><strong>Order ID:</strong> ${orderData._id}</p>
        <p>You can track your shipment using the tracking number above.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Shipping update email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send shipping update email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Order Status Update Email
 */
async function sendOrderStatusUpdateEmail(userEmail, orderData, newStatus) {
  try {
    let subject = '';
    let heading = '';
    let message = '';
    let statusColor = '#0288d1';
    let statusIcon = '📦';
    let trackingInfo = '';

    if (newStatus === 'shipped') {
      subject = `Your Order is On Its Way! - Order #${orderData._id}`;
      heading = 'Order Shipped';
      message = 'Great news! Your order has been shipped and is on its way to you.';
      statusColor = '#ff9800';
      statusIcon = '🚚';
      trackingInfo = orderData.trackingNumber 
        ? `<div style="margin: 20px 0; padding: 15px; background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px;">
             <p style="margin: 5px 0; color: #e65100;"><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
             <p style="margin: 5px 0; color: #e65100; font-size: 12px;">You can track your shipment using this number.</p>
           </div>`
        : '';
    } else if (newStatus === 'delivered') {
      subject = `Your Order Has Been Delivered! - Order #${orderData._id}`;
      heading = 'Order Delivered';
      message = 'Your sneakers have been delivered! We hope you love them.';
      statusColor = '#4caf50';
      statusIcon = '✅';
      trackingInfo = `<div style="margin: 20px 0; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
                       <p style="margin: 5px 0; color: #2e7d32;"><strong>Delivery Status:</strong> Successfully Delivered</p>
                       <p style="margin: 5px 0; color: #2e7d32; font-size: 12px;">Thank you for your purchase!</p>
                     </div>`;
    } else if (newStatus === 'cancelled') {
      subject = `Order Cancelled - Order #${orderData._id}`;
      heading = 'Order Cancelled';
      message = 'Your order has been cancelled. A refund will be processed shortly.';
      statusColor = '#f44336';
      statusIcon = '❌';
      trackingInfo = `<div style="margin: 20px 0; padding: 15px; background-color: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
                       <p style="margin: 5px 0; color: #c62828;"><strong>Refund Status:</strong> Processing</p>
                       <p style="margin: 5px 0; color: #c62828; font-size: 12px;">The refund will be credited to your original payment method within 5-7 business days.</p>
                     </div>`;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f9f9f9;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 30px 20px;
            }
            .status-badge {
              background-color: ${statusColor};
              color: white;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              font-size: 18px;
              font-weight: 600;
            }
            .order-info {
              background-color: #f0f4f8;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .order-info p {
              margin: 5px 0;
              color: #333;
              font-size: 14px;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              border-radius: 5px;
              text-decoration: none;
              margin: 20px 0;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusIcon} ${heading}</h1>
            </div>

            <div class="content">
              <p style="color: #666; font-size: 16px;">Hi ${orderData.shippingAddress?.firstName || 'Valued Customer'},</p>
              
              <p style="color: #666; line-height: 1.6;">
                ${message}
              </p>

              <div class="status-badge">
                ${statusIcon} ${newStatus.toUpperCase()}
              </div>

              <div class="order-info">
                <p><strong>Order Number:</strong> #${orderData._id}</p>
                <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p><strong>Total Amount:</strong> ₹${orderData.totalAmount?.toLocaleString() || '0'}</p>
              </div>

              ${trackingInfo}

              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderData._id}" class="button">View Order Details</a>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  If you have any questions, feel free to reach out to our support team.
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">© 2026 SneakHub. All rights reserved.</p>
              <p style="margin: 5px 0 0 0; color: #999;">
                This is an automated email. Please don't reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order status update email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send order status update email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Promotional Email
 */
async function sendPromotionalEmail(userEmail, firstName = 'Valued Customer', promoData) {
  try {
    const { title, discount, code, expiryDate, description, buttonText, buttonLink } = promoData;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: title || 'Exclusive Offer Just for You!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f9f9f9;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 700;
            }
            .discount-badge {
              background-color: rgba(255, 255, 255, 0.2);
              border: 2px solid white;
              color: white;
              padding: 15px 30px;
              border-radius: 50px;
              font-size: 24px;
              font-weight: 700;
              margin: 15px 0 0 0;
              display: inline-block;
            }
            .content {
              padding: 30px 20px;
            }
            .description {
              color: #666;
              line-height: 1.6;
              font-size: 16px;
              margin: 20px 0;
            }
            .promo-code {
              background: linear-gradient(135deg, #fef3c7 0%, #feeab9 100%);
              border: 2px dashed #f97316;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 25px 0;
            }
            .promo-code-label {
              color: #92400e;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 600;
            }
            .promo-code-value {
              color: #ea580c;
              font-size: 28px;
              font-weight: 700;
              margin: 10px 0;
              font-family: 'Courier New', monospace;
              letter-spacing: 2px;
            }
            .validity {
              color: #92400e;
              font-size: 12px;
              margin-top: 10px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
              color: white;
              padding: 14px 40px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              margin: 25px 0;
            }
            .button:hover {
              opacity: 0.9;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .conditions {
              background-color: #f0f9ff;
              border-left: 4px solid #0284c7;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 12px;
              color: #0c4a6e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title || '🎉 Exclusive Offer'}</h1>
              <div class="discount-badge">${discount || '50% OFF'}</div>
            </div>

            <div class="content">
              <p style="color: #666; font-size: 16px;">Hi ${firstName},</p>
              
              <div class="description">
                ${description || 'We have a special offer just for you! Get amazing sneakers at unbeatable prices.'}
              </div>

              ${code ? `
                <div class="promo-code">
                  <div class="promo-code-label">Use Promo Code</div>
                  <div class="promo-code-value">${code}</div>
                  ${expiryDate ? `<div class="validity">Valid until ${new Date(expiryDate).toLocaleDateString('en-IN')}</div>` : ''}
                </div>
              ` : ''}

              <div style="text-align: center;">
                <a href="${buttonLink || process.env.FRONTEND_URL}/products" class="button">
                  ${buttonText || 'Shop Now'}
                </a>
              </div>

              <div class="conditions">
                <p style="margin: 0;"><strong>Terms & Conditions:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Discount applicable on selected items only</li>
                  <li>Cannot be combined with other offers</li>
                  <li>One code per customer</li>
                  <li>Offer valid for limited time only</li>
                </ul>
              </div>

              <p style="color: #999; font-size: 14px; margin-top: 25px;">
                Hurry! This offer won't last long. Start shopping now and save big! 🛍️
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0;">© 2026 SneakHub. All rights reserved.</p>
              <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
                To unsubscribe from promotional emails, please contact us.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Promotional email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send promotional email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send OTP Email
 */
async function sendOTPEmail(userEmail, otp, firstName = 'User', purpose = 'signup') {
  try {
    let subject = '';
    let heading = '';
    let message = '';

    if (purpose === 'reset') {
      subject = 'Password Reset Code - SneakHub';
      heading = 'Password Reset';
      message = 'Here is the code to reset your password:';
    } else {
      subject = 'Your OTP Verification Code - SneakHub';
      heading = 'Verify Your Email';
      message = 'Your One-Time Password (OTP) for email verification is:';
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">SneakHub</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${heading}</p>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #1f2937; font-size: 16px; margin-top: 0;">Hi ${firstName},</p>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              ${message}
            </p>
            <div style="background: white; border: 2px solid #8b5cf6; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;">
              <p style="color: #8b5cf6; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 5px;">${otp}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin: 20px 0;">
              This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
            </p>
            <p style="color: #4b5563; font-size: 13px; margin: 15px 0;">
              If you didn't request this code, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © 2024 SneakHub. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent to:', userEmail, 'Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendShippingUpdateEmail,
  sendOrderStatusUpdateEmail,
  sendPromotionalEmail,
  sendOTPEmail,
  transporter
};
