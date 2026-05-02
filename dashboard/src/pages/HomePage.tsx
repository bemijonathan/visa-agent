import { Link } from 'react-router-dom'
import { FileText, Upload, PenTool, Shield, ArrowRight, Globe, Zap, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Document Intelligence',
    description: 'Drop your passport, statements, bookings. AI reads everything.',
  },
  {
    icon: FileText,
    title: 'Instant Form Fill',
    description: 'One click fills any visa form. Embassy sites, VFS, all of them.',
  },
  {
    icon: PenTool,
    title: 'Letter Generation',
    description: 'Cover letters, invitations, employer letters. Seconds, not hours.',
  },
  {
    icon: Shield,
    title: 'Private & Encrypted',
    description: 'Your data stays yours. Zero sharing, full control.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[200px]" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Globe className="w-5 h-5 text-black" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Visa Agent</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="group relative px-5 py-2.5 text-sm font-semibold text-black bg-white rounded-full overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <span className="relative z-10">Start free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-7xl mx-auto px-8 py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white/70">AI-powered visa automation</span>
            </div>

            {/* Headline */}
            <h1
              className="font-display text-5xl md:text-6xl lg:text-8xl font-bold leading-[1] tracking-tight mb-8 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-white">Visa forms</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500">
                filled instantly
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              Upload your documents once. Our AI extracts every detail and fills
              any visa application in seconds. No more repetitive typing.
            </p>

            {/* CTA */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
              style={{ animationDelay: '0.6s' }}
            >
              <Link
                to="/login"
                className="group relative px-8 py-4 text-base font-semibold text-black bg-gradient-to-r from-amber-300 to-orange-400 rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get started free
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
              <a
                href="#features"
                className="px-8 py-4 text-base font-medium text-white/70 hover:text-white transition-colors duration-300"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Floating UI Preview */}
          <div
            className="mt-24 max-w-5xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.8s' }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-px bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-3xl blur-sm" />

              {/* Main card */}
              <div className="relative bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                {/* Browser chrome */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="max-w-md mx-auto h-7 bg-white/5 rounded-lg" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 grid md:grid-cols-3 gap-6">
                  {/* Document */}
                  <div className="group p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/10 transition-all duration-500 hover:border-amber-500/30 hover:scale-[1.02]">
                    <div className="w-full aspect-[3/4] rounded-xl bg-white/5 mb-4 flex items-center justify-center border border-white/5 overflow-hidden">
                      <FileText className="w-16 h-16 text-amber-400/50 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <p className="font-semibold text-white/90">passport_scan.pdf</p>
                    <p className="text-sm text-white/40 mt-1">Name, DOB, Number extracted</p>
                  </div>

                  {/* Form */}
                  <div className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/10 transition-all duration-500 hover:border-emerald-500/30 hover:scale-[1.02]">
                    <div className="space-y-3 mb-4">
                      {['Full Name', 'Passport No.', 'Date of Birth'].map((label) => (
                        <div
                          key={label}
                          className="p-3 rounded-lg bg-white/5 border border-white/5"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{label}</p>
                          <div className="h-4 bg-gradient-to-r from-emerald-400/20 to-transparent rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Auto-filled</span>
                    </div>
                  </div>

                  {/* Letter */}
                  <div className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/10 transition-all duration-500 hover:border-purple-500/30 hover:scale-[1.02]">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-4">
                      <p className="text-xs uppercase tracking-wider text-white/30 mb-3">Cover Letter</p>
                      <div className="space-y-2">
                        {[100, 80, 95, 60].map((w, i) => (
                          <div key={i} className="h-2 bg-white/10 rounded-full" style={{ width: `${w}%` }} />
                        ))}
                      </div>
                    </div>
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30">
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="max-w-7xl mx-auto px-8">
          {/* Section header */}
          <div className="max-w-2xl mb-20">
            <p className="text-amber-400 font-semibold mb-4 tracking-wide uppercase text-sm">Capabilities</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              <span className="text-white">Everything you need</span>
              <br />
              <span className="text-white/40">nothing you don't</span>
            </h2>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl font-bold text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Steps */}
            <div>
              <p className="text-amber-400 font-semibold mb-4 tracking-wide uppercase text-sm">Process</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-12">
                <span className="text-white">Three steps</span>
                <br />
                <span className="text-white/40">Zero friction</span>
              </h2>

              <div className="space-y-8">
                {[
                  { num: '01', title: 'Upload documents', desc: 'Drop your passport, bank statements, and bookings.' },
                  { num: '02', title: 'AI extracts data', desc: 'Every field, every detail, automatically captured.' },
                  { num: '03', title: 'Fill any form', desc: 'One click fills visa applications anywhere.' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-lg font-display transition-transform duration-300 group-hover:scale-110">
                      {step.num}
                    </div>
                    <div className="pt-2">
                      <h3 className="font-semibold text-white text-lg mb-1">{step.title}</h3>
                      <p className="text-white/50">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl blur-3xl opacity-30" />
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center overflow-hidden">
                {/* Animated rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="absolute rounded-full border border-white/10"
                      style={{
                        width: `${i * 30}%`,
                        height: `${i * 30}%`,
                        animation: `pulse ${3 + i}s ease-in-out infinite`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                  <Globe className="w-12 h-12 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="max-w-4xl mx-auto px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-12 md:p-16 text-center">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }} />
            </div>

            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-[1.1] tracking-tight mb-6">
                Ready to automate
                <br />
                your visa applications?
              </h2>
              <p className="text-black/60 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of travelers who save hours on every application.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-base font-semibold rounded-full transition-all duration-300 hover:bg-black/80 hover:scale-105"
              >
                Start free today
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-black" />
              </div>
              <span className="font-display font-bold tracking-tight">Visa Agent</span>
            </div>
            <div className="flex items-center gap-8">
              {['Privacy', 'Terms', 'Contact'].map((link) => (
                <a key={link} href="#" className="text-sm text-white/40 hover:text-white transition-colors duration-300">
                  {link}
                </a>
              ))}
            </div>
            <p className="text-sm text-white/30">
              {new Date().getFullYear()} Visa Agent
            </p>
          </div>
        </div>
      </footer>

      {/* Global styles for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
