import { Link } from 'react-router-dom'
import { Users, FileText, Upload, PenTool, ArrowRight, Globe, Zap, ChevronDown, Check, FileUp, Scan, MousePointer, Download, ArrowDown } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-semibold">Visa Agent</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-white/60 hover:text-white">
              Sign in
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-white/90"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Problem Statement */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.953 6.848c.062.003.123.007.186.01.063.003.127.005.19.005 6.627 0 12-5.373 12-12 0-.691-.058-1.369-.169-2.03z"/>
            </svg>
            <span className="text-sm font-medium text-white/70">Chrome Extension + Dashboard</span>
          </div>

          <p className="text-amber-400 text-sm font-medium mb-4">For Immigration Consultants & Visa Agencies</p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            You're typing the same
            <br />
            <span className="text-white/40">passport details over and over</span>
          </h1>

          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-8">
            Every client. Every form. Every embassy portal.
            The same 50 fields, manually entered, hundreds of times a month.
          </p>

          <p className="text-lg text-white/70 mb-12">
            <span className="text-amber-400">There's a better way.</span> Let us show you.
          </p>

          <a href="#how-it-works" className="inline-flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors mb-8">
            <span className="text-sm">See how it works</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>

          <div className="flex items-center justify-center gap-6 text-sm text-white/30">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              No data retention
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Never sold
            </span>
          </div>
        </div>
      </section>

      {/* How it works - Two parts */}
      <section id="how-it-works" className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-white/40 text-sm mb-8">Two tools that work together</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Web Dashboard</h3>
              <p className="text-white/50 text-sm">
                Manage client profiles, upload documents, generate letters. Your central hub for all client data.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.953 6.848c.062.003.123.007.186.01.063.003.127.005.19.005 6.627 0 12-5.373 12-12 0-.691-.058-1.369-.169-2.03z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Chrome Extension</h3>
              <p className="text-white/50 text-sm">
                Auto-fill any visa form on the web. Select a client, click fill, and watch the form complete itself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: Add a Client */}
      <section id="step-1" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center">1</div>
            <p className="text-amber-400 font-medium">Step 1</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Add a client in seconds
              </h2>
              <p className="text-lg text-white/50 mb-8">
                Create a client profile with their basic info. Or just drop their passport scan and we'll extract everything automatically.
              </p>

              <ul className="space-y-4">
                {[
                  'Name, DOB, nationality auto-detected',
                  'Passport number & expiry extracted',
                  'Works with scans, photos, or PDFs',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual: Client creation form mockup */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                  JS
                </div>
                <div>
                  <p className="font-medium">New Client</p>
                  <p className="text-sm text-white/40">Adding profile...</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/40 mb-2">Full Name</p>
                  <p className="font-medium">James Richardson</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/40 mb-2">Passport No.</p>
                    <p className="font-medium">GB7284651</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/40 mb-2">Expiry</p>
                    <p className="font-medium">2029-03-15</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/40 mb-2">Nationality</p>
                    <p className="font-medium">British</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/40 mb-2">Date of Birth</p>
                    <p className="font-medium">1985-07-22</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <Scan className="w-5 h-5 text-emerald-400" />
                <p className="text-sm text-emerald-400">All fields extracted from passport scan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arrow connector */}
      <div className="flex justify-center py-8">
        <ArrowDown className="w-6 h-6 text-white/20" />
      </div>

      {/* Step 2: Upload Documents */}
      <section id="step-2" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center">2</div>
            <p className="text-amber-400 font-medium">Step 2</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual: Document upload */}
            <div className="order-2 lg:order-1 bg-white/[0.03] rounded-2xl border border-white/10 p-6">
              <p className="text-sm text-white/40 mb-4">Client Documents</p>

              <div className="space-y-3">
                {[
                  { name: 'passport_scan.pdf', status: 'Extracted', icon: '🛂' },
                  { name: 'bank_statement_mar.pdf', status: 'Extracted', icon: '🏦' },
                  { name: 'flight_booking.pdf', status: 'Extracted', icon: '✈️' },
                  { name: 'hotel_reservation.pdf', status: 'Extracted', icon: '🏨' },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xl">{doc.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-white/40">PDF • 2.4 MB</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-medium">{doc.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-white/10 text-center">
                <FileUp className="w-6 h-6 text-white/30 mx-auto mb-2" />
                <p className="text-sm text-white/40">Drop more files or click to upload</p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Upload their documents
              </h2>
              <p className="text-lg text-white/50 mb-8">
                Bank statements, flight bookings, hotel reservations, employer letters. Drop them all in. Our AI reads every document and extracts the relevant data.
              </p>

              <ul className="space-y-4">
                {[
                  'Bank balances & transaction history',
                  'Flight dates, routes, and PNR numbers',
                  'Hotel check-in/out dates and addresses',
                  'Employment details and salary info',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Arrow connector */}
      <div className="flex justify-center py-8">
        <ArrowDown className="w-6 h-6 text-white/20" />
      </div>

      {/* Step 3: Fill Any Form */}
      <section id="step-3" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center">3</div>
            <p className="text-amber-400 font-medium">Step 3</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.953 6.848c.062.003.123.007.186.01.063.003.127.005.19.005 6.627 0 12-5.373 12-12 0-.691-.058-1.369-.169-2.03z"/>
                </svg>
                <span className="text-xs font-medium text-blue-400">Chrome Extension</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Open any visa form.
                <br />
                <span className="text-white/40">Click fill. Done.</span>
              </h2>
              <p className="text-lg text-white/50 mb-8">
                Install our Chrome extension, open any embassy website or visa portal. The extension detects all form fields and fills them instantly with your client's data.
              </p>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-sm text-white/40 mb-4">Works with</p>
                <div className="flex flex-wrap gap-3">
                  {['VFS Global', 'TLS Contact', 'BLS International', 'Embassy portals', 'iDATA', 'All standard forms'].map((portal) => (
                    <span key={portal} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-white/70 border border-white/10">
                      {portal}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual: Form filling */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
              {/* Browser chrome */}
              <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-white/5 rounded-md flex items-center px-3">
                    <span className="text-xs text-white/30">vfs.schengen-visa.gov/application</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <p className="font-medium">Schengen Visa Application</p>
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Fill All
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Surname', value: 'Richardson', filled: true },
                    { label: 'First Name', value: 'James', filled: true },
                    { label: 'Date of Birth', value: '22/07/1985', filled: true },
                    { label: 'Passport Number', value: 'GB7284651', filled: true },
                    { label: 'Nationality', value: 'British', filled: false, filling: true },
                  ].map((field) => (
                    <div key={field.label} className="flex items-center gap-4">
                      <div className={`flex-1 p-3 rounded-lg border ${
                        field.filled
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : field.filling
                            ? 'bg-amber-500/10 border-amber-500/30 animate-pulse'
                            : 'bg-white/5 border-white/10'
                      }`}>
                        <p className="text-xs text-white/40 mb-1">{field.label}</p>
                        <p className="font-medium">{field.value}</p>
                      </div>
                      {field.filled && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                      {field.filling && (
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center animate-spin">
                          <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-emerald-400">4 of 47 fields filled • 2 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arrow connector */}
      <div className="flex justify-center py-8">
        <ArrowDown className="w-6 h-6 text-white/20" />
      </div>

      {/* Step 4: Generate Letters */}
      <section id="step-4" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center">4</div>
            <p className="text-amber-400 font-medium">Step 4</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual: Letter generation */}
            <div className="order-2 lg:order-1 bg-white/[0.03] rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="font-medium">Cover Letter</p>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-medium">AI Generated</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white/70 leading-relaxed">
                <p className="mb-4">Dear Visa Officer,</p>
                <p className="mb-4">
                  I am writing to support the Schengen visa application of <span className="text-amber-400">Mr. James Richardson</span>,
                  a British national (Passport: <span className="text-amber-400">GB7284651</span>).
                </p>
                <p className="mb-4">
                  Mr. Richardson intends to travel to <span className="text-amber-400">France</span> from
                  <span className="text-amber-400"> March 15, 2026</span> to <span className="text-amber-400">March 25, 2026</span> for tourism purposes.
                  He has confirmed accommodation at <span className="text-amber-400">Hotel Le Marais, Paris</span>.
                </p>
                <p className="text-white/40">...</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
                  Edit Letter
                </button>
                <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-semibold flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Generate support letters
                <br />
                <span className="text-white/40">with one click</span>
              </h2>
              <p className="text-lg text-white/50 mb-8">
                Cover letters, invitation letters, employer letters—generated instantly using your client's actual data. Review, edit if needed, and download as PDF.
              </p>

              <ul className="space-y-4">
                {[
                  "Personalized with client's real information",
                  'Professional formatting, ready to submit',
                  'Edit and refine with AI assistance',
                  'Download as PDF or copy text',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your clients' data stays yours
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Privacy isn't a feature—it's how we built this from day one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">No Data Retention</h3>
              <p className="text-sm text-white/50">
                Delete a client and everything goes. We don't keep copies, backups, or shadows of your data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">End-to-End Encrypted</h3>
              <p className="text-sm text-white/50">
                All data encrypted in transit and at rest. Your clients' passport details are never exposed.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Never Sold or Shared</h3>
              <p className="text-sm text-white/50">
                We don't sell data. We don't share with third parties. No ads, no tracking, no exceptions.
              </p>
            </div>
          </div>

          <p className="text-center text-white/30 text-sm mt-8">
            GDPR compliant • Your data, your control • Delete anytime
          </p>
        </div>
      </section>

      {/* Result Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-amber-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 font-medium mb-6">The Result</p>

          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            What used to take 45 minutes
            <br />
            <span className="text-amber-400">now takes 2 minutes</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { before: '45 min', after: '2 min', label: 'Per application' },
              { before: '10/day', after: '50/day', label: 'Applications processed' },
              { before: 'Manual', after: 'Zero', label: 'Data entry errors' },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-2xl text-white/30 line-through">{stat.before}</span>
                  <ArrowRight className="w-5 h-5 text-amber-400" />
                  <span className="text-2xl font-bold text-amber-400">{stat.after}</span>
                </div>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to process visas faster?
          </h2>
          <p className="text-lg text-white/50 mb-8">
            Start with 5 client profiles free. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-base font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-500/20 transition-all"
            >
              Create free account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white text-base font-medium rounded-xl hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.953 6.848c.062.003.123.007.186.01.063.003.127.005.19.005 6.627 0 12-5.373 12-12 0-.691-.058-1.369-.169-2.03z"/>
              </svg>
              Get Chrome Extension
            </a>
          </div>

          <p className="text-sm text-white/30 mt-8">
            Used by immigration consultants in 40+ countries
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold">Visa Agent</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <a href="mailto:hello@visaagent.app" className="hover:text-white">Contact</a>
          </div>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Visa Agent</p>
        </div>
      </footer>
    </div>
  )
}
