import React, { useState } from 'react';
import { Copy, Check, ArrowRight, UserCheck, Shield, Tag } from 'lucide-react';
import { useAssetHandover } from '../context/AssetHandoverContext';

export function AssetCard({ asset, onSelectAsset, onInitiateHandover }) {
  const { address } = useAssetHandover();
  const [copiedId, setCopiedId] = useState(false);

  const isCustodian =
    address && asset.currentCustodian.toLowerCase() === address.toLowerCase();
  const isOriginalOwner =
    address && asset.originalOwner.toLowerCase() === address.toLowerCase();

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.assetId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={() => onSelectAsset && onSelectAsset(asset.assetId)}
      className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Decorative top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isCustodian ? 'bg-bot-500' : 'bg-slate-700'
        }`}
      />

      <div>
        {/* Header: Category & Date */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 font-medium">
            <Tag className="w-3 h-3 text-bot-400" />
            {asset.category || 'General'}
          </span>
          <span className="text-[11px] font-mono">{formatDate(asset.registeredAt)}</span>
        </div>

        {/* Title & Ref */}
        <h4 className="text-base font-bold text-white group-hover:text-bot-400 transition-colors line-clamp-1 mb-1">
          {asset.name}
        </h4>
        <div className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-1.5">
          <span className="text-slate-500">Ref:</span>
          <span className="text-slate-200 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">
            {asset.assetRef}
          </span>
        </div>

        {/* Description */}
        {asset.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4">
            {asset.description}
          </p>
        )}

        {/* Custodian & Owner Status */}
        <div className="space-y-2 py-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-bot-400" />
              <span>Current Custodian:</span>
            </span>
            <span className="font-mono text-slate-200">
              {isCustodian ? (
                <span className="px-2 py-0.5 rounded bg-bot-500/20 text-bot-300 border border-bot-500/30 font-bold">
                  You (Holding)
                </span>
              ) : (
                `${asset.currentCustodian.slice(0, 6)}...${asset.currentCustodian.slice(-4)}`
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Registered By:</span>
            </span>
            <span className="font-mono text-slate-400">
              {isOriginalOwner ? (
                <span className="text-slate-300 font-medium">You (Owner)</span>
              ) : (
                `${asset.originalOwner.slice(0, 6)}...${asset.originalOwner.slice(-4)}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
        <button
          onClick={handleCopy}
          className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 p-1 rounded hover:bg-slate-800/50 transition-colors"
          title="Copy Asset ID"
        >
          {copiedId ? (
            <>
              <Check className="w-3 h-3 text-bot-400" />
              <span className="text-bot-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>ID: {asset.assetId.slice(0, 6)}...</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          {isCustodian && onInitiateHandover && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInitiateHandover(asset.assetId);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-bot-500/20 text-bot-300 hover:bg-bot-500 hover:text-slate-950 border border-bot-500/40 transition-all"
            >
              Handover
            </button>
          )}
          <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-bot-400 group-hover:translate-x-1 transition-all">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

