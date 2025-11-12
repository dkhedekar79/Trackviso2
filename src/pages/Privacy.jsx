import React from "react";
import { useTheme } from "../context/ThemeContext";
import DashboardViewToggle from "../components/DashboardViewToggle";
import { Settings } from "lucide-react";

export default function Privacy() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen mt-20">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Dashboard View Toggle Section */}
        <div className="flex justify-between items-center px-6 py-4 mb-8 bg-black rounded-lg border border-black/10">
          <div></div>
          <div className="flex items-center gap-4">
            <DashboardViewToggle />
          </div>
        </div>

        {/* Theme Selector */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Theme</h2>
          <p className="text-gray-600 mb-4">Choose how Trackviso looks. Default is Midnight Purple. You can also switch to Aurora (still developing) for a fresher vibe.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Midnight */}
            <button
              type="button"
              onClick={() => setTheme("midnight")}
              className={`text-left rounded-2xl p-4 border transition-all ${theme === "midnight" ? "ring-2 ring-[var(--primary)] border-transparent" : "border-gray-200 hover:shadow"}`}
              style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", color: "#fff" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Midnight</span>
                {theme === "midnight" && <span className="text-sm bg-white/20 px-2 py-0.5 rounded">Selected</span>}
              </div>
              <div className="h-20 rounded-xl" style={{ background: "linear-gradient(135deg,#6C5DD3,#3F3D56)" }}></div>
              <p className="mt-3 text-sm opacity-80">Deep purple accents, calm and focused.</p>
            </button>
            {/* Aurora */}
            <button
              type="button"
              onClick={() => setTheme("aurora")}
              className={`text-left rounded-2xl p-4 border transition-all ${theme === "aurora" ? "ring-2 ring-[var(--primary)] border-transparent" : "border-gray-200 hover:shadow"}`}
              style={{ background: "linear-gradient(135deg, #ecfeff, #e0f2fe)", color: "#064e3b" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Aurora</span>
                {theme === "aurora" && <span className="text-sm bg-black/10 px-2 py-0.5 rounded">Selected</span>}
              </div>
              <div className="h-20 rounded-xl" style={{ background: "linear-gradient(135deg,#10b981,#2563eb)" }}></div>
              <p className="mt-3 text-sm opacity-80">Blue/green gradient, bright and energetic.</p>
            </button>
          </div>
        </section>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy policy</h1>
        <p className="text-gray-700 mb-4">📜 Privacy Policy for Trackviso

              Last updated: [22.8.25]

              Trackviso (“we,” “our,” or ��us”) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and app.

              1. Information We Collect

              We may collect the following types of information when you use Trackademic:

              Personal Information: such as your name, email address, or account details when you sign up.

              Usage Data: information about how you use Trackademic (study sessions, tasks completed, device type, browser type, etc.).

              Cookies and Tracking Data: to improve your experience, track analytics, and serve ads (including Google AdSense, if enabled).

              2. How We Use Your Information

              We use the information we collect to:

              Provide and improve our services.

              Personalize your study dashboard and insights.

              Communicate with you about updates, features, or support.

              Show relevant ads (if AdSense or other ad networks are enabled).

              Ensure the security and functionality of Trackademic.

              3. Cookies and Third-Party Services

              We use cookies to enhance your experience. You can control cookies through your browser settings.

              If Google AdSense is active, Google may use cookies to serve ads based on your prior visits to Trackademic or other websites.

              You can opt out of personalized advertising by visiting Google Ads Settings
              .

              4. Data Sharing and Disclosure

              We do not sell or rent your personal data to third parties.
              We may share information only in the following cases:

              With service providers that help us run the site (e.g., hosting, analytics).

              If required by law, regulation, or legal request.

              To protect our rights, safety, or property.

              5. Data Retention and Security

              We retain your data only as long as necessary to provide our services or as required by law.

              We use reasonable security measures to protect your information, but no online system is 100% secure.

              6. Your Rights

              Depending on your location, you may have rights to:

              Access, correct, or delete your personal data.

              Opt out of marketing communications.

              Manage cookies and ad preferences.

              To exercise these rights, contact us at [your email address].

              7. Children’s Privacy

              Trackademic is not directed at children under 13 (or the age of digital consent in your country). We do not knowingly collect personal information from children.

              8. Changes to This Policy

              We may update this Privacy Policy from time to time. If we make significant changes, we’ll notify you through the site or by email.

             </p>
        <h1 id="contact" className="text-3xl font-bold text-gray-900 mb-6">Contact</h1>
        <p className="text-gray-700 mb-4">Email contact: dskhedekar7@gmail.com</p>
      </div>
    </div>
  );
}
