export default function OrderTimeline({ status }: { status: string }) {
  const steps = ["Placed", "Processing", "Shipped", "Delivered"];
  const currentStep = steps.indexOf(status);
  return (
    <ol className="flex items-center w-full">
      {steps.map((step, idx) => (
        <li key={step} className="flex-1 flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${idx <= currentStep ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>{idx + 1}</div>
          <span className={`text-xs ${idx <= currentStep ? "text-green-600" : "text-gray-400"}`}>{step}</span>
          {idx < steps.length - 1 && <div className={`h-1 w-full ${idx < currentStep ? "bg-green-500" : "bg-gray-200"}`}></div>}
        </li>
      ))}
    </ol>
  );
}
