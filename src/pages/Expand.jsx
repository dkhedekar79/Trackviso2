import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Users, Briefcase } from 'lucide-react';
import SEO from '../components/SEO';

const PlaceholderImage = ({ title }) => {
  return (
    <div className="w-full aspect-video rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-amber-500/10 to-slate-900/20 overflow-hidden flex items-center justify-center relative">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-purple-500/20 blur-2xl" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-amber-500/20 blur-2xl" />
      </div>
      <div className="relative z-10 p-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span className="text-xs font-semibold text-purple-200/90 uppercase tracking-wider">
            Placeholder Image
          </span>
        </div>
        <div className="mt-4 text-xl font-bold text-white">{title}</div>
        <div className="mt-1 text-sm text-white/60">Replace with real artwork later.</div>
      </div>
    </div>
  );
};

const Expand = () => {
  const bridgeFinance = {
    title: 'Bridge Finance Network',
    subtitle: 'Realistic job simulations + internship-style practice',
    description:
      "This is where Creddr helps you level up beyond study: get hands-on, interactive finance scenarios designed to feel like the real thing.",
    bullets: [
      'Interactive case-based simulations (built for high realism)',
      'Online internship experience you can complete at your own pace',
      'Career-focused feedback so you know exactly what to improve',
    ],
  };

  return (
    <div className="p-6">
      <SEO
        title="Expand - Creddr Opportunities"
        description="Extra opportunities for Creddr members, starting with Bridge Finance Network: realistic job simulations and internship-style experience."
        url="/expand"
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30">
            <Briefcase className="w-6 h-6 text-violet-300" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Expand your Creddr journey
            </h1>
            <p className="mt-2 text-white/70">
              Extra opportunities that build your confidence in real-world finance—starting with Bridge Finance Network.
            </p>
          </div>
        </div>

        {/* Opportunity 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col">
            <PlaceholderImage title="Bridge Finance Network (Opportunity)" />
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 rounded-2xl border border-purple-700/30 p-6 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{bridgeFinance.title}</h2>
                <p className="text-white/65">{bridgeFinance.subtitle}</p>
              </div>
            </div>

            <p className="mt-4 text-white/70 leading-relaxed">{bridgeFinance.description}</p>

            <div className="mt-5 space-y-2">
              {bridgeFinance.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-400/90 shadow-[0_0_16px_rgba(167,139,250,0.55)]" />
                  <p className="text-white/75">{b}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  // Placeholder: open external partner page
                  window.open('https://bridgefinancenetwork.com', '_blank', 'noopener,noreferrer');
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition"
              >
                Explore Bridge Finance Network
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-xs text-white/50">
                Starts with this first opportunity—more will be added soon.
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity 2 placeholder */}
        <div className="mt-8 bg-gradient-to-br from-slate-900/20 to-purple-900/20 rounded-2xl border border-purple-700/20 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-xl font-bold text-white">More Creddr opportunities are coming</h3>
              <p className="mt-2 text-white/70">
                We&apos;re adding additional paths for interactive simulations and career experience.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="text-xs font-semibold text-amber-100/90">Soon</span>
            </div>
          </div>

          <div className="mt-5">
            <PlaceholderImage title="Opportunity (Coming Soon)" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Expand;

