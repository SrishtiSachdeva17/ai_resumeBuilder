import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#0b0d13]">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-2xl text-white">ResumeAI</p>
          <p className="mt-3 max-w-sm text-sm text-gray-400 text-safe">
            Build polished resumes with AI assistance, structured editing, and export-ready previews.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-500">Quick Links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/resume/new" className="hover:text-white transition-colors">Create Resume</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-500">Connect</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <p className="pt-2 text-xs text-gray-500">Copyright {new Date().getFullYear()} ResumeAI</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
