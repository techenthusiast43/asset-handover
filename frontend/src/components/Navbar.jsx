import React, { useState } from 'react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import {
  Boxes,
  PlusCircle,
  ArrowRightLeft,
  Inbox,
  Send,
  Layers,
  Settings,
  AlertCircle,
  ExternalLink,
  Menu,
  X,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { BOT_CHAIN_CONFIG } from '../config/botChain';

export function Navbar({ activeTab, setActiveTab }) {
  const {
    address,
    isConnected,
    isCorrectNetwork,
    contractAddress,
    updateContractAddress,
    openAppKit,
    disconnectWallet,
    switchToBotChain,
    incomingHandovers,
    outgoingHandovers,
  } = useAssetHandover();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customAddr, setCustomAddr] = useState(contractAddress);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddr = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveContract = (e) => {
    e.preventDefault();
    updateContractAddress(customAddr.trim());
    setShowConfigModal(false);
  };

  const navItems = [
    { id: 'landing', label: 'Home', icon: Boxes },
    { id: 'my-assets', label: 'My Assets', icon: Layers },
    { id: 'register', label: 'Register Asset', icon: PlusCircle },
    { id: 'create-handover', label: 'Initiate Handover', icon: ArrowRightLeft },
    {
      id: 'incoming',
      label: 'Incoming',
      icon: Inbox,
      badge: incomingHandovers.length,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'outgoing',
      label: 'Outgoing',
      icon: Send,
      badge: outgoingHandovers.length,
      badgeColor: 'bg-amber-500',
    },
    { id: 'all', label: 'Registry', icon: Boxes },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-bot-600 to-bot-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-bot-500/20">
                <ShieldCheck className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  AssetHandover
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-bot-500/20 text-bot-400 border border-bot-500/30">
                    BOT Chain
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 block -mt-0.5">Custody Protocol</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      isActive
                        ? 'bg-slate-800 text-bot-400 shadow-sm border border-slate-700/60'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-slate-950 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Network & Wallet */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Network Switcher Button / Indicator */}
              {isConnected && (
                <div>
                  {isCorrectNetwork ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>BOT Chain (968)</span>
                    </div>
                  ) : (
                    <button
                      onClick={switchToBotChain}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors animate-pulse"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Switch to BOT Chain</span>
                    </button>
                  )}
                </div>
              )}

              {/* Contract Configuration Icon */}
              <button
                onClick={() => setShowConfigModal(true)}
                title="Contract Configuration"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-800"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Wallet Button */}
              {isConnected ? (
                <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl p-1.5">
                  <button
                    onClick={handleCopyAddr}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-mono text-slate-300 hover:text-white transition-colors"
                    title="Click to copy wallet address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-bot-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                  </button>
                  <button
                    onClick={() => disconnectWallet()}
                    className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openAppKit()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-bot-400 to-bot-500 hover:from-bot-300 hover:to-bot-400 shadow-md shadow-bot-500/20 transition-all hover:scale-102"
                >
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-navy-900/95 px-4 pt-3 pb-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-slate-800 text-bot-400' : 'text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-slate-950 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {isConnected ? (
                <>
                  <div className="text-xs font-mono text-slate-400 truncate">
                    Wallet: {address}
                  </div>
                  {!isCorrectNetwork && (
                    <button
                      onClick={switchToBotChain}
                      className="w-full py-2 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/30"
                    >
                      Switch to BOT Chain (968)
                    </button>
                  )}
                  <button
                    onClick={() => disconnectWallet()}
                    className="w-full py-2 bg-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    openAppKit();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-bot-500 text-slate-950 font-bold rounded-xl text-sm"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Contract Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-bot-400" />
                <span>BOT Chain Contract Setup</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Active AssetHandover Contract Address
                </label>
                <input
                  type="text"
                  value={customAddr}
                  onChange={(e) => setCustomAddr(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm font-mono focus:outline-none focus:border-bot-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Target network: <strong>BOT Chain Testnet (Chain ID 968)</strong>
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1 font-mono">
                <div>RPC: <span className="text-bot-400">{BOT_CHAIN_CONFIG.rpcUrl}</span></div>
                <div>Explorer: <span className="text-bot-400">{BOT_CHAIN_CONFIG.blockExplorerUrl}</span></div>
                <div>Token: <span className="text-bot-400">{BOT_CHAIN_CONFIG.nativeCurrency.symbol}</span></div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-bot-500 text-slate-950 hover:bg-bot-400 font-bold"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

