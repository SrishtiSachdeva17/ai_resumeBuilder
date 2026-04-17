import React from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiLayout, FiShield, FiZap } from 'react-icons/fi';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-gray-100">
      <nav className="border-b border-border px-6 py-4 md:px-8 flex items-center justify-between">
        <span className="font-display text-2xl text-white">ResumeAI</span>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary text-sm">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,97,238,0.18),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center md:px-8">
          <div className="inline-block rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
            AI-Powered Resume Builder
          </div>
          <h1 className="font-display mt-7 text-5xl leading-tight text-white md:text-6xl">
            Build resumes that look sharp and read even better.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 text-safe">
            Generate summaries, strengthen work experience, manage versions in real time, and export polished PDFs without fighting the layout.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">Create Resume</Link>
            <Link to="/login" className="btn-secondary px-8 py-3 text-base">Open Dashboard</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-20 md:grid-cols-4 md:px-8">
        {[
          { icon: FiZap, title: 'AI Generation', desc: 'Generate summaries and improve descriptions without spamming duplicate requests.' },
          { icon: FiLayout, title: 'Stable UI', desc: 'Long text is constrained, wrapped, and preview-safe across editor cards and PDF output.' },
          { icon: FiDownload, title: 'PDF Export', desc: 'Download only when meaningful resume data exists, with loading feedback along the way.' },
          { icon: FiShield, title: 'Secure Auth', desc: 'JWT-protected routes, hashed passwords, validated payloads, and sanitized input handling.' },
        ].map(({ icon: Icon, title, desc }) => (
          <article key={title} className="card text-center">
            <Icon className="mx-auto mb-3 text-2xl text-primary-500" />
            <h2 className="text-white font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-gray-500 text-safe">{desc}</p>
          </article>
        ))}
      </section>

      <Footer />
    </div>
  );
}
