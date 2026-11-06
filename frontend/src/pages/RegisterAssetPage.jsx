import React, { useState } from 'react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import { PlusCircle, Tag, FileText, Hash, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'IT Equipment',
  'Fleet Vehicle',
  'Industrial Machinery',
  'Access Key & Security Badge',
  'Lab & Testing Instrument',
  'Specialized Tooling',
  'Office Furniture & Fixtures',
  'Other / Custom',
];

export function RegisterAssetPage({ setActiveTab, setSelectedAssetId }) {
  const { isConnected, isCorrectNetwork, registerAsset, openAppKit, switchToBotChain } =
    useAssetHandover();

  const [formData, setFormData] = useState({
    name: '',
    assetRef: '',
    description: '',
    category: 'IT Equipment',
    customCategory: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please provide a valid asset name');
      return;
    }
    if (!formData.assetRef.trim()) {
      setErrorMsg('Please provide a unique asset reference (serial number / barcode)');
      return;
    }

    const categoryFinal =
      formData.category === 'Other / Custom' && formData.customCategory.trim()
        ? formData.customCategory.trim()
        : formData.category;

    try {
      setSubmitting(true);
      setErrorMsg('');
      await registerAsset({
        name: formData.name.trim(),
        assetRef: formData.assetRef.trim(),
        description: formData.description.trim(),
        category: categoryFinal,
      });

      // Clear form and navigate to My Assets
      setFormData({
        name: '',
        assetRef: '',
        description: '',
        category: 'IT Equipment',
        customCategory: '',
      });
      setActiveTab('my-assets');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.reason || err.message || 'Asset registration failed. Check console.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <PlusCircle className="w-8 h-8 text-bot-400" />
          <span>Register Physical Asset</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Record a new physical asset on the BOT Chain. You will be registered as both the original owner and initial custodian.
        </p>
      </div>

      {!isConnected ? (
        <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
          <ShieldCheck className="w-12 h-12 text-bot-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            You need a connected Web3 wallet on BOT Chain Testnet to register physical assets.
          </p>
          <button
            onClick={() => openAppKit()}
            className="px-6 py-3 rounded-xl font-bold bg-bot-500 text-slate-950 hover:bg-bot-400 shadow-lg shadow-bot-500/20"
          >
            Connect Wallet
          </button>
        </div>
      ) : !isCorrectNetwork ? (
        <div className="glass-panel p-8 rounded-2xl text-center border border-amber-500/30">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Wrong Network Detected</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Please switch your wallet to BOT Chain Testnet (Chain ID 968) to register assets.
          </p>
          <button
            onClick={switchToBotChain}
            className="px-6 py-3 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
          >
            Switch to BOT Chain Testnet
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Asset Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Asset Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. MacBook Pro 16 M3 Max, Forklift Toyota 8FGU25, Master Key 4A"
                required
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-bot-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Unique Asset Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Unique Reference / Serial Number <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="assetRef"
                value={formData.assetRef}
                onChange={handleChange}
                placeholder="e.g. SN-MBP-98842, VIN-5YJ3E1EA-9912, BARCODE-00892"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-bot-500 transition-colors text-sm font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Must be unique across the protocol. Duplicate serial references will be rejected by the smart contract.
            </p>
          </div>

          {/* Category */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Asset Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-bot-500 transition-colors text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.category === 'Other / Custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Custom Category Name
                </label>
                <input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleChange}
                  placeholder="e.g. Drone, Satellite Phone, Vault Key"
                  className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-bot-500 transition-colors text-sm"
                />
              </div>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Short Description / Hardware Specs
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 text-slate-500 pointer-events-none">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief technical details, accessories included (chargers, case), asset tags, or departmental notes..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-bot-500 transition-colors text-sm resize-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Gas optimized: essential concise summary stored directly on BOT Chain.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('my-assets')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-bot-400 to-bot-500 text-slate-950 hover:from-bot-300 hover:to-bot-400 disabled:opacity-50 shadow-lg shadow-bot-500/20 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to BOT Chain...</span>
                </>
              ) : (
                <span>Register On-Chain</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

