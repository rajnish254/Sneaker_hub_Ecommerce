'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { apiEndpoints, getApiUrl } from '@/lib/apiConfig';
import Link from 'next/link';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const clearCart = useStore((state) => state.clearCart);
  const user = useStore((state) => state.user);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  // Track if payment is being processed
  const isProcessingPayment = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [step, setStep] = useState<'address' | 'review'>('address');
  const [address, setAddress] = useState({
    firstName: user?.firstName || '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Shipping method options
  const shippingOptions = {
    standard: 99,
    express: 299,
    overnight: 499,
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate shipping based on selected method and subtotal
  const getShipping = () => {
    if (subtotal >= 5000) {
      return 0; // Free shipping for orders >= 5000
    }
    return shippingOptions[shippingMethod as keyof typeof shippingOptions] || 99;
  };

  const shipping = getShipping();
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  // ⭐ Check authentication on mount
  useEffect(() => {
    setIsLoading(true);
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    // Don't redirect if we're in the middle of payment processing
    if (cart.length === 0 && !isProcessingPayment.current) {
      router.push('/cart');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, cart.length, router]);

  // ⭐ Load Razorpay script ONLY once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script already exists
    if (window.Razorpay) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
      // console.log('✅ Razorpay script loaded successfully');
    };

    script.onerror = () => {
      setError('Failed to load Razorpay. Please refresh and try again.');
      console.error('❌ Failed to load Razorpay script');
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a2332] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4 mx-auto"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || cart.length === 0) {
    return null;
  }

  const validateAddress = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!address.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (address.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!address.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (address.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!address.email.trim()) {
      errors.email = 'Email is required';
    } else if (!address.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }

    if (!address.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone number must be 10 digits';
    }

    if (!address.address.trim()) {
      errors.address = 'Address is required';
    } else if (address.address.trim().length < 5) {
      errors.address = 'Please enter a complete address';
    }

    if (!address.city.trim()) {
      errors.city = 'City is required';
    } else if (address.city.trim().length < 2) {
      errors.city = 'Please enter a valid city name';
    }

    if (!address.state.trim()) {
      errors.state = 'State is required';
    }

    if (!address.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(address.pincode.replace(/\D/g, ''))) {
      errors.pincode = 'Pincode must be 6 digits';
    }

    return errors;
  };

  const handleReviewOrder = () => {
    const errors = validateAddress();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fill in all required fields correctly');
      toast.error('❌ Please fill in all required fields correctly', { autoClose: 3000 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setValidationErrors({});
    setError('');
    toast.success('✅ Address validated!', { autoClose: 1500 });
    setStep('review');
  };

  const handlePayment = async () => {
    try {
      setError('');
      setLoading(true);

      // ⭐ Check if Razorpay script is loaded
      if (!scriptLoaded || !window.Razorpay) {
        const errorMsg = 'Razorpay is loading. Please wait a moment and try again.';
        setError(errorMsg);
        toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
        setLoading(false);
        return;
      }

      setLoading(true);

      // Prepare order items
      const items = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
      }));

      // Prepare address
      const shippingAddress = {
        firstName: address.firstName,
        lastName: address.lastName,
        email: address.email,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      };

      console.log('📦 Creating payment intent with amount:', total);

      // ⭐ Create Razorpay order
      const createResponse = await fetch(getApiUrl(apiEndpoints.checkout.createPaymentIntent), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          amount: total,
          items,
          shippingAddress,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const orderData = await createResponse.json();
      // console.log('✅ Order created:', orderData);

      if (!orderData.razorpay_order_id || !orderData.razorpay_key_id) {
        throw new Error('Invalid order response from server');
      }

      // ⭐ Initialize Razorpay modal
      const options = {
        key: orderData.razorpay_key_id,
        amount: total * 100, // Amount in paise
        currency: 'INR',
        name: 'SneakHub',
        description: `Order for ${cart.length} items`,
        order_id: orderData.razorpay_order_id,
        modal: {
          escape: false,
        },
        handler: async (response: RazorpayResponse) => {
          try {
            console.log('💳 Payment successful, confirming...');

            // ⭐ Confirm payment with backend
            const confirmResponse = await fetch(getApiUrl(apiEndpoints.checkout.confirmPayment), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
              },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                items,
                shippingAddress,
                totalAmount: total,
              }),
            });

            if (!confirmResponse.ok) {
              const errorData = await confirmResponse.json();
              throw new Error(errorData.error || 'Failed to confirm payment');
            }

            const orderResponse = await confirmResponse.json();
            console.log('✅ Payment confirmed, order ID:', orderResponse.orderId);

            toast.success('✅ Payment successful! Order confirmed!', { autoClose: 2000 });

            // ⭐ Mark payment as processing (prevents cart check from redirecting)
            isProcessingPayment.current = true;
            
            // Clear cart and redirect
            clearCart();
            router.push(`/order-success/${orderResponse.orderId}`);
          } catch (err: any) {
            console.error('❌ Payment confirmation error:', err);
            const errorMsg = err.message || 'Failed to confirm payment';
            setError(errorMsg);
            toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
            setLoading(false);
          }
        },
        prefill: {
          name: `${address.firstName} ${address.lastName}`,
          email: address.email,
          contact: address.phone,
        },
        theme: {
          color: '#7c3aed',
        },
        ondismiss: () => {
          console.log('❌ Payment dismissed');
          const errorMsg = 'Payment cancelled. Please try again.';
          setError(errorMsg);
          toast.info(`⏭️ ${errorMsg}`, { autoClose: 2000 });
          setLoading(false);
        },
      };

      console.log('🚀 Opening Razorpay modal...');

      // ⭐ Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('❌ Payment failed:', response);
        const errorMsg = `Payment failed: ${response.error.description}`;
        setError(errorMsg);
        toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      const errorMsg = err.message || 'Failed to initiate payment. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 3000 });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a2332] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Back Button */}
        <Link href="/cart" className="text-purple-400 hover:text-purple-300 mb-6 inline-block">
          ← Back to Cart
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a2332] rounded-lg p-8 border border-[#232a3a]">
              <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

              {/* Step Indicator */}
              <div className="flex gap-4 mb-8">
                {(['address', 'review'] as const).map((s, idx) => (
                  <div key={s} className="flex-1">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full font-bold mb-2 ${
                        step === s
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-[#2d3f52] text-[#7a8ba8]'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-sm font-semibold capitalize text-[#bfc8e6]">{s}</p>
                  </div>
                ))}
              </div>

              {/* STEP 1: Address Form */}
              {step === 'address' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Shipping Address</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {/* First Name */}
                      <div>
                        <input
                          type="text"
                          placeholder="First Name"
                          value={address.firstName}
                          onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                          className={`w-full bg-[#2d3f52] border ${
                            validationErrors.firstName ? 'border-red-500' : 'border-[#3d4f62]'
                          } text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none ${
                            validationErrors.firstName ? 'focus:border-red-500' : 'focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.firstName && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.firstName}</p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={address.lastName}
                          onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                          className={`w-full bg-[#2d3f52] border ${
                            validationErrors.lastName ? 'border-red-500' : 'border-[#3d4f62]'
                          } text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none ${
                            validationErrors.lastName ? 'focus:border-red-500' : 'focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.lastName && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.lastName}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="col-span-2">
                        <input
                          type="email"
                          placeholder="Email"
                          value={address.email}
                          onChange={(e) => setAddress({ ...address, email: e.target.value })}
                          className={`w-full bg-[#2d3f52] border ${
                            validationErrors.email ? 'border-red-500' : 'border-[#3d4f62]'
                          } text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none ${
                            validationErrors.email ? 'focus:border-red-500' : 'focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.email && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="col-span-2">
                        <input
                          type="tel"
                          placeholder="Phone (10 digits)"
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          className={`w-full bg-[#2d3f52] border ${
                            validationErrors.phone ? 'border-red-500' : 'border-[#3d4f62]'
                          } text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none ${
                            validationErrors.phone ? 'focus:border-red-500' : 'focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.phone && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.phone}</p>
                        )}
                      </div>

                      {/* Address */}
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={address.address}
                          onChange={(e) => setAddress({ ...address, address: e.target.value })}
                          className={`w-full bg-[#2d3f52] border ${
                            validationErrors.address ? 'border-red-500' : 'border-[#3d4f62]'
                          } text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none ${
                            validationErrors.address ? 'focus:border-red-500' : 'focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.address && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.address}</p>
                        )}
                      </div>

                      {/* City */}
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className={`w-full bg-[#2d3f52] border ${
                            validationErrors.city ? 'border-red-500' : 'border-[#3d4f62]'
                          } text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none ${
                            validationErrors.city ? 'focus:border-red-500' : 'focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.city && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.city}</p>
                        )}
                      </div>

                      {/* State */}
                      <div>
                        <input
                          type="text"
                          placeholder="State"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className={`w-full bg-[#2d3f52] border ${
                            validationErrors.state ? 'border-red-500' : 'border-[#3d4f62]'
                          } text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none ${
                            validationErrors.state ? 'focus:border-red-500' : 'focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.state && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.state}</p>
                        )}
                      </div>

                      {/* Pincode */}
                      <div>
                        <input
                          type="text"
                          placeholder="Pincode (6 digits)"
                          value={address.pincode}
                          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                          className={`w-full bg-[#2d3f52] border ${
                            validationErrors.pincode ? 'border-red-500' : 'border-[#3d4f62]'
                          } text-white placeholder-[#7a8ba8] rounded-lg px-4 py-3 focus:outline-none ${
                            validationErrors.pincode ? 'focus:border-red-500' : 'focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.pincode && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.pincode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Shipping Method</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'standard', label: 'Standard Delivery (3-5 days)', cost: 99 },
                        { id: 'express', label: 'Express Delivery (1-2 days)', cost: 299 },
                        { id: 'overnight', label: 'Overnight Delivery', cost: 499 },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                            shippingMethod === method.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-[#3d4f62] hover:border-purple-500/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={shippingMethod === method.id}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="ml-3 text-white flex-1">{method.label}</span>
                          <span className="text-purple-400">
                            {subtotal >= 5000 ? 'FREE' : `+₹${method.cost}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Review Order Button */}
                  <button
                    onClick={handleReviewOrder}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-600/50 disabled:to-pink-600/50 text-white font-bold py-4 rounded-lg transition-all text-lg"
                  >
                    Review Order →
                  </button>
                </>
              )}

              {/* STEP 2: Review Order */}
              {step === 'review' && (
                <>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Items</h3>
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between py-2 text-[#bfc8e6] border-b border-[#232a3a]">
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex justify-between text-[#bfc8e6] mb-2">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#bfc8e6] mb-2">
                        <span>Shipping:</span>
                        <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                      </div>
                      <div className="flex justify-between text-[#bfc8e6] py-2 border-t border-purple-500/30">
                        <span>Tax:</span>
                        <span>₹{tax}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-purple-500/30">
                        <span className="text-white font-bold">Total:</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                          ₹{total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Pay with Razorpay Section */}
                    <div className="bg-[#1a2535] border border-[#3d4f62] rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">💳</span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold">Pay with Razorpay</h3>
                          <p className="text-[#7a8ba8] text-sm">Secure & trusted payment gateway</p>
                        </div>
                      </div>
                      <p className="text-[#bfc8e6] text-sm mb-4">
                        You will be redirected to Razorpay to complete your payment securely.
                      </p>
                      <button
                        onClick={handlePayment}
                        disabled={loading || !scriptLoaded}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-600/50 disabled:to-purple-600/50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Processing...
                          </>
                        ) : !scriptLoaded ? (
                          <>
                            <span>📦</span>
                            Loading...
                          </>
                        ) : (
                          <>
                            <span>💳</span>
                            Pay ₹{total.toLocaleString()} with Razorpay
                          </>
                        )}
                      </button>
                    </div>

                    {/* Back Button */}
                    <button
                      onClick={() => setStep('address')}
                      disabled={loading}
                      className="w-full bg-[#2d3f52] hover:bg-[#3d4f62] text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2332] rounded-lg p-6 border border-[#232a3a] sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}`}
                    className="flex justify-between items-start text-sm"
                  >
                    <div className="flex-1">
                      <p className="text-white">{item.name}</p>
                      <p className="text-[#7a8ba8] text-xs">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-purple-400 font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#3d4f62] pt-4 space-y-3">
                <div className="flex justify-between text-[#bfc8e6]">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#bfc8e6]">
                  <span>Shipping</span>
                  <span className="text-green-400 font-semibold">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#bfc8e6]">
                  <span>Tax (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white mt-4 pt-4 border-t border-[#3d4f62]">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {!scriptLoaded && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-400 text-xs">
                  Loading payment system...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
