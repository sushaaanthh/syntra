import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { 
  Lightning, 
  Table, 
  Receipt, 
  WhatsappLogo, 
  ArrowRight,
  Check,
  Moon,
  Sun,
  Sparkle,
  ChartLineUp,
  Users
} from '@phosphor-icons/react';

const features = [
  {
    icon: Table,
    title: 'Excel Sync',
    description: 'Upload Excel or CSV. We detect new rows and trigger automations instantly.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Receipt,
    title: 'GST Invoices',
    description: 'Auto-generate professional, GST-ready invoices with one click. Export as PDF.',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    icon: WhatsappLogo,
    title: 'WhatsApp Notify',
    description: 'Send invoice notifications and payment reminders via WhatsApp templates.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Lightning,
    title: 'Smart Automations',
    description: 'Simple "When this happens → Do this" rules. No complex flowcharts needed.',
    gradient: 'from-amber-500 to-orange-500'
  }
];

export default function Landing() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-violet-50/50 dark:from-[#08080c] dark:via-[#0c0a14] dark:to-[#080a10]" />
      
      {/* Decorative elements */}
      <div className="fixed top-0 left-1/4 w-[800px] h-[800px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl" />

      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Lightning weight="fill" className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">Syntra</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl glass-card hover:scale-105 transition-all duration-300"
              data-testid="landing-theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun weight="duotone" className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon weight="duotone" className="w-5 h-5 text-indigo-500" />
              )}
            </button>
            
            {user ? (
              <Link to="/dashboard" className="btn-primary" data-testid="landing-dashboard-btn">
                Dashboard
                <ArrowRight weight="bold" className="w-4 h-4 ml-2" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost font-semibold" data-testid="landing-login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary" data-testid="landing-register-btn">
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Sparkle weight="fill" className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Business Automation for India</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tight">
              Excel to Invoice to WhatsApp.
              <br />
              <span className="gradient-text">Automatically.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              Connect your Excel sheets, generate GST invoices, and notify clients on WhatsApp—all in 3 clicks. Built for Indian small businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/register" className="btn-primary px-8 py-4 text-lg" data-testid="hero-get-started-btn">
                Start Free
                <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Check weight="bold" className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span>No credit card required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="overline mb-4">Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Everything your business needs
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-hover p-8"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon weight="fill" className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="overline mb-4">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              3 simple steps
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Upload your Excel', desc: 'Drop your Excel or CSV file. We detect your columns and rows automatically.' },
              { step: '02', title: 'Set up automations', desc: 'Choose what happens: create invoice, update CRM, or send WhatsApp message.' },
              { step: '03', title: 'Sit back and relax', desc: 'Every new row triggers your automation. Invoices sent, clients notified.' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-8 items-start"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <span className="font-bold text-xl text-white">{item.step}</span>
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-24 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="card p-12 grid sm:grid-cols-3 gap-8 text-center">
            {[
              { value: '500+', label: 'Businesses', icon: Users },
              { value: '10K+', label: 'Invoices Created', icon: Receipt },
              { value: '5hrs', label: 'Saved Weekly', icon: ChartLineUp }
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <stat.icon weight="duotone" className="w-8 h-8 mx-auto text-indigo-500 mb-4" />
                <p className="text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
            
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative p-12 sm:p-16 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to automate?
              </h2>
              <p className="text-xl text-indigo-100 mb-10 max-w-xl mx-auto">
                Join hundreds of Indian businesses saving hours every week with Syntra.
              </p>
              <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300 hover:scale-105 shadow-lg" data-testid="cta-get-started-btn">
                Get Started Free
                <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Lightning weight="fill" className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">Syntra</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            © {new Date().getFullYear()} Syntra. Made for Indian businesses.
          </p>
        </div>
      </footer>
    </div>
  );
}
