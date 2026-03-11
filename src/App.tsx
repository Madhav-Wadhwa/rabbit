/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Upload, 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BarChart3,
  Send,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !email) return;

    setStatus("loading");
    setMessage("Analyzing sales data and generating insights...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(result.message);
        setSummary(result.summary);
      } else {
        throw new Error(result.error || "Failed to process data");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  const reset = () => {
    setFile(null);
    setEmail("");
    setStatus("idle");
    setMessage("");
    setSummary("");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <BarChart3 size={18} />
            </div>
            <span className="font-bold tracking-tight text-zinc-900">Rabbitt AI <span className="text-blue-600">Sales Automator</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secured Endpoints
            </div>
            <div className="w-px h-4 bg-zinc-200" />
            <a href="/api-docs" target="_blank" className="hover:text-blue-600 transition-colors">API Docs</a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
              Instant Sales <span className="text-blue-600">Intelligence</span>
            </h1>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Upload your quarterly sales data and let our AI generate a professional executive brief delivered straight to your inbox.
            </p>
          </div>

          {/* Main Action Card */}
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer group
                  ${file ? 'border-blue-500 bg-blue-50/50' : 'border-zinc-200 hover:border-blue-400 hover:bg-zinc-50'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept=".csv,.xlsx,.xls"
                />
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-colors
                    ${file ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-500'}
                  `}>
                    {file ? <FileText size={24} /> : <Upload size={24} />}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-900">
                      {file ? file.name : "Click or drag to upload sales data"}
                    </p>
                    <p className="text-sm text-zinc-500">
                      Supports .CSV, .XLSX (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                  <Mail size={14} /> Recipient Email
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="executive@rabbitt.ai"
                    className="w-full h-12 pl-4 pr-12 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Send size={18} />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={status === "loading" || !file || !email}
                className={`
                  w-full h-14 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all
                  ${status === "loading" || !file || !email 
                    ? 'bg-zinc-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}
                `}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Generate & Send Brief
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Status Feedback */}
          <AnimatePresence mode="wait">
            {status !== "idle" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-6 rounded-2xl flex items-start gap-4 ${
                  status === "success" ? 'bg-emerald-50 border border-emerald-100 text-emerald-900' :
                  status === "error" ? 'bg-rose-50 border border-rose-100 text-rose-900' :
                  'bg-blue-50 border border-blue-100 text-blue-900'
                }`}
              >
                <div className="mt-0.5">
                  {status === "success" ? <CheckCircle2 size={20} className="text-emerald-600" /> :
                   status === "error" ? <AlertCircle size={20} className="text-rose-600" /> :
                   <Loader2 size={20} className="text-blue-600 animate-spin" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold">{status === "success" ? "Success!" : status === "error" ? "Error" : "Processing"}</p>
                  <p className="text-sm opacity-90">{message}</p>
                </div>
                {status === "success" && (
                  <button onClick={reset} className="text-xs font-bold uppercase tracking-wider text-emerald-700 hover:underline">
                    New Analysis
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Summary Preview */}
          <AnimatePresence>
            {summary && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    AI-Generated Brief Preview
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">Generated by Gemini 3 Flash</span>
                </div>
                <div className="glass-card p-8 font-mono text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                  {summary}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
          <p>© 2026 Rabbitt AI. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Security Audit</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
