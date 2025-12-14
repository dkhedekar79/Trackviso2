import React from 'react';
import SEO from '../components/SEO';

export default function Terms() {
  return (
    <>
      <SEO 
        title="Terms of Service - Trackviso"
        description="Read Trackviso's Terms of Service. Understand the rules and guidelines for using our gamified study tracking platform."
        keywords="trackviso terms, terms of service, study tracker terms"
        url="/terms"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mt-20 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last updated: September 2025</p>
        <div className="space-y-4 text-gray-700">
          <p>Welcome to Trackviso. By using our application, you agree to these Terms of Service.</p>
          <h3>Use Footer to exit</h3>
          <h2 className="text-xl font-semibold text-gray-900">Use of the Service</h2>
          <p>1. Introduction

Agreement between Trackviso and the user.

By using the site, the user accepts these terms.

2. Eligibility

Users must be 12+ or the age of online consent in your country.

If underage, need parental consent.

3. Account Registration

Users are responsible for keeping login info secure.

Trackviso reserves the right to suspend or terminate accounts for violations.

4. Acceptable Use

No illegal, abusive, or fraudulent activity.

No hacking, spamming, or attempts to disrupt services.

Respect other users on the platform.

5. Services Provided

Trackviso offers tools for study tracking, scheduling, and productivity insights.

Services may be updated or discontinued at any time.

6. User Content & Data

Users own the content they create.

By uploading, they grant Trackviso a limited license to use it (only for providing the service).

No sharing of sensitive/illegal content.

7. Privacy & Data Protection

Trackviso collects and processes personal data according to the Privacy Policy.

Data is stored securely and not sold to third parties.

8. Disclaimers

Trackviso provides services “as is” with no guarantee of uninterrupted availability.

Not responsible for data loss, downtime, or third-party issues.

9. Limitation of Liability

Trackviso is not liable for indirect damages (lost grades, opportunities, profits, etc.).

Maximum liability is limited to what the user paid for services.

10. Termination

Users can delete their account anytime.

Trackviso may suspend/terminate accounts for ToS violations.

11. Governing Law

Terms governed by the laws of [your country/jurisdiction].

12. Changes to Terms

Trackviso may update the ToS.

Continued use of the service = acceptance of new terms.

13. Contact Information

Support email or contact form link for user questions.</p>
          <h2 className="text-xl font-semibold text-gray-900">Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account and password.</p>
          <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
          <p>If you have any questions about these Terms, contact us at <a className="text-indigo-600 hover:underline" href="mailto:dskhedekar7@gmail.com">dskhedekar7@gmail.com</a>.</p>

        </div>
      </div>
    </div>
    </>
  );
}
