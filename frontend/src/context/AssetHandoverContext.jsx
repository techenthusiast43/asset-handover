import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId, useSwitchChain, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { ethers } from 'ethers';
import contractConfig from '../contracts/contractConfig.json';
import { BOT_CHAIN_CONFIG } from '../config/botChain';

const AssetHandoverContext = createContext();

export function AssetHandoverProvider({ children }) {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const [contractAddress, setContractAddress] = useState(
    () => localStorage.getItem('bot_asset_contract_addr') || contractConfig.address || ''
  );
  const [allAssets, setAllAssets] = useState([]);
  const [incomingHandovers, setIncomingHandovers] = useState([]);
  const [outgoingHandovers, setOutgoingHandovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txNotification, setTxNotification] = useState(null); // { status: 'pending'|'success'|'error', message, hash }

  const isCorrectNetwork = currentChainId === BOT_CHAIN_CONFIG.chainId;

  // Persist updated contract address
  const updateContractAddress = (newAddr) => {
    setContractAddress(newAddr);
    localStorage.setItem('bot_asset_contract_addr', newAddr);
  };

  // Switch or Add BOT Chain in wallet
  const switchToBotChain = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: BOT_CHAIN_CONFIG.chainId });
      } else if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BOT_CHAIN_CONFIG.chainIdHex }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: BOT_CHAIN_CONFIG.chainIdHex,
                  chainName: BOT_CHAIN_CONFIG.chainName,
                  rpcUrls: [BOT_CHAIN_CONFIG.rpcUrl],
                  nativeCurrency: BOT_CHAIN_CONFIG.nativeCurrency,
                  blockExplorerUrls: [BOT_CHAIN_CONFIG.blockExplorerUrl],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (err) {
      console.error('Failed to switch to BOT Chain:', err);
      showNotification('error', `Failed to switch to BOT Chain: ${err.message}`);
    }
  };

  const showNotification = (status, message, hash = null) => {
    setTxNotification({ status, message, hash });
    if (status !== 'pending') {
      setTimeout(() => {
        setTxNotification((prev) => (prev?.hash === hash ? null : prev));
      }, 7000);
    }
  };

  const dismissNotification = () => setTxNotification(null);

  // Helper to get read contract instance via RPC or BrowserProvider
  const getReadContract = useCallback(() => {
    if (!contractAddress || contractAddress === ethers.ZeroAddress) return null;
    try {
      const rpcProvider = new ethers.JsonRpcProvider(BOT_CHAIN_CONFIG.rpcUrl);
      return new ethers.Contract(contractAddress, contractConfig.abi, rpcProvider);
    } catch (err) {
      console.error('Error creating read contract:', err);
      return null;
    }
  }, [contractAddress]);

  // Helper to get signer contract instance
  const getWriteContract = useCallback(async () => {
    if (!window.ethereum) throw new Error('No crypto wallet detected');
    if (!contractAddress || contractAddress === ethers.ZeroAddress) {
      throw new Error('Contract address not set or invalid');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, contractConfig.abi, signer);
  }, [contractAddress]);

  // Fetch all assets & handovers
  const refreshAssets = useCallback(async () => {
    const contract = getReadContract();
    if (!contract) {
      setAllAssets([]);
      setIncomingHandovers([]);
      setOutgoingHandovers([]);
      return;
    }

    try {
      setLoading(true);
      const totalCountBn = await contract.getTotalAssetCount();
      const total = Number(totalCountBn);

      if (total === 0) {
        setAllAssets([]);
        setIncomingHandovers([]);
        setOutgoingHandovers([]);
        setLoading(false);
        return;
      }

      // Fetch all assets
      const rawAssets = await contract.getAllAssets();
      const parsedAssets = rawAssets.map((a) => ({
        assetId: a.assetId,
        name: a.name,
        assetRef: a.assetRef,
        description: a.description,
        category: a.category,
        originalOwner: a.originalOwner,
        currentCustodian: a.currentCustodian,
        registeredAt: Number(a.registeredAt),
        exists: a.exists,
      }));

      setAllAssets(parsedAssets);

      // If user is connected, query incoming & outgoing pending handovers
      if (address) {
        const [incoming, outgoing] = await Promise.all([
          contract.getIncomingPendingHandovers(address),
          contract.getOutgoingPendingHandovers(address),
        ]);

        const parseHandovers = (list) =>
          list.map((h) => ({
            assetId: h.assetId,
            fromCustodian: h.fromCustodian,
            toRecipient: h.toRecipient,
            condition: h.condition,
            note: h.note,
            createdAt: Number(h.createdAt),
            status: Number(h.status),
          }));

        setIncomingHandovers(parseHandovers(incoming));
        setOutgoingHandovers(parseHandovers(outgoing));
      } else {
        setIncomingHandovers([]);
        setOutgoingHandovers([]);
      }
    } catch (err) {
      console.error('Failed to load contract assets:', err);
    } finally {
      setLoading(false);
    }
  }, [getReadContract, address]);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  // Register physical asset
  const registerAsset = async ({ name, assetRef, description, category }) => {
    try {
      showNotification('pending', 'Submitting asset registration transaction...');
      const contract = await getWriteContract();
      const tx = await contract.registerAsset(name, assetRef, description, category || 'General');
      showNotification('pending', 'Mining transaction on BOT Chain...', tx.hash);

      const receipt = await tx.wait();
      showNotification('success', `Asset "${name}" successfully registered!`, receipt.hash);
      await refreshAssets();
      return receipt;
    } catch (err) {
      console.error('Registration failed:', err);
      const reason = err.reason || err.message || 'Transaction failed';
      showNotification('error', `Registration failed: ${reason}`);
      throw err;
    }
  };

  // Initiate handover
  const initiateHandover = async (assetId, toRecipient, condition, note) => {
    try {
      showNotification('pending', 'Initiating handover on-chain...');
      const contract = await getWriteContract();
      const tx = await contract.initiateHandover(assetId, toRecipient, condition, note || '');
      showNotification('pending', 'Waiting for block confirmation...', tx.hash);

      const receipt = await tx.wait();
      showNotification('success', 'Handover initiated successfully!', receipt.hash);
      await refreshAssets();
      return receipt;
    } catch (err) {
      console.error('Initiate handover failed:', err);
      const reason = err.reason || err.message || 'Transaction failed';
      showNotification('error', `Handover initiation failed: ${reason}`);
      throw err;
    }
  };

  // Accept handover
  const acceptHandover = async (assetId) => {
    try {
      showNotification('pending', 'Accepting asset custody on-chain...');
      const contract = await getWriteContract();
      const tx = await contract.acceptHandover(assetId);
      showNotification('pending', 'Transferring custody on BOT Chain...', tx.hash);

      const receipt = await tx.wait();
      showNotification('success', 'Custody accepted! You are now the official custodian.', receipt.hash);
      await refreshAssets();
      return receipt;
    } catch (err) {
      console.error('Accept handover failed:', err);
      const reason = err.reason || err.message || 'Transaction failed';
      showNotification('error', `Accept handover failed: ${reason}`);
      throw err;
    }
  };

  // Reject handover
  const rejectHandover = async (assetId, reason) => {
    try {
      showNotification('pending', 'Rejecting custody handover...');
      const contract = await getWriteContract();
      const tx = await contract.rejectHandover(assetId, reason || 'Rejected by recipient');
      showNotification('pending', 'Recording rejection on BOT Chain...', tx.hash);

      const receipt = await tx.wait();
      showNotification('success', 'Handover rejected. Custody returned to original holder.', receipt.hash);
      await refreshAssets();
      return receipt;
    } catch (err) {
      console.error('Reject handover failed:', err);
      const reason = err.reason || err.message || 'Transaction failed';
      showNotification('error', `Reject handover failed: ${reason}`);
      throw err;
    }
  };

  // Cancel handover
  const cancelHandover = async (assetId) => {
    try {
      showNotification('pending', 'Cancelling pending handover...');
      const contract = await getWriteContract();
      const tx = await contract.cancelHandover(assetId);
      showNotification('pending', 'Recording cancellation on BOT Chain...', tx.hash);

      const receipt = await tx.wait();
      showNotification('success', 'Handover request cancelled.', receipt.hash);
      await refreshAssets();
      return receipt;
    } catch (err) {
      console.error('Cancel handover failed:', err);
      const reason = err.reason || err.message || 'Transaction failed';
      showNotification('error', `Cancel handover failed: ${reason}`);
      throw err;
    }
  };

  // Fetch full details for a single asset (asset + active handover + full history)
  const getAssetFullDetails = async (assetId) => {
    const contract = getReadContract();
    if (!contract) return null;
    try {
      const [asset, activeHandover, history] = await Promise.all([
        contract.getAsset(assetId),
        contract.getActiveHandover(assetId),
        contract.getHandoverHistory(assetId),
      ]);

      return {
        asset: {
          assetId: asset.assetId,
          name: asset.name,
          assetRef: asset.assetRef,
          description: asset.description,
          category: asset.category,
          originalOwner: asset.originalOwner,
          currentCustodian: asset.currentCustodian,
          registeredAt: Number(asset.registeredAt),
          exists: asset.exists,
        },
        activeHandover: {
          assetId: activeHandover.assetId,
          fromCustodian: activeHandover.fromCustodian,
          toRecipient: activeHandover.toRecipient,
          condition: activeHandover.condition,
          note: activeHandover.note,
          createdAt: Number(activeHandover.createdAt),
          status: Number(activeHandover.status),
        },
        history: history.map((h) => ({
          fromCustodian: h.fromCustodian,
          toRecipient: h.toRecipient,
          status: Number(h.status),
          condition: h.condition,
          note: h.note,
          timestamp: Number(h.timestamp),
        })),
      };
    } catch (err) {
      console.error('Failed to get asset details for', assetId, err);
      return null;
    }
  };

  // Filtered lists
  const myCustodianAssets = allAssets.filter(
    (a) => address && a.currentCustodian.toLowerCase() === address.toLowerCase()
  );
  const myOriginalAssets = allAssets.filter(
    (a) => address && a.originalOwner.toLowerCase() === address.toLowerCase()
  );

  return (
    <AssetHandoverContext.Provider
      value={{
        address,
        isConnected,
        isCorrectNetwork,
        contractAddress,
        updateContractAddress,
        openAppKit: open,
        disconnectWallet: disconnect,
        switchToBotChain,
        allAssets,
        myCustodianAssets,
        myOriginalAssets,
        incomingHandovers,
        outgoingHandovers,
        loading,
        refreshAssets,
        registerAsset,
        initiateHandover,
        acceptHandover,
        rejectHandover,
        cancelHandover,
        getAssetFullDetails,
        txNotification,
        dismissNotification,
      }}
    >
      {children}
    </AssetHandoverContext.Provider>
  );
}

export function useAssetHandover() {
  const context = useContext(AssetHandoverContext);
  if (!context) {
    throw new Error('useAssetHandover must be used within an AssetHandoverProvider');
  }
  return context;
}

