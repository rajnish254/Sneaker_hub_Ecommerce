# 👟 SneakHub - Premium Sneaker E-Commerce Store

A full-stack e-commerce platform for buying and selling premium sneakers with modern features, secure payments, and seamless user experience.

**Live Demo:** [https://sneaker-store-lake-nine.vercel.app](https://sneaker-store-lake-nine.vercel.app)

---

## 🎯 Key Features

### **User Authentication & Authorization**
- ✅ Email/Password sign up and login with OTP verification
- ✅ Google OAuth 2.0 authentication (Sign in with Google)
- ✅ Guest checkout option
- ✅ Password reset via email OTP
- ✅ Secure JWT token-based sessions (7-day expiry)
- ✅ Role-based access (User/Admin)

### **Product Management**
- ✅ Browse 100+ premium sneaker products
- ✅ Advanced filtering (brand, price, size, rating)
- ✅ Product search functionality
- ✅ Detailed product pages with images, specs, and reviews
- ✅ Stock management and availability tracking
- ✅ Product ratings and customer reviews

### **Shopping Features**
- ✅ **Wishlist** - Save favorite products, persist across sessions
- ✅ **Shopping Cart** - Add/remove items, update quantities
- ✅ **Cart Persistence** - Sync with backend, recover after logout
- ✅ Size selection with size chart
- ✅ Color/variant options
- ✅ Real-time inventory updates

### **Checkout & Payments**
- ✅ Secure checkout process
- ✅ **Multiple Payment Methods:**
  - Razorpay (Indian UPI, Cards, NetBanking)
  - Stripe (International cards)
  - Mock payment for testing
- ✅ Order confirmation with unique order ID
- ✅ Email receipts with order details
- ✅ Order status tracking

### **User Dashboard**
- ✅ View profile information (name, email, phone)
- ✅ Manage multiple addresses
- ✅ View order history with status tracking
- ✅ Track shipment status with timeline
- ✅ View wishlist items
- ✅ Review history
- ✅ Recently viewed products

### **Order Management**
- ✅ Real-time order status (Confirmed → Processing → Shipped → Delivered)
- ✅ Order tracking with timestamps
- ✅ Order history with filtering
- ✅ Order cancellation (if eligible)
- ✅ Email notifications on status updates

### **Reviews & Ratings**
- ✅ Submit product reviews with ratings (1-5 stars)
- ✅ View all product reviews with helpful votes
- ✅ Filter reviews by rating
- ✅ Review moderation

### **Additional Features**
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Dark theme with modern UI (Tailwind CSS)
- ✅ Loading states and skeleton screens
- ✅ Toast notifications (success, error, info)
- ✅ Form validation (email, password strength, OTP)
- ✅ Image upload via Cloudinary
- ✅ Email notifications (OTP, order confirmation, password reset)
- ✅ Admin dashboard (future feature)

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Next.js 16.1.6 (React 19.2.3)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.2.1
- **State Management:** Zustand
- **Form Validation:** React Hook Form + Zod
- **Authentication:** Google OAuth Library, JWT
- **Payments:** Razorpay SDK, Stripe.js
- **Notifications:** React Toastify
- **Image Upload:** Cloudinary
- **Deployment:** Vercel

### **Backend**
- **Runtime:** Node.js v22+
- **Framework:** Express.js
- **Language:** JavaScript
- **Database:** MongoDB Atlas (M0 Free Tier)
- **ODM:** Mongoose
- **Authentication:** JWT, Google Auth Library
- **Email:** Nodemailer (Gmail SMTP)
- **Image Upload:** Cloudinary SDK
- **Payments:** Razorpay API, Stripe API
- **Security:** CORS, Helmet, bcryptjs
- **Rate Limiting:** Express Rate Limiter
- **Deployment:** Railway / Render

---

## 📊 Project Structure

```
Sneaker-Store/
├── frontend/                    # Next.js frontend
│   ├── app/
│   │   ├── auth/               # Authentication pages
│   │   ├── products/           # Product listing & details
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Payment checkout
│   │   ├── dashboard/          # User dashboard
│   │   ├── wishlist/           # Wishlist page
│   │   └── components/         # Reusable components
│   └── lib/                    # API client, stores, utilities
│
├── backend/                     # Express.js backend
│   ├── src/
│   │   ├── models/             # MongoDB schemas
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, rate limiting
│   │   ├── utils/              # Email, payments, storage
│   │   └── server.js           # Main server file
│   └── package.json            # Dependencies
│
└── README.md                    # This file
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js v20+ and npm v10+
- MongoDB Atlas account (free M0 tier)
- Google OAuth credentials
- Razorpay test account
- Cloudinary account

### **Local Development Setup**

#### **1. Clone Repository**
```bash
git clone https://github.com/abhay-tomar03/Sneaker-Store.git
cd Sneaker-Store
```

#### **2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
# Server runs on http://localhost:5000
```

#### **3. Setup Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Update NEXT_PUBLIC_API_URL if needed
npm run dev
# App runs on http://localhost:3000
```

#### **4. Test Account**
- **Email:** testabhay889@gmail.com
- **Password:** Test@123
- No real payment will be processed (test mode)

---

## 🔐 Environment Variables

### **Backend (.env)**
```env
# MongoDB
MONGODB_URI=mongodb://user:pass@cluster.mongodb.net/sneaker-store?ssl=true

# JWT
JWT_SECRET=your_secret_key

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Razorpay (Test Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxxxx
```

---

## 📱 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google/verify` - Google OAuth verification
- `POST /api/auth/forgot-password` - Send password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### **Products**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=query` - Search products

### **Cart**
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/update` - Update item quantity
- `POST /api/users/sync-cart` - Sync cart with backend

### **Orders**
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/checkout/create-payment-intent` - Create order

### **Reviews**
- `GET /api/reviews/product/:id` - Get product reviews
- `POST /api/reviews` - Submit review
- `PUT /api/reviews/:id` - Update review

### **Users**
- `GET /api/users/data` - Get user profile
- `POST /api/users/sync-cart` - Sync cart
- `POST /api/users/sync-wishlist` - Sync wishlist
- `POST /api/users/addresses` - Manage addresses

---

## 🧪 Testing

### **Google OAuth Testing**
1. Sign up with Google on signup page
2. If account exists → Error: "Account already exists. Please sign in instead."
3. If account new → Account created & auto-login ✅

### **Payment Testing (Razorpay)**
- Test mode: All transactions are mock
- Use any card number: 4111111111111111
- Expiry: Any future date
- CVV: Any 3 digits

### **Email Testing**
- Use test email in checkout
- OTP sent to that email
- Check Gmail inbox (may take 30 seconds)

---

## 📈 Performance Metrics

- **Frontend Build:** ~5 seconds
- **Page Load:** <2 seconds
- **API Response Time:** <500ms (avg)
- **Database Queries:** Optimized with indexing
- **Images:** Optimized via Cloudinary CDN

---

## 🔒 Security Features

- ✅ **Password Hashing:** Bcryptjs (10 salt rounds)
- ✅ **JWT Tokens:** 7-day expiry
- ✅ **CORS:** Whitelist allowed origins
- ✅ **Rate Limiting:** 100 requests per 15 minutes
- ✅ **Input Validation:** Zod schema validation
- ✅ **HTTPS/SSL:** Required in production
- ✅ **Email Verification:** OTP-based verification
- ✅ **Google OAuth:** Verified ID tokens

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Abhay Tomar**
- GitHub: [@abhay-tomar03](https://github.com/abhay-tomar03)
- Email: abhay.tomar58699@gmail.com

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues, questions, or feature requests, please open a GitHub issue or contact the author.

---

## 🎓 Learning Resources

This project demonstrates:
- Full-stack MERN development
- OAuth 2.0 authentication
- Payment integration (Razorpay, Stripe)
- E-commerce best practices
- Modern frontend architecture (Next.js)
- RESTful API design
- Database design (MongoDB)
- Deployment strategies

---

**Happy Shopping! 👟✨**
