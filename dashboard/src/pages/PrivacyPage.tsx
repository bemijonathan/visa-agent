import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Lock, Eye, Trash2, Download, Mail } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
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
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">Privacy Policy</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Your privacy matters
          </h1>
          <p className="text-white/50 text-lg">
            Last updated: May 2, 2026
          </p>
        </div>

        {/* Summary card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 mb-12">
          <p className="text-white/80 text-lg leading-relaxed">
            <strong className="text-white">In short:</strong> We only collect data necessary to fill visa forms.
            Your data is stored securely and never sold to third parties.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {/* Information We Collect */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-amber-400" />
              Information We Collect
            </h2>
            <p className="text-white/60 mb-4">
              To provide form-filling functionality, we collect and store:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span><strong className="text-white/80">Profile Information:</strong> Name, date of birth, nationality, passport details, contact information, and employment details that you voluntarily provide</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span><strong className="text-white/80">Documents:</strong> Passport scans, bank statements, and other supporting documents you upload</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span><strong className="text-white/80">Account Information:</strong> Email address and authentication data when you sign in</span>
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-green-400" />
              How We Use Your Information
            </h2>
            <p className="text-white/60 mb-4">
              Your information is used exclusively to:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                <span>Auto-fill visa application forms on websites you visit</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                <span>Generate support letters for your visa applications</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                <span>Sync your profile data across devices</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                <span>Provide customer support when requested</span>
              </li>
            </ul>
          </section>

          {/* Data Storage & Security */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              Data Storage & Security
            </h2>
            <p className="text-white/60 mb-4">
              We take security seriously:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'All data encrypted in transit using HTTPS/TLS',
                'Data stored on secure, access-controlled servers',
                'Firebase Authentication for secure sign-in',
                'Cloudinary with secure access controls for documents'
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="text-white/70 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Data Sharing
            </h2>
            <p className="text-white/60 mb-4">
              We do <strong className="text-white">not</strong> sell, trade, or rent your personal information. We may share data only:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>With service providers necessary to operate the extension (database hosting, file storage)</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>If required by law or to protect our legal rights</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>With your explicit consent</span>
              </li>
            </ul>
          </section>

          {/* Form Filling */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Form Filling & Website Access
            </h2>
            <p className="text-white/60 mb-4">
              When you use the form-filling feature:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>The extension reads form field names to match them with your profile data</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>Data is only inserted into forms when you explicitly click "Fill"</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>We do not collect or store data from websites you visit</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 shrink-0" />
                <span>We do not track your browsing history</span>
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Your Rights
            </h2>
            <p className="text-white/60 mb-6">
              You have the right to:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <Eye className="w-5 h-5 text-blue-400 mb-3" />
                <h3 className="text-white font-medium mb-1">Access</h3>
                <p className="text-white/50 text-sm">View all data we have stored about you</p>
              </div>
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <Lock className="w-5 h-5 text-green-400 mb-3" />
                <h3 className="text-white font-medium mb-1">Correct</h3>
                <p className="text-white/50 text-sm">Update or modify your profile information</p>
              </div>
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <Trash2 className="w-5 h-5 text-red-400 mb-3" />
                <h3 className="text-white font-medium mb-1">Delete</h3>
                <p className="text-white/50 text-sm">Request deletion of your account and all data</p>
              </div>
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <Download className="w-5 h-5 text-purple-400 mb-3" />
                <h3 className="text-white font-medium mb-1">Export</h3>
                <p className="text-white/50 text-sm">Download a copy of your data</p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Data Retention
            </h2>
            <p className="text-white/60">
              We retain your data for as long as your account is active. If you delete your account,
              we will delete all associated data within 30 days, except where retention is required by law.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Children's Privacy
            </h2>
            <p className="text-white/60">
              This extension is not intended for children under 13. We do not knowingly collect
              information from children under 13.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Changes to This Policy
            </h2>
            <p className="text-white/60">
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by updating the "Last updated" date and, where appropriate, through the extension interface.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-amber-400" />
              Contact Us
            </h2>
            <p className="text-white/60 mb-4">
              If you have questions about this Privacy Policy or your data, please contact us at:
            </p>
            <a
              href="mailto:privacy@visaagent.app"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
            >
              privacy@visaagent.app
            </a>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-white/30 text-sm text-center">
            © 2026 Visa Agent. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
