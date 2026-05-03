import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, MessageSquare, Clock, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Open mailto with form data
    const mailtoLink = `mailto:hello@visaagent.app?subject=${encodeURIComponent(formState.subject)}&body=${encodeURIComponent(`Name: ${formState.name}\nEmail: ${formState.email}\n\n${formState.message}`)}`
    window.location.href = mailtoLink
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
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
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Get in Touch</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Have questions about Visa Agent? Need help getting started?
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Email cards */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-white mb-4">
                Email Us
              </h2>

              <a
                href="mailto:hello@visaagent.app"
                className="block p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1 group-hover:text-emerald-400 transition-colors">
                      General Inquiries
                    </h3>
                    <p className="text-white/50 text-sm">hello@visaagent.app</p>
                    <p className="text-white/30 text-xs mt-1">Questions, feedback, partnerships</p>
                  </div>
                </div>
              </a>

              <a
                href="mailto:support@visaagent.app"
                className="block p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                      Technical Support
                    </h3>
                    <p className="text-white/50 text-sm">support@visaagent.app</p>
                    <p className="text-white/30 text-xs mt-1">Bug reports, technical issues</p>
                  </div>
                </div>
              </a>

              <a
                href="mailto:privacy@visaagent.app"
                className="block p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1 group-hover:text-purple-400 transition-colors">
                      Privacy & Data
                    </h3>
                    <p className="text-white/50 text-sm">privacy@visaagent.app</p>
                    <p className="text-white/30 text-xs mt-1">Data requests, privacy concerns</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Response time */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium mb-1">Response Time</h3>
                  <p className="text-white/50 text-sm">
                    We typically respond within 24-48 hours during business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-6">
              Send a Message
            </h2>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Message Ready</h3>
                <p className="text-white/50 text-sm">
                  Your email client should have opened with your message.
                  If not, please email us directly at hello@visaagent.app
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white/70 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    required
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="" className="bg-[#1a1a1a]">Select a topic</option>
                    <option value="General Inquiry" className="bg-[#1a1a1a]">General Inquiry</option>
                    <option value="Technical Support" className="bg-[#1a1a1a]">Technical Support</option>
                    <option value="Feature Request" className="bg-[#1a1a1a]">Feature Request</option>
                    <option value="Partnership" className="bg-[#1a1a1a]">Partnership</option>
                    <option value="Billing Question" className="bg-[#1a1a1a]">Billing Question</option>
                    <option value="Other" className="bg-[#1a1a1a]">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>

                <p className="text-white/30 text-xs text-center">
                  This will open your email client with a pre-filled message.
                </p>
              </form>
            )}
          </div>
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
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
