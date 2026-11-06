import React, { useState } from 'react';
import { useAssetHandover } from '../context/AssetHandoverContext';
import { AssetCard } from '../components/AssetCard';
import {
  Layers,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Boxes,
  Shield,
  UserCheck,
} from 'lucide-react';

export function MyAssetsPage({ setActiveTab, setSelectedAssetId }) {
  const {
    address,
    isConnected,
    myCustodianAssets,
    myOriginalAssets,
    allAssets,
    loading,
    refreshAssets,
  } = useAssetHandover();

  const [filterMode, setFilterMode] = useState('custody'); // 'custody' | 'registered' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const currentList =
    filterMode === 'custody'
      ? myCustodianAssets
      : filterMode === 'registered'
      ? myOriginalAssets
      : allAssets;

  // Extract unique categories
  const categories = ['ALL', ...new Set(allAssets.map((a) => a.category || 'General'))];

  // Filter by search & category
  const filteredAssets = currentList.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || (asset.category || 'General') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectAsset = (assetId) => {
    setSelectedAssetId(assetId);
    setActiveTab('asset-details');
  };

  const handleInitiateHandover = (assetId) => {
    setSelectedAssetId(assetId);
    setActiveTab('create-handover');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-bot-400" />
            <span>Asset Dashboard</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Monitor physical assets currently in your custody and audit the registry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAssets()}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-medium"
            title="Refresh assets from BOT Chain"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-bot-400' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className="px-4 py-2.5 rounded-xl bg-bot-500 text-slate-950 font-bold text-xs hover:bg-bot-400 transition-colors shadow-md shadow-bot-500/20 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilterMode('custody')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterMode === 'custody'
              ? 'bg-bot-500/20 text-bot-300 border border-bot-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>In My Custody ({myCustodianAssets.length})</span>
        </button>

        <button
          onClick={() => setFilterMode('registered')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterMode === 'registered'
              ? 'bg-bot-500/20 text-bot-300 border border-bot-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Originally Registered ({myOriginalAssets.length})</span>
        </button>

        <button
          onClick={() => setFilterMode('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterMode === 'all'
              ? 'bg-bot-500/20 text-bot-300 border border-bot-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>All Registry Assets ({allAssets.length})</span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by asset name, reference serial, or asset ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-bot-500 text-xs font-mono"
          />
        </div>

        <div className="relative min-w-[180px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-bot-500 text-xs"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-900">
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset Cards Grid */}
      {loading && allAssets.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center border border-slate-800">
          <RefreshCw className="w-8 h-8 text-bot-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">Fetching registered assets from BOT Chain...</p>
        </div>
      ) : filteredAssets.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.assetId}
              asset={asset}
              onSelectAsset={handleSelectAsset}
              onInitiateHandover={handleInitiateHandover}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-2xl text-center border border-slate-800 space-y-4">
          <Boxes className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-lg font-bold text-white">No Assets Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'No assets match your search criteria. Try modifying your search or filter.'
              : filterMode === 'custody'
              ? "You do not currently have custody of any assets. Register a new asset or accept an incoming handover."
              : 'No assets have been recorded yet in this category.'}
          </p>
          <button
            onClick={() => setActiveTab('register')}
            className="px-5 py-2.5 rounded-xl bg-bot-500 text-slate-950 font-bold text-xs hover:bg-bot-400 inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register First Asset</span>
          </button>
        </div>
      )}
    </div>
  );
}

