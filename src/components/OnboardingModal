import React, { useState, useEffect } from "react";

const OnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Welcome 🚀", text: "This app helps you track your studies easily." },
    { title: "Track ⏱️", text: "Log your study sessions and keep streaks alive." },
    { title: "Insights 📊", text: "Get stats and insights on your progress." },
  ];

  // Show only on first visit
  useEffect(() => {
    const seen = localStorage.getItem("seenOnboarding");
    if (!seen) setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("seenOnboarding", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg text-center">
        <h2 className="text-xl font-bold">{steps[step].title}</h2>
        <p className="text-gray-600 mt-2">{steps[step].text}</p>

        <div className="flex justify-between items-center mt-6">
          {step > 0 ? (
            <button
              className="px-4 py-2 text-sm text-gray-500"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < steps.length - 1 ? (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
              onClick={handleClose}
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
