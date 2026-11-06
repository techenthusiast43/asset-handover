import React from 'react';
import {
  ShieldCheck,
  ArrowRightLeft,
  FileCheck2,
  Lock,
  Boxes,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import { BOT_CHAIN_CONFIG } from '../config/botChain';

export function LandingPage({ setActiveTab }) {
  const { isConnected, openAppKit, allAssets, myCustodianAssets, incomingHandovers } = useAssetHandover();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-bot-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-bot-400 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-bot-400 animate-ping" />
          <span>Deployed on BOT Chain Testnet (Chain ID 968)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Verifiable Physical Asset <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-bot-400 via-bot-300 to-emerald-200 bg-clip-text text-transparent">
            Custody & Handover
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AssetHandover is a lightweight blockchain custody management protocol for enterprise and physical assets.
          Every transfer requires explicit recipient acceptance before custody updates, creating an immutable audit trail.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {isConnected ? (
            <>
              <button
                onClick={() => setActiveTab('register')}
                className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-bot-400 to-bot-500 text-slate-950 hover:from-bot-300 hover:to-bot-400 shadow-lg shadow-bot-500/25 transition-all hover:scale-102 flex items-center gap-2"
              >
                <span>Register New Asset</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('my-assets')}
                className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-800/90 text-slate-200 hover:bg-slate-700/90 border border-slate-700 transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-bot-400" />
                <span>My Assets ({myCustodianAssets.length})</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => openAppKit()}
              className="px-7 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-bot-400 to-bot-500 text-slate-950 hover:from-bot-300 hover:to-bot-400 shadow-xl shadow-bot-500/30 transition-all hover:scale-102 flex items-center gap-2"
            >
              <span>Connect Wallet to Begin</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <a
            href={BOT_CHAIN_CONFIG.blockExplorerUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>BOT Explorer</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Live Network Stats Strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="glass-panel p-4 rounded-xl text-left border border-slate-800">
            <div className="text-xs text-slate-400">Total Registered</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {allAssets.length}
            </div>
            <div className="text-[10px] text-bot-400 mt-0.5">Physical Assets</div>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left border border-slate-800">
            <div className="text-xs text-slate-400">In Your Custody</div>
            <div className="text-2xl font-bold font-mono text-bot-400 mt-1">
              {myCustodianAssets.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Held by your wallet</div>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left border border-slate-800">
            <div className="text-xs text-slate-400">Pending Actions</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {incomingHandovers.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting acceptance</div>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left border border-slate-800">
            <div className="text-xs text-slate-400">Target Network</div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              Chain 968
            </div>
            <div className="text-[10px] text-bot-400 mt-0.5">BOT Testnet</div>
          </div>
        </div>
      </section>

      {/* Protocol Architecture: How Handover Works */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Two-Party Custody Verification
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Traditional tracking systems fail when recipients deny receipt. AssetHandover enforces on-chain cryptographic acknowledgement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-xl bg-bot-500/10 border border-bot-500/20 text-bot-400 flex items-center justify-center mb-4">
              <Boxes className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-bot-400 mb-1">STEP 01</div>
            <h3 className="text-lg font-bold text-white mb-2">Asset Registration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Register physical items (laptops, vehicles, keys, machinery) with unique serial numbers. A deterministic bytes32 hash ID is minted to the registrar.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-amber-400 mb-1">STEP 02</div>
            <h3 className="text-lg font-bold text-white mb-2">Initiate Handover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The current custodian specifies the recipient wallet, records the physical item's condition, and submits the handover. The request enters pending status.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-emerald-400 mb-1">STEP 03</div>
            <h3 className="text-lg font-bold text-white mb-2">Recipient Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Only the designated recipient wallet can accept or reject. Upon acceptance, custody permanently transfers and updates the on-chain historical audit log.
            </p>
          </div>
        </div>
      </section>

      {/* Core Security & Gas Optimization Highlights */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="glass-panel rounded-3xl p-8 border border-slate-800">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-mono font-semibold text-bot-400 uppercase tracking-wider">
                Strict Protocol Invariants
              </span>
              <h3 className="text-2xl font-bold text-white mt-2 mb-4">
                Designed for Absolute Custodial Integrity
              </h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Smart contract logic strictly isolates physical asset custody from token economics. No NFTs, no escrow overhead, zero unnecessary storage overhead.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-bot-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-slate-200">Immutable Original Ownership:</span>
                    <span className="text-xs text-slate-400 ml-1">
                      Original registrar is permanently tracked even across unlimited multi-hop custodian handovers.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-bot-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-slate-200">No Dual-Pending Handovers:</span>
                    <span className="text-xs text-slate-400 ml-1">
                      Prevents race conditions or double-custody claims on the same asset.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-bot-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-slate-200">Sender Cancellation Safeguard:</span>
                    <span className="text-xs text-slate-400 ml-1">
                      Current custodian can revoke an erroneous or unacknowledged handover anytime before recipient action.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                <span>BOT CHAIN TESTNET SPECIFICATIONS</span>
                <span className="text-bot-400">ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chain ID:</span>
                <span className="text-white font-bold">968 (0x3c8)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Public RPC:</span>
                <span className="text-bot-400 truncate max-w-[200px]">https://rpc.bohr.life</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Native Token:</span>
                <span className="text-white">BOT (18 decimals)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Supply:</span>
                <span className="text-white">150 Million BOT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Block Explorer:</span>
                <a
                  href="https://scan.bohr.life"
                  target="_blank"
                  rel="noreferrer"
                  className="text-bot-400 hover:underline flex items-center gap-1"
                >
                  <span>scan.bohr.life</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

