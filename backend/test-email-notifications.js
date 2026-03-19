/**
 * EMAIL NOTIFICATIONS TEST API
 * Test endpoints for order status updates and promotional emails
 */

const BASE_URL = 'http://localhost:5000/api/orders';

// ============================================
// TEST 1: Update Order Status to "Shipped"
// ============================================
async function testOrderShipped(orderId, trackingNumber) {
  console.log('🚚 Testing Order Shipped Email...');
  try {
    const response = await fetch(`${BASE_URL}/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'shipped',
        trackingNumber: trackingNumber || 'FEDEX' + Math.random().toString(36).substr(2, 9).toUpperCase()
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Order Shipped email sent successfully');
      console.log('📦 Response:', data);
    } else {
      console.error('❌ Failed to update status:', data.error);
    }
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================
// TEST 2: Update Order Status to "Delivered"
// ============================================
async function testOrderDelivered(orderId) {
  console.log('✅ Testing Order Delivered Email...');
  try {
    const response = await fetch(`${BASE_URL}/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'delivered'
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Order Delivered email sent successfully');
      console.log('📦 Response:', data);
    } else {
      console.error('❌ Failed to update status:', data.error);
    }
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================
// TEST 3: Update Order Status to "Cancelled"
// ============================================
async function testOrderCancelled(orderId) {
  console.log('❌ Testing Order Cancelled Email...');
  try {
    const response = await fetch(`${BASE_URL}/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'cancelled'
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Order Cancelled email sent successfully');
      console.log('📦 Response:', data);
    } else {
      console.error('❌ Failed to update status:', data.error);
    }
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================
// TEST 4: Send Promotional Email
// ============================================
async function testPromotionalEmail(email, customOptions = {}) {
  console.log('🎉 Testing Promotional Email...');
  try {
    const payload = {
      email,
      firstName: customOptions.firstName || 'John',
      title: customOptions.title || '🎉 Summer Flash Sale - 50% Off Sneakers!',
      discount: customOptions.discount || '50% OFF',
      code: customOptions.code || 'SUMMER50',
      expiryDate: customOptions.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      description: customOptions.description || 'Get your favorite sneakers at unbeatable prices! Limited time offer for our valued customers.',
      buttonText: customOptions.buttonText || 'Shop Now',
      buttonLink: customOptions.buttonLink || 'http://localhost:3000/products'
    };

    console.log('📧 Sending to:', email);
    console.log('📋 Promo Details:', {
      title: payload.title,
      discount: payload.discount,
      code: payload.code
    });

    const response = await fetch(`${BASE_URL}/email/promotional`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Promotional email sent successfully!');
      console.log('📬 Message ID:', data.messageId);
    } else {
      console.error('❌ Failed to send promotional email:', data.error);
    }
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================
// TEST 5: Send Multiple Promotional Emails
// ============================================
async function testBulkPromotionalEmail(emails, campaignName) {
  console.log(`📧 Sending ${emails.length} promotional emails for: ${campaignName}`);
  
  const campaigns = {
    'summer_sale': {
      title: '☀️ Summer Sale - 50% Off Everything!',
      discount: '50% OFF',
      code: 'SUMMER50',
      description: 'Beat the heat with our amazing summer collection!'
    },
    'new_launch': {
      title: '🎉 Exclusive New Launch - First 100 Orders Get 30% Off!',
      discount: '30% OFF',
      code: 'NEWLAUNCH30',
      description: 'Be among the first to get our latest sneaker collection!'
    },
    'flash_sale': {
      title: '⚡ 24-Hour Flash Sale - 40% Off',
      discount: '40% OFF',
      code: 'FLASH40',
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: 'Hurry! This is a limited time offer. Offer expires in 24 hours!'
    },
    'loyalty_reward': {
      title: '🎁 Loyalty Reward - 25% Off Your Next Purchase',
      discount: '25% OFF',
      code: 'LOYAL25',
      description: 'Thank you for being a valued customer! Enjoy this exclusive discount.'
    }
  };

  const campaign = campaigns[campaignName] || campaigns['summer_sale'];

  for (const email of emails) {
    try {
      await testPromotionalEmail(email, campaign);
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error.message);
    }
  }

  console.log(`✅ Bulk email campaign completed for ${emails.length} recipients`);
}

// ============================================
// DEMO/USAGE EXAMPLES
// ============================================

// Example 1: Test with a single order
async function demoSingleOrder() {
  console.log('\n========== DEMO: Single Order Status Updates ==========\n');
  
  const orderId = 'YOUR_ORDER_ID_HERE'; // Replace with actual order ID
  
  // Test order shipped
  await testOrderShipped(orderId, 'FEDEX123456789');
  
  // Wait a bit before next test
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test order delivered
  await testOrderDelivered(orderId);
}

// Example 2: Test promotional emails
async function demoPromotionalEmails() {
  console.log('\n========== DEMO: Promotional Emails ==========\n');
  
  // Send to single customer
  await testPromotionalEmail('customer@example.com', {
    firstName: 'Alex',
    title: '🎊 Exclusive Weekend Offer',
    discount: '35% OFF',
    code: 'WEEKEND35',
    description: 'This weekend only! Get 35% off on all sneakers.'
  });
}

// Example 3: Bulk promotional campaign
async function demoBulkPromotion() {
  console.log('\n========== DEMO: Bulk Promotional Campaign ==========\n');
  
  const customerEmails = [
    'customer1@example.com',
    'customer2@example.com',
    'customer3@example.com'
    // Add more customer emails as needed
  ];
  
  await testBulkPromotionalEmail(customerEmails, 'summer_sale');
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testOrderShipped,
    testOrderDelivered,
    testOrderCancelled,
    testPromotionalEmail,
    testBulkPromotionalEmail,
    demoSingleOrder,
    demoPromotionalEmails,
    demoBulkPromotion
  };
}

// Run tests (uncomment to run)
// demoSingleOrder();
// demoPromotionalEmails();
// demoBulkPromotion();
