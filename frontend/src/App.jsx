import React, { useState } from 'react';
import { Web3Provider } from './context/Web3Provider';
import { AssetHandoverProvider } from './context/AssetHandoverContext';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { LandingPage } from './pages/LandingPage';
import { RegisterAssetPage } from './pages/RegisterAssetPage';
import { MyAssetsPage } from './pages/MyAssetsPage';
import { CreateHandoverPage } from './pages/CreateHandoverPage';
import { IncomingHandoversPage } from './pages/IncomingHandoversPage';
import { OutgoingHandoversPage } from './pages/OutgoingHandoversPage';
import { AssetDetailsPage } from './pages/AssetDetailsPage';
import { HandoverHistoryPage } from './pages/HandoverHistoryPage';
import { BOT_CHAIN_CONFIG } from './config/botChain';
import { ShieldCheck, ExternalLink } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'register':
        return (
          <RegisterAssetPage
            setActiveTab={setActiveTab}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
      case 'my-assets':
      case 'all':
        return (
          <MyAssetsPage
            setActiveTab={setActiveTab}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
      case 'create-handover':
        return (
          <CreateHandoverPage
            setActiveTab={setActiveTab}
            selectedAssetId={selectedAssetId}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
      case 'incoming':
        return (
          <IncomingHandoversPage
            setActiveTab={setActiveTab}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
      case 'outgoing':
        return (
          <OutgoingHandoversPage
            setActiveTab={setActiveTab}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
      case 'asset-details':
        return (
          <AssetDetailsPage
            assetId={selectedAssetId}
            setActiveTab={setActiveTab}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
      case 'history':
        return (
          <HandoverHistoryPage
            assetId={selectedAssetId}
            setActiveTab={setActiveTab}
            setSelectedAssetId={setSelectedAssetId}
          />
        );
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-900 text-slate-100 selection:bg-bot-500 selection:text-slate-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 py-4">{renderContent()}</main>

      <NotificationToast />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-navy-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-bot-400" />
            <span className="font-semibold text-white">AssetHandover Protocol</span>
            <span>&bull;</span>
            <span>BOT Chain Testnet (ID: 968)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={BOT_CHAIN_CONFIG.rpcUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-bot-400 transition-colors"
            >
              RPC Endpoint
            </a>
            <a
              href={BOT_CHAIN_CONFIG.blockExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-bot-400 transition-colors flex items-center gap-1"
            >
              <span>BOT Scan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <AssetHandoverProvider>
        <MainApp />
      </AssetHandoverProvider>
    </Web3Provider>
  );
}
