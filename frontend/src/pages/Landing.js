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
  Sun
} from '@phosphor-icons/react';

const features = [
  {
    icon: Table,
    title: 'Excel Sync',
    description: 'Upload Excel or CSV. We detect new rows and trigger automations instantly.'
  },
  {
    icon: Receipt,
    title: 'GST Invoices',
    description: 'Auto-generate professional, GST-ready invoices with one click. Export as PDF.'
  },
  {
    icon: WhatsappLogo,
    title: 'WhatsApp Notify',
    description: 'Send invoice notifications and payment reminders via WhatsApp templates.'
  },
  {
    icon: Lightning,
    title: 'Smart Automations',
    description: 'Simple "When this happens → Do this" rules. No complex flowcharts needed.'
  }
];

export default function Landing() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-soft">
              <Lightning weight="fill" className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900 dark:text-white">Syntra</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              data-testid="landing-theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun weight="regular" className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon weight="regular" className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
            
            {user ? (
              <Link to="/dashboard" className="btn-primary" data-testid="landing-dashboard-btn">
                Dashboard
                <ArrowRight weight="bold" className="w-4 h-4 ml-2" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost" data-testid="landing-login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary" data-testid="landing-register-btn">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="overline mb-4">Business Automation for India</p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
              Excel to Invoice to WhatsApp.
              <br />
              <span className="text-primary-500 dark:text-primary-400">Automatically.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect your Excel sheets, generate GST invoices, and notify clients on WhatsApp—all in 3 clicks. Built for Indian small businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary px-8 py-3.5 text-base" data-testid="hero-get-started-btn">
                Start Free
                <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Check weight="bold" className="w-4 h-4 text-secondary-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="overline mb-3">Features</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Everything your business needs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card-hover p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-5">
                  <feature.icon weight="duotone" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="overline mb-3">How It Works</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              3 simple steps
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Upload your Excel', desc: 'Drop your Excel or CSV file. We detect your columns and rows automatically.' },
              { step: '02', title: 'Set up automations', desc: 'Choose what happens: create invoice, update CRM, or send WhatsApp message.' },
              { step: '03', title: 'Sit back and relax', desc: 'Every new row triggers your automation. Invoices sent, clients notified.' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="font-heading font-bold text-lg text-primary-600 dark:text-primary-400">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="card p-10 sm:p-14 text-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 border-primary-200 dark:border-primary-800">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to automate?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Join hundreds of Indian businesses saving hours every week with Syntra.
            </p>
            <Link to="/register" className="btn-primary px-8 py-3.5 text-base" data-testid="cta-get-started-btn">
              Get Started Free
              <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Lightning weight="fill" className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-semibold text-slate-900 dark:text-white">Syntra</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Syntra. Made for Indian businesses.
          </p>
        </div>
      </footer>
    </div>
  );
}
