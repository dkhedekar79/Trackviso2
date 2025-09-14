import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mt-20 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last updated: September 2025</p>
        <div className="space-y-4 text-gray-700">
          <p>Welcome to Trackviso. By using our application, you agree to these Terms of Service.</p>
          <h2 className="text-xl font-semibold text-gray-900">Use of the Service</h2>
          <p>You agree to use the service responsibly and comply with applicable laws and regulations.</p>
          <h2 className="text-xl font-semibold text-gray-900">Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account and password.</p>
          <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
          <p>If you have any questions about these Terms, contact us at <a className="text-indigo-600 hover:underline" href="mailto:dskhedekar7@gmail.com">dskhedekar7@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
