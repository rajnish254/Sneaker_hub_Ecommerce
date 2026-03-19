import Link from "next/link";

const steps = [
  { label: "Order Confirmed", icon: "✔", color: "text-green-400", desc: "Today" },
  { label: "Processing", icon: "⚙️", color: "text-gray-400", desc: "Tomorrow" },
  { label: "Shipped", icon: "📦", color: "text-gray-400", desc: "Day 2" },
  { label: "In Transit", icon: "🚚", color: "text-gray-400", desc: "Day 2-3" },
  { label: "Delivered", icon: "✔", color: "text-gray-400", desc: "Day 3" },
];

export default function OrderTracking({ params }: { params: { orderId: string } }) {
  const currentStep = 0; // For demo, set to first step

  return (
    <div className="flex bg-[#101624] min-h-screen">
      {/* Tracking timeline */}
      <section className="flex-1 p-10">
        <h2 className="text-2xl font-bold text-white mb-8">Tracking</h2>
        <div className="flex flex-col gap-8">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${idx === currentStep ? "bg-green-900" : "bg-[#232a3a]"} ${idx === currentStep ? step.color : "text-gray-400"}`}>
                {step.icon}
              </div>
              <div>
                <div className={`text-lg font-bold ${idx === currentStep ? step.color : "text-gray-400"}`}>{step.label}</div>
                <div className="text-sm text-[#bfc8e6]">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Order summary */}
      <aside className="w-96 p-10 bg-[#181e2a] border-l border-[#232a3a] flex flex-col gap-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
          <div className="text-[#bfc8e6] text-sm mb-2">Subtotal <span className="float-right">₹0</span></div>
          <div className="text-[#bfc8e6] text-sm mb-2">Shipping <span className="float-right text-green-400">FREE</span></div>
          <div className="text-[#bfc8e6] text-sm mb-2">Tax <span className="float-right">₹0</span></div>
          <div className="text-white font-bold text-lg mt-4">Total <span className="float-right">₹0</span></div>
        </div>
        <div className="bg-[#181e2a] border border-blue-700 rounded-lg p-4 mb-4">
          <div className="text-blue-400 text-xs font-bold mb-1">ORDER NUMBER</div>
          <div className="text-white font-mono text-xl">#{params.orderId}</div>
        </div>
        <div className="flex gap-4 mb-4">
          <button className="bg-[#232a3a] text-white px-6 py-2 rounded font-semibold flex items-center gap-2">
            <span role="img" aria-label="return">↩️</span> Return / Exchange
          </button>
          <Link href="/products" className="bg-white text-black px-6 py-2 rounded font-semibold flex items-center gap-2">
            <span role="img" aria-label="shop">🛒</span> Continue Shopping
          </Link>
        </div>
        <div className="bg-[#232a3a] rounded-lg p-4">
          <div className="text-white font-bold mb-2">Need Help?</div>
          <div className="text-[#bfc8e6] text-sm mb-2">Our customer support team is available 24/7</div>
          <Link href="/support" className="text-blue-400 text-sm">&rarr; Contact Support</Link>
        </div>
      </aside>
    </div>
  );
}
