import React, { useState, useEffect } from 'react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  ArrowLeft,
  Loader2,
  User,
  Activity,
  FileText,
  Boxes,
} from 'lucide-react';

export function HandoverHistoryPage({ assetId, setActiveTab, setSelectedAssetId }) {
  const { allAssets, getAssetFullDetails } = useAssetHandover();

  const [currentId, setCurrentId] = useState(assetId || '');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assetId) {
      setCurrentId(assetId);
    } else if (allAssets.length > 0 && !currentId) {
      setCurrentId(allAssets[0].assetId);
    }
  }, [assetId, allAssets, currentId]);

  useEffect(() => {
    const load = async () => {
      if (!currentId) return;
      try {
        setLoading(true);
        const res = await getAssetFullDetails(currentId);
        setDetails(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('my-assets')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assets</span>
        </button>

        {details?.asset && (
          <button
            onClick={() => {
              setSelectedAssetId(details.asset.assetId);
              setActiveTab('asset-details');
            }}
            className="text-xs text-bot-400 hover:underline font-medium"
          >
            View Asset Details
          </button>
        )}
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <History className="w-8 h-8 text-bot-400" />
          <span>Chain of Custody Audit Trail</span>
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Immutable historical log of registrations, handovers, acceptances, and rejections on BOT Chain.
        </p>
      </div>

      {/* Asset Selector */}
      {allAssets.length > 1 && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Asset to Inspect
          </label>
          <select
            value={currentId}
            onChange={(e) => setCurrentId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-bot-500"
          >
            {allAssets.map((a) => (
              <option key={a.assetId} value={a.assetId} className="bg-slate-900">
                {a.name} ({a.assetRef})
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-16 rounded-2xl text-center border border-slate-800">
          <Loader2 className="w-8 h-8 text-bot-400 animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-400">Loading audit history from BOT Chain...</p>
        </div>
      ) : details?.asset ? (
        <div className="space-y-6">
          {/* Asset Summary Banner */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-bot-400 font-semibold">{details.asset.category}</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{details.asset.name}</h3>
              <div className="text-xs font-mono text-slate-400 mt-1">
                Ref: <span className="text-slate-200">{details.asset.assetRef}</span> | Current Custodian:{' '}
                <span className="text-bot-400 font-bold">
                  {details.asset.currentCustodian.slice(0, 6)}...{details.asset.currentCustodian.slice(-4)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {/* Step 0: Registration */}
            <div className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-bot-500/20 border-2 border-bot-400 flex items-center justify-center text-bot-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-slate-800/90 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-bot-500/10 text-bot-400 border border-bot-500/30">
                    Asset Registered
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(details.asset.registeredAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Initial asset custody established by original registrar.
                </p>

                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                  <span className="text-slate-500">Registrar Wallet: </span>
                  <span className="text-white break-all">{details.asset.originalOwner}</span>
                </div>
              </div>
            </div>

            {/* Handover Records */}
            {details.history.map((record, idx) => {
              const isAccepted = record.status === 2;
              const isRejected = record.status === 3;
              const isCancelled = record.status === 4;

              const dotColor = isAccepted
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                : isRejected
                ? 'bg-rose-500/20 border-rose-400 text-rose-400'
                : 'bg-slate-700/40 border-slate-500 text-slate-400';

              const Icon = isAccepted ? CheckCircle2 : isRejected ? XCircle : Ban;

              return (
                <div key={idx} className="relative group">
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${dotColor}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="glass-panel rounded-2xl p-5 border border-slate-800/90 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={record.status} />
                        <span className="text-xs font-semibold text-slate-400">
                          Handover Event #{idx + 1}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(record.timestamp)}
                      </span>
                    </div>

                    {/* Parties */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">From Custodian:</span>
                        <span className="text-white break-all">{record.fromCustodian}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">
                          {isAccepted ? 'New Custodian:' : 'Target Recipient:'}
                        </span>
                        <span className="text-white break-all">{record.toRecipient}</span>
                      </div>
                    </div>

                    {/* Condition & Note */}
                    {(record.condition || record.note) && (
                      <div className="space-y-1 text-xs text-slate-300 pt-1">
                        {record.condition && (
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-bot-400 shrink-0" />
                            <span className="text-slate-400">Condition:</span>
                            <span className="font-medium text-white">{record.condition}</span>
                          </div>
                        )}
                        {record.note && (
                          <div className="flex items-start gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="text-slate-400">Note:</span>
                            <span className="italic text-slate-300">"{record.note}"</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-2xl text-center border border-slate-800 space-y-3">
          <Boxes className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-lg font-bold text-white">No Asset Selected</h4>
          <p className="text-xs text-slate-400">Please select an asset from the dashboard to inspect its timeline.</p>
        </div>
      )}
    </div>
  );
}

