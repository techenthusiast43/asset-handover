import React, { useState, useEffect } from 'react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Boxes,
  Tag,
  Shield,
  UserCheck,
  Calendar,
  Copy,
  Check,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  History,
  ArrowLeft,
  Loader2,
  FileText,
} from 'lucide-react';
import { BOT_CHAIN_CONFIG } from '../config/botChain';

export function AssetDetailsPage({ assetId, setActiveTab, setSelectedAssetId }) {
  const {
    address,
    getAssetFullDetails,
    acceptHandover,
    rejectHandover,
    cancelHandover,
  } = useAssetHandover();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    if (!assetId) return;
    try {
      setLoading(true);
      const data = await getAssetFullDetails(assetId);
      setDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [assetId]);

  if (!assetId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400">No asset selected.</p>
        <button
          onClick={() => setActiveTab('my-assets')}
          className="mt-4 px-4 py-2 bg-bot-500 text-slate-950 font-bold rounded-xl text-xs"
        >
          Go to Asset Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 text-bot-400 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-mono">Loading on-chain asset details...</p>
      </div>
    );
  }

  if (!details || !details.asset) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-rose-400">Asset record not found on BOT Chain.</p>
        <button
          onClick={() => setActiveTab('my-assets')}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs"
        >
          Back
        </button>
      </div>
    );
  }

  const { asset, activeHandover, history } = details;
  const isCustodian =
    address && asset.currentCustodian.toLowerCase() === address.toLowerCase();
  const isOriginalOwner =
    address && asset.originalOwner.toLowerCase() === address.toLowerCase();
  const isRecipient =
    address &&
    activeHandover?.status === 1 &&
    activeHandover.toRecipient.toLowerCase() === address.toLowerCase();
  const isPendingInitiator =
    address &&
    activeHandover?.status === 1 &&
    activeHandover.fromCustodian.toLowerCase() === address.toLowerCase();

  const handleCopyId = () => {
    navigator.clipboard.writeText(asset.assetId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await acceptHandover(asset.assetId);
      await fetchDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please enter a rejection reason:', 'Condition not as described');
    if (reason === null) return;
    try {
      setActionLoading(true);
      await rejectHandover(asset.assetId, reason);
      await fetchDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this pending handover?')) return;
    try {
      setActionLoading(true);
      await cancelHandover(asset.assetId);
      await fetchDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => setActiveTab('my-assets')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assets</span>
      </button>

      {/* Main Detail Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-bot-500/20 text-bot-300 border border-bot-500/30 text-xs font-semibold">
                <Tag className="w-3.5 h-3.5" />
                {asset.category || 'General'}
              </span>
              {activeHandover?.status === 1 ? (
                <StatusBadge status={1} />
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  In Custody
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {asset.name}
            </h1>

            <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-400">
              <span>Physical Reference:</span>
              <span className="text-white font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {asset.assetRef}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isCustodian && activeHandover?.status !== 1 && (
              <button
                onClick={() => {
                  setSelectedAssetId(asset.assetId);
                  setActiveTab('create-handover');
                }}
                className="px-5 py-2.5 rounded-xl bg-bot-500 text-slate-950 font-bold text-xs hover:bg-bot-400 shadow-md shadow-bot-500/20 flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Initiate Handover</span>
              </button>
            )}

            {isRecipient && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Custody</span>
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs hover:bg-rose-500/30 flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {isPendingInitiator && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>Cancel Handover</span>
              </button>
            )}

            <button
              onClick={() => {
                setSelectedAssetId(asset.assetId);
                setActiveTab('history');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <History className="w-4 h-4 text-bot-400" />
              <span>Full Timeline</span>
            </button>
          </div>
        </div>

        {/* Short Description */}
        {asset.description && (
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-bot-400" />
              <span>Description / Technical Details</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">{asset.description}</p>
          </div>
        )}

        {/* Ownership & Custody Matrix */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-bot-400" />
                <span>Current Custodian</span>
              </span>
              {isCustodian && (
                <span className="px-2 py-0.5 rounded bg-bot-500/20 text-bot-300 border border-bot-500/30 text-[10px] font-bold">
                  You
                </span>
              )}
            </div>
            <div className="font-mono text-sm text-white break-all">{asset.currentCustodian}</div>
            <div className="text-[11px] text-slate-400">
              Currently holds physical responsibility and possession of this asset.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Original Registrar / Owner</span>
              </span>
              {isOriginalOwner && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                  You
                </span>
              )}
            </div>
            <div className="font-mono text-sm text-slate-300 break-all">{asset.originalOwner}</div>
            <div className="text-[11px] text-slate-400">
              Registered on BOT Chain on {new Date(asset.registeredAt * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Technical Blockchain Reference Strip */}
        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Asset ID:</span>
            <span className="text-slate-300 truncate max-w-xs sm:max-w-md">{asset.assetId}</span>
          </div>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1 text-bot-400 hover:text-bot-300 transition-colors"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-bot-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
          </button>
        </div>
      </div>

      {/* Active Handover Status Card (if any pending) */}
      {activeHandover && activeHandover.status === 1 && (
        <div className="glass-panel rounded-3xl p-6 border border-amber-500/40 bg-amber-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Clock className="w-5 h-5 animate-spin" />
              <span>Active Handover In Progress</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Initiated {new Date(activeHandover.createdAt * 1000).toLocaleString()}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">From Custodian:</span>
              <span className="text-white break-all">{activeHandover.fromCustodian}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Intended Recipient:</span>
              <span className="text-white break-all">{activeHandover.toRecipient}</span>
            </div>
          </div>

          {activeHandover.condition && (
            <div className="text-xs text-slate-300">
              <span className="text-slate-400 font-semibold">Reported Condition: </span>
              <span>{activeHandover.condition}</span>
            </div>
          )}

          {activeHandover.note && (
            <div className="text-xs text-slate-300 italic">
              <span className="text-slate-400 not-italic font-semibold">Handover Memo: </span>
              "{activeHandover.note}"
            </div>
          )}
        </div>
      )}

      {/* Handover Timeline Preview */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-bot-400" />
            <span>Custody Audit Trail ({history.length} Transfers)</span>
          </h3>
          <button
            onClick={() => {
              setSelectedAssetId(asset.assetId);
              setActiveTab('history');
            }}
            className="text-xs text-bot-400 hover:underline"
          >
            View Full Timeline
          </button>
        </div>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.slice(-3).map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status} />
                  <div className="font-mono text-slate-300">
                    <span>{item.fromCustodian.slice(0, 6)}...</span>
                    <span className="text-slate-500 mx-1.5">➔</span>
                    <span>{item.toRecipient.slice(0, 6)}...</span>
                  </div>
                </div>
                <div className="text-slate-500 text-[11px] font-mono">
                  {new Date(item.timestamp * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No previous handovers recorded. The original owner is currently in custody.
          </p>
        )}
      </div>
    </div>
  );
}

