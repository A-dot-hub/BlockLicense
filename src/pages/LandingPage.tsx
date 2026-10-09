import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { BlockLicenseLogo } from '../components/BlockLicenseLogo';
import {
  ShieldCheck,
  Cpu,
  KeyRound,
  FileCheck2,
  ArrowRight,
  QrCode,
  Layers,
  Database,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertOctagon,
  History,
  Sparkles,
  Zap,
  Globe,
  Terminal,
  Activity,
  FileWarning,
  Blocks,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

  // Scroll tracking with container target
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  // Smooth scroll parallax transforms mimicking MetaMask homepage
  const headlineY = useTransform(scrollYProgress, [0, 0.55], [0, -75]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.15]);

  // Dynamic 3D Card scroll-driven reveal with spring smoothing
  const cardScaleRaw = useTransform(scrollYProgress, [0, 0.45, 1], [0.93, 1.04, 1.0]);
  const cardScale = useSpring(cardScaleRaw, { stiffness: 120, damping: 20 });

  const cardRotateXRaw = useTransform(scrollYProgress, [0, 0.5], [14, 0]);
  const cardRotateX = useSpring(cardRotateXRaw, { stiffness: 100, damping: 22 });

  const cardYRaw = useTransform(scrollYProgress, [0, 0.5], [40, -25]);
  const cardY = useSpring(cardYRaw, { stiffness: 110, damping: 22 });

  // Floating satellite badges that pop out into 3D space as user scrolls down
  const badgeTopLeftX = useTransform(scrollYProgress, [0, 0.5], [0, -32]);
  const badgeTopLeftY = useTransform(scrollYProgress, [0, 0.5], [0, -42]);
  const badgeTopLeftScale = useTransform(scrollYProgress, [0, 0.3], [0.92, 1]);

  const badgeTopRightX = useTransform(scrollYProgress, [0, 0.5], [0, 32]);
  const badgeTopRightY = useTransform(scrollYProgress, [0, 0.5], [0, -42]);

  const badgeBottomLeftX = useTransform(scrollYProgress, [0, 0.5], [0, -28]);
  const badgeBottomLeftY = useTransform(scrollYProgress, [0, 0.5], [0, 44]);

  const badgeBottomRightX = useTransform(scrollYProgress, [0, 0.5], [0, 28]);
  const badgeBottomRightY = useTransform(scrollYProgress, [0, 0.5], [0, 44]);

  // Interactive 3D mouse cursor tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 16, y: -y * 16 });
    setGlarePos({
      x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 100)
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  // Interactive Tab inside the 3D Hero Console
  const [activeHeroTab, setActiveHeroTab] = useState<'license' | 'hash' | 'events'>('license');

  // Live block ticker simulation
  const [currentBlock, setCurrentBlock] = useState(1048);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBlock(b => b + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Interactive Live Cryptographic Sandbox state on home page
  const [sandboxFileStatus, setSandboxFileStatus] = useState<'IDLE' | 'AUTHENTIC' | 'TAMPERED'>('IDLE');
  const [sandboxHash, setSandboxHash] = useState('a3f7c9b1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6');

  const handleSimulateAuthentic = () => {
    setSandboxFileStatus('AUTHENTIC');
    setSandboxHash('a3f7c9b1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6');
  };

  const handleSimulateTampered = () => {
    setSandboxFileStatus('TAMPERED');
    setSandboxHash('11111111d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6');
  };

  return (
    <div ref={containerRef} className="space-y-28 py-4 overflow-hidden">

      {/* 1. HERO SECTION WITH METAMASK-STYLE SCROLL-TRIGGERED 3D REVEAL */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex items-center justify-center px-4 pt-8 pb-20 overflow-hidden"
      >

        {/* Soft Ambient Light Glow & Grid */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[650px] h-[650px] bg-[#013330]/15 rounded-full blur-[140px] -translate-y-12 animate-pulse" />
          <div className="w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-[120px] translate-x-48 translate-y-20" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#01333010_1px,transparent_1px),linear-gradient(to_bottom,#01333010_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center z-10 flex flex-col items-center">

          {/* Scroll-parallaxed Headline & Intro */}
          <motion.div
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="flex flex-col items-center"
          >
            {/* Live Status Pill Strip */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-[#013330]/20 rounded-full text-xs text-slate-800 mb-8 backdrop-blur-md metamask-card-shadow"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-[#013330]">Ethereum EVM Protocol Live</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium">Solidity ^0.8.20</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-[#013330] font-mono font-bold">Chain ID: 31337 / Sepolia</span>
            </motion.div>

            {/* Master Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#013330] max-w-5xl mx-auto leading-[1.08] font-display text-balance"
            >
              A gateway to tamper-evident software licensing on blockchain.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg md:text-xl text-slate-700 max-w-2xl mx-auto mt-6 leading-relaxed font-normal"
            >
              Verify software ownership. Prove binary authenticity. Issue, transfer, and revoke cryptographic software licenses with mathematical certainty.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center justify-center gap-4 mt-10"
            >
              <button
                onClick={() => onNavigate('signup')}
                className="px-7 py-3.5 text-sm font-bold text-[#013330] bg-emerald-400 hover:bg-emerald-300 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Create Account</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-7 py-3.5 text-sm font-bold text-white bg-[#013330] hover:bg-[#024945] rounded-2xl transition-all shadow-xl shadow-[#013330]/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Log In</span>
              </button>
              <button
                onClick={() => onNavigate('verify')}
                className="px-7 py-3.5 text-sm font-bold text-[#013330] bg-white hover:bg-slate-50 border border-blue-200 rounded-2xl transition-all flex items-center gap-2 cursor-pointer metamask-card-shadow hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Verify License</span>
              </button>
              <button
                onClick={() => onNavigate('verify-software')}
                className="px-7 py-3.5 text-sm font-bold text-[#013330] bg-white hover:bg-slate-50 border border-blue-200 rounded-2xl transition-all flex items-center gap-2 cursor-pointer metamask-card-shadow hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileCheck2 size={16} className="text-[#013330]" />
                <span>Check File SHA-256</span>
              </button>
            </motion.div>
          </motion.div>

          {/* 3D METAMASK-STYLE SCROLL-DRIVEN TILT STAGE WITH FLOATING SATELLITES */}
          <motion.div
            style={{
              scale: cardScale,
              y: cardY
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative mt-12 w-full max-w-4xl p-2 sm:p-4 select-none perspective-[1400px]"
          >
            {/* SATELLITE 1 (Top Left): Contract Verification Pill */}
            <motion.div
              style={{
                x: badgeTopLeftX,
                y: badgeTopLeftY,
                scale: badgeTopLeftScale
              }}
              className="hidden lg:flex absolute -top-5 -left-8 z-30 items-center gap-2 px-3 py-1.5 bg-white border border-[#013330]/20 rounded-full shadow-lg text-xs font-mono backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[#013330] font-bold">Contract: 0x5FbD...8aa3</span>
            </motion.div>

            {/* SATELLITE 2 (Top Right): Live Block Height Pill */}
            <motion.div
              style={{
                x: badgeTopRightX,
                y: badgeTopRightY
              }}
              className="hidden lg:flex absolute -top-5 -right-8 z-30 items-center gap-2 px-3 py-1.5 bg-[#013330] text-white rounded-full shadow-lg text-xs font-mono"
            >
              <Blocks size={13} className="text-emerald-400" />
              <span className="text-emerald-300 font-bold">Block #{currentBlock}</span>
            </motion.div>

            {/* SATELLITE 3 (Bottom Left): Non-Custodial Security */}
            <motion.div
              style={{
                x: badgeBottomLeftX,
                y: badgeBottomLeftY
              }}
              className="hidden lg:flex absolute -bottom-5 -left-8 z-30 items-center gap-2 px-3.5 py-1.5 bg-white border border-emerald-300 rounded-full shadow-lg text-xs font-sans text-emerald-900 font-semibold"
            >
              <Check size={13} className="text-emerald-600" />
              <span>Immutable EVM Invariant</span>
            </motion.div>

            {/* SATELLITE 4 (Bottom Right): SHA-256 Digest Match */}
            <motion.div
              style={{
                x: badgeBottomRightX,
                y: badgeBottomRightY
              }}
              className="hidden lg:flex absolute -bottom-5 -right-8 z-30 items-center gap-2 px-3.5 py-1.5 bg-white border border-[#013330]/20 rounded-full shadow-lg text-xs font-mono text-[#013330]"
            >
              <ShieldCheck size={14} className="text-[#013330]" />
              <span className="font-bold">SHA-256: 32 Bytes Verified</span>
            </motion.div>

            {/* Main Interactive 3D Card Stage */}
            <motion.div
              style={{
                rotateX: cardRotateX,
                transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="relative p-6 sm:p-8 bg-white/95 border border-[#013330]/20 rounded-3xl metamask-hero-shadow backdrop-blur-md overflow-hidden cursor-pointer"
            >
              {/* Dynamic Light Glare Overlay */}
              <div
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(204, 231, 255, 0.4) 0%, transparent 65%)`
                }}
                className="absolute inset-0 pointer-events-none transition-all duration-75"
              />

              {/* Top Window Bar in #013330 styling with Interactive Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 text-xs relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="flex items-center gap-1.5 ml-2">
                    <BlockLicenseLogo size={18} variant="icon" />
                    <span className="font-mono text-[#013330] font-bold">SoftwareLicense.sol · Block Explorer</span>
                  </div>
                </div>

                {/* Interactive View Toggles */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('license')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${activeHeroTab === 'license'
                      ? 'bg-[#013330] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Tokenized License
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('hash')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${activeHeroTab === 'hash'
                      ? 'bg-[#013330] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    SHA-256 Digest
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('events')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${activeHeroTab === 'events'
                      ? 'bg-[#013330] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Event Ledger
                  </button>
                </div>

                <div className="hidden sm:flex font-mono text-[11px] text-white font-bold items-center gap-1.5 bg-[#013330] px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>CONSENSUS SYNCED</span>
                </div>
              </div>

              {/* Center Holographic Stage with Dynamic Tab View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left relative z-10">

                {/* Floating Card 1: On-Chain Mint */}
                <div
                  onClick={() => setActiveHeroTab('license')}
                  className={`p-4 rounded-2xl space-y-2 transition-all cursor-pointer ${activeHeroTab === 'license'
                    ? 'bg-emerald-50/70 border-2 border-[#013330] shadow-md'
                    : 'bg-slate-50 border border-slate-200 hover:border-[#013330]/40'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#013330] font-bold">SMART CONTRACT</span>
                    <span className="text-[11px] text-emerald-700 font-bold">✓ ON-CHAIN</span>
                  </div>
                  <div className="text-sm font-bold text-[#013330] font-display">
                    SoftwareLicense.sol
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono truncate">
                    Non-Custodial License Minting
                  </div>
                </div>

                {/* Floating Card 2: SHA-256 Digest */}
                <div
                  onClick={() => setActiveHeroTab('hash')}
                  className={`p-4 rounded-2xl space-y-2 transition-all cursor-pointer ${activeHeroTab === 'hash'
                    ? 'bg-emerald-50/70 border-2 border-[#013330] shadow-md'
                    : 'bg-slate-50 border border-slate-200 hover:border-[#013330]/40'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[#013330] font-bold">SHA-256 ANCHOR</span>
                    <span className="text-[11px] text-slate-500 font-semibold">32 BYTES</span>
                  </div>
                  <div className="text-xs text-[#013330] font-mono break-all line-clamp-2 font-bold">
                    Web Crypto Streaming Digest
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>Exact Byte-for-Byte Verification</span>
                  </div>
                </div>

                {/* Floating Card 3: Event Stream */}
                <div
                  onClick={() => setActiveHeroTab('events')}
                  className={`p-4 rounded-2xl space-y-2 transition-all cursor-pointer ${activeHeroTab === 'events'
                    ? 'bg-emerald-50/70 border-2 border-[#013330] shadow-md'
                    : 'bg-slate-50 border border-slate-200 hover:border-[#013330]/40'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[#013330] font-bold">AUDIT TRAIL</span>
                    <span className="text-[11px] text-slate-500 font-semibold">BLOCK #{currentBlock}</span>
                  </div>
                  <div className="text-xs text-slate-800 font-bold">
                    Immutable Events
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    Mint · Transfer · Revoke
                  </div>
                </div>
              </div>

              {/* Bottom Interactive Notice */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 relative z-10">
                <span className="font-mono text-[11px] text-slate-500">
                  Scroll page & move cursor to tilt 3D perspective · Powered by Framer Motion & Ethers.js
                </span>
                <span
                  className="text-[#013330] font-bold hover:underline cursor-pointer text-xs"
                  onClick={() => onNavigate('dashboard')}
                >
                  Enter Interactive Workspace →
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. SCROLL METRICS & PROTOCOL INVARIANTS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-white/95 border border-[#013330]/20 rounded-3xl metamask-card-shadow">
          {[
            { value: '100%', label: 'Cryptographic Immutability', desc: 'Guaranteed by Solidity state' },
            { value: '< 200ms', label: 'Local SHA-256 Digesting', desc: 'High-speed browser Web Crypto' },
            { value: '0 Bytes', label: 'Software Binary Stored On Chain', desc: 'Zero blockchain bloat' },
            { value: '24 / 7', label: 'Public Verification Uptime', desc: 'Non-custodial QR & hash lookup' }
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-4 space-y-1"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[#013330] font-mono tabular-nums tracking-tight">
                {metric.value}
              </div>
              <div className="text-xs font-bold text-[#013330] font-display">
                {metric.label}
              </div>
              <div className="text-[11px] text-slate-500">
                {metric.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE HOME SANDBOX: LIVE FILE INTEGRITY SIMULATOR */}
      <section className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-8 sm:p-10 bg-white border border-[#013330]/20 rounded-3xl metamask-hero-shadow space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#013330] uppercase tracking-wider">
                Live Interactive Demonstration
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#013330] mt-1 font-display">
                Simulate Binary Tamper Detection Right Here
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                See how a 1-bit alteration in an executable binary triggers an instant cryptographic mismatch on the blockchain.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateAuthentic}
                className="px-3.5 py-2 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Test Authentic File</span>
              </button>
              <button
                type="button"
                onClick={handleSimulateTampered}
                className="px-3.5 py-2 text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <FileWarning size={14} className="text-rose-600" />
                <span>Tamper 1 Bit</span>
              </button>
            </div>
          </div>

          {/* Sandbox Visual Display */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-600 text-[11px] font-semibold block mb-1">Simulated Binary Hash:</span>
                <div className={`p-3 rounded-xl border text-[11px] break-all ${sandboxFileStatus === 'AUTHENTIC'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                  : sandboxFileStatus === 'TAMPERED'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                  {sandboxHash}
                </div>
              </div>

              <div>
                <span className="text-slate-600 text-[11px] font-semibold block mb-1">On-Chain Smart Contract Hash:</span>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-[#013330] font-bold text-[11px] break-all">
                  a3f7c9b1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6
                </div>
              </div>
            </div>

            {/* Verdict Output */}
            {sandboxFileStatus !== 'IDLE' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-sans ${sandboxFileStatus === 'AUTHENTIC'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
              >
                {sandboxFileStatus === 'AUTHENTIC' ? (
                  <>
                    <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block text-emerald-950 font-bold">✓ AUTHENTIC SOFTWARE DETECTED</strong>
                      <span>The calculated SHA-256 digest matches the immutable smart contract record byte-for-byte.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertOctagon size={22} className="text-rose-600 shrink-0" />
                    <div>
                      <strong className="block text-rose-950 font-bold">✗ HASH MISMATCH: SOFTWARE TAMPERED</strong>
                      <span>Cryptographic verification failed! The binary differs from the authentic release anchor.</span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* 4. THE 5-STEP PROTOCOL PIPELINE */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#013330]">
            Decentralized Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#013330] mt-2 font-display">
            How BlockLicense Secures Software
          </h2>
          <p className="text-xs text-slate-600 mt-2 max-w-xl mx-auto">
            A cohesive 5-step lifecycle ensuring zero piracy, zero unauthorized transfers, and mathematically verified binaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Upload Binary',
              desc: 'Vendor drops the executable or archive file (.exe, .zip, .dmg) into the web console.'
            },
            {
              step: '02',
              title: 'Compute SHA-256',
              desc: 'Browser Web Crypto API calculates the 256-bit cryptographic fingerprint locally in streaming memory.'
            },
            {
              step: '03',
              title: 'Mint to Contract',
              desc: 'Authorized vendor wallet signs issueLicense() transaction on Ethereum EVM blockchain.'
            },
            {
              step: '04',
              title: 'Generate QR Badge',
              desc: 'Receive unique human-readable ID (BL-2026-000001) and digital certificate QR code.'
            },
            {
              step: '05',
              title: 'Verify & Transfer',
              desc: 'Public verification checks contract truth; owners transfer or vendors revoke in real time.'
            }
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-5 bg-white border border-[#013330]/20 rounded-2xl relative metamask-card-shadow hover:border-[#013330] transition-colors"
            >
              <div className="text-xs font-mono font-bold text-[#013330] mb-3">
                STEP {item.step}
              </div>
              <h4 className="text-sm font-bold text-[#013330] mb-2 font-display">
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. BRAND IDENTITY & LOGO SUITE SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-8 sm:p-10 bg-white border border-[#013330]/20 rounded-3xl metamask-hero-shadow space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold text-[#013330] uppercase tracking-wider">
                Official Visual Identity
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#013330] mt-1 font-display">
                BlockLicense Brand Architecture
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Precision-engineered logo combining interlocking blockchain crystal cubes, a cryptographic license prism, and an immutable security shield.
              </p>
            </div>

            {/* <a
              href="/favicon.svg"
              download="blocklicense-logo.svg"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#013330] hover:bg-[#024945] text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-[#013330]/20 cursor-pointer self-start sm:self-auto"
            >
              <BlockLicenseLogo size={16} variant="icon" />
              <span>Download SVG </span>
            </a> */}
          </div>

          {/* Logo Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Logo Variant 1: Dark Mode Container (Navbar/Footer Style) */}
            <div className="p-6 bg-[#013330] rounded-2xl flex flex-col items-center justify-center gap-4 text-center border border-[#024945] shadow-inner min-h-[190px]">
              <BlockLicenseLogo size={64} variant="icon" theme="dark" interactive={true} />
              <div>
                <div className="text-xs font-bold text-white font-display">Primary 3D Icon</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">#013330 Background</div>
              </div>
            </div>

            {/* Logo Variant 2: Full Wordmark on Light Canvas */}
            <div className="p-6 bg-[#cce7ff]/60 border border-blue-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-center min-h-[190px]">
              <BlockLicenseLogo size={46} variant="full" theme="light" interactive={true} />
              <div className="mt-2">
                <div className="text-xs font-bold text-[#013330] font-display">Horizontal Wordmark</div>
                <div className="text-[11px] text-slate-600 font-mono mt-0.5">App Headers & Press Releases</div>
              </div>
            </div>

            {/* Logo Variant 3: Stacked Presentation Brandmark */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-center min-h-[190px]">
              <BlockLicenseLogo size={52} variant="stacked" theme="light" interactive={true} />
              <div className="mt-1">
                <div className="text-[11px] text-slate-500 font-mono">Splash Screens & Whitepapers</div>
              </div>
            </div>
          </div>

          {/* Design Geometry Blueprint Spec */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[11px]">Primary Core:</span>
              <strong className="text-[#013330] font-bold">Deep Pine (#013330)</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Consensus Accents:</span>
              <strong className="text-emerald-700 font-bold">Emerald & Mint (#10b981)</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Symbolic Geometry:</span>
              <strong className="text-slate-800 font-bold">Shield + Padlock + Cube</strong>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER IN #013330 */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-10 sm:p-14 bg-gradient-to-br from-[#013330] via-[#024440] to-[#012220] rounded-3xl text-center space-y-6 text-white shadow-2xl shadow-[#013330]/30 border border-[#035954]"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-emerald-300 backdrop-blur-sm font-medium">
            <Sparkles size={13} />
            <span>Ready for Production & Academic Defense</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display max-w-3xl mx-auto leading-tight">
            Take control of your software licenses with Ethereum consensus.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Eliminate keygens, counterfeit distributions, and tampered binaries forever. Start issuing and verifying in minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('signup')}
              className="px-7 py-3.5 text-xs font-bold text-[#013330] bg-emerald-400 hover:bg-emerald-300 rounded-2xl transition-all shadow-lg cursor-pointer hover:scale-[1.02]"
            >
              Create Free Account
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-7 py-3.5 text-xs font-bold text-white bg-[#024945] hover:bg-[#035e58] border border-white/20 rounded-2xl transition-all cursor-pointer"
            >
              Open Live Dashboard
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
