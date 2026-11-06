import React from 'react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import { ExternalLink, CheckCircle, AlertTriangle, Loader2, X } from 'lucide-react';
import { BOT_CHAIN_CONFIG } from '../config/botChain';

export function NotificationToast() {
  const { txNotification, dismissNotification } = useAssetHandover();

  if (!txNotification) return null;

  const { status, message, hash } = txNotification;

  const bgBorder =
    status === 'pending'
      ? 'bg-slate-900/95 border-amber-500/40 text-amber-200 shadow-amber-950/50'
      : status === 'success'
      ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
      : 'bg-slate-900/95 border-rose-500/40 text-rose-200 shadow-rose-950/50';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom duration-300">
      <div className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${bgBorder} flex items-start gap-3.5`}>
        <div className="shrink-0 mt-0.5">
          {status === 'pending' && <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />}
          {status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
          {status === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100 break-words">{message}</p>
          {hash && (
            <a
              href={`${BOT_CHAIN_CONFIG.blockExplorerUrl}/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-bot-400 hover:text-bot-300 underline font-mono break-all"
            >
              <span>View on BOT Scan: {hash.slice(0, 10)}...{hash.slice(-8)}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          )}
        </div>

        <button
          onClick={dismissNotification}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

