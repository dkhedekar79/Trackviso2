import React, { useState, useEffect } from "react";

// Reusable onboarding modal that persists dismissal per user
// Usage: <OnboardingModal userId={user?.id} />
const OnboardingModal = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const storageKey = `onboardingDismissed_${userId || "guest"}`;

  const steps = [
    {
      title: "1/4 • Subjects",
      text:
        "Add your personal subjects in the subjects page, customise them and set a weekly goal for them.",
    },
    {
      title: "2/4 • Tasks & Schedule",
      text:
        "Set tasks in the tasks page, and add the details you want to it. Schedule it in the Schedule page to your very own calendar.",
    },
    {
      title: "3/4 • Study & Earn XP",
      text:
        "Study your subjects using a smart timer. Earn XP for completing study sessions, build up your study streak, and complete achievements and quests.",
    },
    {
      title: "4/4 • Insights",
      text:
        "In the insights page, get detailed statistics on your progress, with several metrics to maximise your productivity. Keep studying, gain prestige, and level up!.",
    },
  ];

  // Show only on first visit per user (or guest)
  useEffect(() => {
    const globalSeen = localStorage.getItem("seenOnboarding"); // legacy key support
    const seen = localStorage.getItem(storageKey);
    if (!seen && !globalSeen) setIsOpen(true);
  }, [storageKey]);

  const closeForever = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl text-left">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Trackviso</h2>
              <p className="text-gray-500 mt-1">A quick {steps.length}-step guide to get you started.</p>
            </div>
            <button
              aria-label="Close"
              className="ml-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={closeForever}
            >
              ✕
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">{steps[step].title}</h3>
            <p className="text-gray-600 mt-2">{steps[step].text}</p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={`px-4 py-2 rounded-lg text-sm ${
                step === 0
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Back
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={closeForever}
                className="px-4 py-2 rounded-lg text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Skip
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                  className="px-4 py-2 rounded-lg bg-[#6C5DD3] text-white hover:bg-[#7A6AD9]"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={closeForever}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Finish
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === step ? "bg-[#6C5DD3]" : "bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
