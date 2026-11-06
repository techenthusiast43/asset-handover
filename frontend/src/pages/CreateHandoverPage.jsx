import React, { useState, useEffect } from 'react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import {
  ArrowRightLeft,
  User,
  Activity,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Boxes,
} from 'lucide-react';
import { ethers } from 'ethers';

const CONDITIONS = [
  'Mint / Brand New',
  'Excellent Condition (Clean & Fully Functional)',
  'Good (Normal Wear & Tear)',
  'Fair (Minor Cosmetic Scratches)',
  'Needs Repair / Maintenance Required',
  'Decommissioned / For Inspection Only',
];

export function CreateHandoverPage({ setActiveTab, selectedAssetId, setSelectedAssetId }) {
  const {
    address,
    isConnected,
    isCorrectNetwork,
    myCustodianAssets,
    initiateHandover,
    openAppKit,
    switchToBotChain,
  } = useAssetHandover();

  const [assetId, setAssetId] = useState(selectedAssetId || '');
  const [recipient, setRecipient] = useState('');
  const [condition, setCondition] = useState(CONDITIONS[1]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update selected asset if passed via prop
  useEffect(() => {
    if (selectedAssetId) {
      setAssetId(selectedAssetId);
    } else if (myCustodianAssets.length > 0 && !assetId) {
      setAssetId(myCustodianAssets[0].assetId);
    }
  }, [selectedAssetId, myCustodianAssets, assetId]);

  const selectedAsset = myCustodianAssets.find((a) => a.assetId === assetId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!assetId) {
      setErrorMsg('Please select an asset from your custody.');
      return;
    }

    if (!ethers.isAddress(recipient)) {
      setErrorMsg('Please enter a valid Ethereum / BOT Chain wallet address (0x...).');
      return;
    }

    if (recipient.toLowerCase() === address.toLowerCase()) {
      setErrorMsg('Cannot handover an asset to your own wallet. Specify a different recipient.');
      return;
    }

    try {
      setSubmitting(true);
      await initiateHandover(assetId, recipient.trim(), condition, note.trim());
      // Navigate to outgoing handovers
      setActiveTab('outgoing');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.reason || err.message || 'Failed to initiate handover. Check console.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-bot-400" />
          <span>Initiate Physical Handover</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Transfer custody of a physical asset to another wallet. The recipient must confirm receipt before custody updates.
        </p>
      </div>

      {!isConnected ? (
        <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
          <ArrowRightLeft className="w-12 h-12 text-bot-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            You must connect your custodian wallet to initiate asset handovers.
          </p>
          <button
            onClick={() => openAppKit()}
            className="px-6 py-3 rounded-xl font-bold bg-bot-500 text-slate-950 hover:bg-bot-400"
          >
            Connect Wallet
          </button>
        </div>
      ) : !isCorrectNetwork ? (
        <div className="glass-panel p-8 rounded-2xl text-center border border-amber-500/30">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Wrong Network</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Please switch to BOT Chain Testnet (Chain ID 968) to manage asset handovers.
          </p>
          <button
            onClick={switchToBotChain}
            className="px-6 py-3 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
          >
            Switch to BOT Chain Testnet
          </button>
        </div>
      ) : myCustodianAssets.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center border border-slate-800 space-y-4">
          <Boxes className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Assets In Custody</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Only the current custodian of an asset can initiate a handover. You currently do not have physical custody of any assets.
          </p>
          <button
            onClick={() => setActiveTab('register')}
            className="px-5 py-2.5 rounded-xl bg-bot-500 text-slate-950 font-bold text-xs hover:bg-bot-400"
          >
            Register an Asset First
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

          {/* Select Asset */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Asset in Your Custody <span className="text-rose-400">*</span>
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-bot-500 text-sm"
              required
            >
              {myCustodianAssets.map((asset) => (
                <option key={asset.assetId} value={asset.assetId} className="bg-slate-900">
                  {asset.name} (Ref: {asset.assetRef})
                </option>
              ))}
            </select>

            {selectedAsset && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-medium text-white">{selectedAsset.category || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Physical Serial / Ref:</span>
                  <span className="font-mono text-bot-400">{selectedAsset.assetRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Asset ID:</span>
                  <span className="font-mono text-slate-400 truncate max-w-[200px]">
                    {selectedAsset.assetId}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Recipient Wallet Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Recipient Wallet Address <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-bot-500 text-sm font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ensure this is the correct recipient address. Only this address will be able to accept custody.
            </p>
          </div>

          {/* Condition of Asset */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Physical Asset Condition at Handover
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Activity className="w-4 h-4" />
              </div>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-bot-500 text-sm"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Handover Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Handover Note / Tracking Memo
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 text-slate-500 pointer-events-none">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for transfer, departmental ticket #, location/room destination, accessories included..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-bot-500 text-sm resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('my-assets')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
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
                  <span>Initiating on BOT Chain...</span>
                </>
              ) : (
                <span>Submit Handover</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

