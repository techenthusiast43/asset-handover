import React, { useState } from 'react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Activity,
  FileText,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export function IncomingHandoversPage({ setActiveTab, setSelectedAssetId }) {
  const {
    address,
    isConnected,
    incomingHandovers,
    allAssets,
    acceptHandover,
    rejectHandover,
    loading,
    refreshAssets,
  } = useAssetHandover();

  const [actingAssetId, setActingAssetId] = useState(null);
  const [rejectModalAssetId, setRejectModalAssetId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleAccept = async (assetId) => {
    try {
      setActingAssetId(assetId);
      await acceptHandover(assetId);
    } catch (err) {
      console.error(err);
    } finally {
      setActingAssetId(null);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalAssetId) return;
    try {
      setActingAssetId(rejectModalAssetId);
      await rejectHandover(rejectModalAssetId, rejectReason.trim() || 'Rejected by recipient');
      setRejectModalAssetId(null);
      setRejectReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setActingAssetId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Inbox className="w-8 h-8 text-bot-400" />
            <span>Incoming Handover Requests</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Physical assets pending your confirmation. You must accept receipt to officially update custody on-chain.
          </p>
        </div>

        <button
          onClick={() => refreshAssets()}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold self-start sm:self-auto"
        >
          Refresh Requests
        </button>
      </div>

      {/* List */}
      {incomingHandovers.length > 0 ? (
        <div className="space-y-4">
          {incomingHandovers.map((handover) => {
            const asset = allAssets.find((a) => a.assetId === handover.assetId);
            const isProcessing = actingAssetId === handover.assetId;

            return (
              <div
                key={handover.assetId}
                className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Asset & Transfer details */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-bot-500/20 text-bot-300 border border-bot-500/30 font-medium">
                      {asset?.category || 'Physical Asset'}
                    </span>
                    <StatusBadge status={handover.status} />
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(handover.createdAt)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white truncate">
                      {asset?.name || 'Asset ID: ' + handover.assetId.slice(0, 10)}
                    </h3>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      Ref: <span className="text-slate-200">{asset?.assetRef || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Transfer metadata */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-bot-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[11px]">From Custodian:</span>
                        <span className="font-mono text-white">
                          {handover.fromCustodian.slice(0, 6)}...{handover.fromCustodian.slice(-4)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[11px]">Reported Condition:</span>
                        <span className="font-medium text-slate-200">{handover.condition || 'Unspecified'}</span>
                      </div>
                    </div>

                    {handover.note && (
                      <div className="sm:col-span-2 flex items-start gap-2 pt-1 border-t border-slate-800/80">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 block text-[11px]">Handover Memo:</span>
                          <span className="text-slate-300 italic">{handover.note}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col items-center justify-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    onClick={() => handleAccept(handover.assetId)}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Accept Custody</span>
                  </button>

                  <button
                    onClick={() => setRejectModalAssetId(handover.assetId)}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAssetId(handover.assetId);
                      setActiveTab('asset-details');
                    }}
                    className="text-[11px] text-slate-400 hover:text-white underline pt-1"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-2xl text-center border border-slate-800 space-y-3">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-lg font-bold text-white">No Incoming Handover Requests</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When another wallet initiates a physical handover assigning you as the recipient, it will appear here for your cryptographic confirmation.
          </p>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalAssetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <span>Reject Handover Request</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Physical custody will remain with the current custodian. Please provide a reason (e.g. damaged goods, missing cables, incorrect recipient).
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Broken screen observed upon inspection, wrong department..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalAssetId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actingAssetId === rejectModalAssetId}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 flex items-center gap-1.5"
                >
                  {actingAssetId === rejectModalAssetId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

