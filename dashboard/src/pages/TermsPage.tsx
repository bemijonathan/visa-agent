import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, AlertTriangle, Scale, Ban, RefreshCw, Mail } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">Terms of Service</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-white/50 text-lg">
            Last updated: May 3, 2026
          </p>
        </div>

        {/* Summary card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-white/10 mb-12">
          <p className="text-white/80 text-lg leading-relaxed">
            <strong className="text-white">In short:</strong> Use Visa Agent responsibly for legitimate visa application purposes.
            You're responsible for the accuracy of data you enter and for complying with applicable laws.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {/* Agreement */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Scale className="w-6 h-6 text-amber-400" />
              Agreement to Terms
            </h2>
            <p className="text-white/60 mb-4">
              By accessing or using Visa Agent ("the Service"), including our Chrome extension and web dashboard,
              you agree to be bound by these Terms of Service. If you do not agree to these terms,
              do not use the Service.
            </p>
            <p className="text-white/60">
              We may update these terms from time to time. Continued use of the Service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Description of Service
            </h2>
            <p className="text-white/60 mb-4">
              Visa Agent provides tools to help immigration professionals manage client profiles,
              store documents, auto-fill visa application forms, and generate support letters. The Service includes:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>A web dashboard for managing client profiles and documents</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>A Chrome browser extension for auto-filling visa application forms</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>AI-powered document processing and letter generation</span>
              </li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              User Responsibilities
            </h2>
            <p className="text-white/60 mb-4">
              By using the Service, you agree to:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <h3 className="text-white font-medium mb-2">Provide Accurate Information</h3>
                <p className="text-white/50 text-sm">
                  You are solely responsible for the accuracy and completeness of all information
                  you enter into the Service. Visa Agent does not verify the accuracy of user-provided data.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <h3 className="text-white font-medium mb-2">Comply with Laws</h3>
                <p className="text-white/50 text-sm">
                  You must comply with all applicable laws and regulations, including immigration laws,
                  data protection regulations, and the terms of service of third-party visa portals.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <h3 className="text-white font-medium mb-2">Obtain Proper Authorization</h3>
                <p className="text-white/50 text-sm">
                  If you are an immigration consultant or agency, you must have proper authorization
                  from your clients to store and process their personal information.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <h3 className="text-white font-medium mb-2">Secure Your Account</h3>
                <p className="text-white/50 text-sm">
                  You are responsible for maintaining the security of your account credentials
                  and for all activities that occur under your account.
                </p>
              </div>
            </div>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Ban className="w-6 h-6 text-red-400" />
              Prohibited Uses
            </h2>
            <p className="text-white/60 mb-4">
              You may not use the Service to:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span>Submit fraudulent visa applications or falsified documents</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span>Violate any applicable laws or regulations</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span>Store or process data without proper consent from data subjects</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span>Attempt to reverse engineer, hack, or compromise the Service</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span>Resell or redistribute the Service without authorization</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span>Use automated scripts or bots to access the Service</span>
              </li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Intellectual Property
            </h2>
            <p className="text-white/60 mb-4">
              The Service, including its design, code, features, and content, is owned by Visa Agent
              and protected by intellectual property laws. You may not copy, modify, distribute, or
              create derivative works without our written permission.
            </p>
            <p className="text-white/60">
              You retain ownership of all data and documents you upload to the Service.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Disclaimer of Warranties
            </h2>
            <div className="p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-white/70 text-sm leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE
                THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR THAT IT WILL MEET YOUR SPECIFIC
                REQUIREMENTS. VISA AGENT IS A PRODUCTIVITY TOOL AND DOES NOT GUARANTEE VISA APPROVAL
                OR THE ACCURACY OF AUTO-FILLED DATA.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Limitation of Liability
            </h2>
            <p className="text-white/60 mb-4">
              To the maximum extent permitted by law, Visa Agent shall not be liable for:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>Visa application rejections or delays</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>Errors in auto-filled form data that you did not verify before submission</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>Any indirect, incidental, or consequential damages</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>Loss of data beyond what is covered by our backup procedures</span>
              </li>
            </ul>
          </section>

          {/* Account Termination */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-400" />
              Account Termination
            </h2>
            <p className="text-white/60 mb-4">
              We reserve the right to suspend or terminate your account if you violate these terms
              or engage in prohibited activities. You may also delete your account at any time
              through the dashboard settings.
            </p>
            <p className="text-white/60">
              Upon termination, your access to the Service will cease, and your data will be deleted
              in accordance with our Privacy Policy.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Governing Law
            </h2>
            <p className="text-white/60">
              These Terms shall be governed by and construed in accordance with applicable laws.
              Any disputes arising from these terms or your use of the Service shall be resolved
              through good-faith negotiation or, if necessary, binding arbitration.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Changes to These Terms
            </h2>
            <p className="text-white/60">
              We may modify these Terms at any time. We will notify you of material changes by
              updating the "Last updated" date and, for significant changes, through email or
              in-app notification. Your continued use of the Service after changes constitutes
              acceptance of the updated terms.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-amber-400" />
              Contact Us
            </h2>
            <p className="text-white/60 mb-4">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <a
              href="mailto:legal@visaagent.app"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
            >
              legal@visaagent.app
            </a>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © 2026 Visa Agent. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
