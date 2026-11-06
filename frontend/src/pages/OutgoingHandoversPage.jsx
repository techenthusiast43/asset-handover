import React, { useState } from 'react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Send,
  Ban,
  Clock,
  User,
  Activity,
  FileText,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export function OutgoingHandoversPage({ setActiveTab, setSelectedAssetId }) {
  const {
    outgoingHandovers,
    allAssets,
    cancelHandover,
    loading,
    refreshAssets,
  } = useAssetHandover();

  const [cancellingAssetId, setCancellingAssetId] = useState(null);

  const handleCancel = async (assetId) => {
    if (!window.confirm('Are you sure you want to cancel this pending handover request?')) {
      return;
    }
    try {
      setCancellingAssetId(assetId);
      await cancelHandover(assetId);
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingAssetId(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Send className="w-8 h-8 text-amber-400" />
            <span>Outgoing Handover Requests</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Handovers initiated by you currently waiting for recipient confirmation. You can revoke them at any time.
          </p>
        </div>

        <button
          onClick={() => refreshAssets()}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold self-start sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {outgoingHandovers.length > 0 ? (
        <div className="space-y-4">
          {outgoingHandovers.map((handover) => {
            const asset = allAssets.find((a) => a.assetId === handover.assetId);
            const isCancelling = cancellingAssetId === handover.assetId;

            return (
              <div
                key={handover.assetId}
                className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
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

                  <div className="grid sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-bot-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[11px]">Intended Recipient:</span>
                        <span className="font-mono text-white">
                          {handover.toRecipient.slice(0, 6)}...{handover.toRecipient.slice(-4)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-bot-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[11px]">Reported Condition:</span>
                        <span className="font-medium text-slate-200">{handover.condition || 'Unspecified'}</span>
                      </div>
                    </div>

                    {handover.note && (
                      <div className="sm:col-span-2 flex items-start gap-2 pt-1 border-t border-slate-800/80">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 block text-[11px]">Note:</span>
                          <span className="text-slate-300 italic">{handover.note}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex sm:flex-col items-center justify-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    onClick={() => handleCancel(handover.assetId)}
                    disabled={isCancelling}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-slate-700 text-slate-300 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isCancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                    <span>Cancel Handover</span>
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
          <Send className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-lg font-bold text-white">No Outgoing Pending Handovers</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You do not currently have any active handover requests pending recipient acceptance.
          </p>
        </div>
      )}
    </div>
  );
}

