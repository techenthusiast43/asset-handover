// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AssetHandover
 * @notice Physical Asset Custody Management Protocol for BOT Chain
 * @dev Enforces strict two-party custody handovers with immutable audit history.
 */
contract AssetHandover {
    enum HandoverStatus {
        None,
        Pending,
        Accepted,
        Rejected,
        Cancelled
    }

    struct Asset {
        bytes32 assetId;
        string name;
        string assetRef;       // Unique physical serial / barcode / tag identifier
        string description;    // Short description of physical asset
        string category;       // Category (e.g., IT Hardware, Machinery, Vehicles, Facilities)
        address originalOwner; // Creator / primary registrar (immutable)
        address currentCustodian; // Current holder of physical asset
        uint64 registeredAt;
        bool exists;
    }

    struct HandoverRequest {
        bytes32 assetId;
        address fromCustodian;
        address toRecipient;
        string condition;      // Condition upon transfer (e.g., Brand New, Good, Needs Repair)
        string note;           // Optional note or memo
        uint64 createdAt;
        HandoverStatus status;
    }

    struct HandoverHistoryItem {
        address fromCustodian;
        address toRecipient;
        HandoverStatus status;
        string condition;
        string note;
        uint64 timestamp;
    }

    // State Storage
    mapping(bytes32 => Asset) private _assets;
    mapping(bytes32 => bool) private _registeredAssetRefs;
    mapping(bytes32 => HandoverRequest) private _activeHandovers;
    mapping(bytes32 => HandoverHistoryItem[]) private _handoverHistories;

    bytes32[] private _allAssetIds;

    // Events
    event AssetRegistered(
        bytes32 indexed assetId,
        string name,
        string assetRef,
        string category,
        address indexed originalOwner,
        uint256 timestamp
    );

    event HandoverInitiated(
        bytes32 indexed assetId,
        address indexed fromCustodian,
        address indexed toRecipient,
        string condition,
        string note,
        uint256 timestamp
    );

    event HandoverAccepted(
        bytes32 indexed assetId,
        address indexed previousCustodian,
        address indexed newCustodian,
        uint256 timestamp
    );

    event HandoverRejected(
        bytes32 indexed assetId,
        address indexed custodian,
        address indexed recipient,
        string reason,
        uint256 timestamp
    );

    event HandoverCancelled(
        bytes32 indexed assetId,
        address indexed custodian,
        address indexed recipient,
        uint256 timestamp
    );

    // Custom Errors for Gas Optimization
    error EmptyName();
    error EmptyAssetRef();
    error AssetAlreadyExists();
    error AssetDoesNotExist();
    error NotCurrentCustodian();
    error CannotHandoverToSelf();
    error InvalidRecipient();
    error ActiveHandoverAlreadyExists();
    error NoPendingHandover();
    error NotDesignatedRecipient();
    error NotHandoverInitiator();

    /**
     * @notice Register a new physical asset on-chain.
     * @param name Name or title of the physical asset
     * @param assetRef Unique physical identifier (serial number, asset tag, etc.)
     * @param description Brief description of the asset
     * @param category Optional category classification
     * @return assetId Unique bytes32 ID generated for this asset
     */
    function registerAsset(
        string calldata name,
        string calldata assetRef,
        string calldata description,
        string calldata category
    ) external returns (bytes32 assetId) {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(assetRef).length == 0) revert EmptyAssetRef();

        bytes32 refHash = keccak256(abi.encodePacked(assetRef));
        if (_registeredAssetRefs[refHash]) revert AssetAlreadyExists();
        _registeredAssetRefs[refHash] = true;

        // Generate collision-resistant unique asset ID
        assetId = keccak256(
            abi.encodePacked(
                assetRef,
                msg.sender,
                block.timestamp,
                block.prevrandao,
                _allAssetIds.length
            )
        );

        _assets[assetId] = Asset({
            assetId: assetId,
            name: name,
            assetRef: assetRef,
            description: description,
            category: category,
            originalOwner: msg.sender,
            currentCustodian: msg.sender,
            registeredAt: uint64(block.timestamp),
            exists: true
        });

        _allAssetIds.push(assetId);

        emit AssetRegistered(
            assetId,
            name,
            assetRef,
            category,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Initiate a custody handover to an intended recipient.
     * @dev Only the current custodian may initiate a handover.
     */
    function initiateHandover(
        bytes32 assetId,
        address toRecipient,
        string calldata condition,
        string calldata note
    ) external {
        Asset storage asset = _assets[assetId];
        if (!asset.exists) revert AssetDoesNotExist();
        if (msg.sender != asset.currentCustodian) revert NotCurrentCustodian();
        if (toRecipient == address(0)) revert InvalidRecipient();
        if (toRecipient == msg.sender) revert CannotHandoverToSelf();

        HandoverRequest storage pending = _activeHandovers[assetId];
        if (pending.status == HandoverStatus.Pending) revert ActiveHandoverAlreadyExists();

        _activeHandovers[assetId] = HandoverRequest({
            assetId: assetId,
            fromCustodian: msg.sender,
            toRecipient: toRecipient,
            condition: condition,
            note: note,
            createdAt: uint64(block.timestamp),
            status: HandoverStatus.Pending
        });

        emit HandoverInitiated(
            assetId,
            msg.sender,
            toRecipient,
            condition,
            note,
            block.timestamp
        );
    }

    /**
     * @notice Designated recipient accepts physical custody of the asset.
     */
    function acceptHandover(bytes32 assetId) external {
        HandoverRequest storage request = _activeHandovers[assetId];
        if (request.status != HandoverStatus.Pending) revert NoPendingHandover();
        if (msg.sender != request.toRecipient) revert NotDesignatedRecipient();

        address previousCustodian = request.fromCustodian;

        // Update current custodian
        _assets[assetId].currentCustodian = msg.sender;

        // Record in historical timeline
        _handoverHistories[assetId].push(
            HandoverHistoryItem({
                fromCustodian: previousCustodian,
                toRecipient: msg.sender,
                status: HandoverStatus.Accepted,
                condition: request.condition,
                note: request.note,
                timestamp: uint64(block.timestamp)
            })
        );

        request.status = HandoverStatus.Accepted;

        emit HandoverAccepted(
            assetId,
            previousCustodian,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Designated recipient rejects custody of the asset.
     */
    function rejectHandover(bytes32 assetId, string calldata reason) external {
        HandoverRequest storage request = _activeHandovers[assetId];
        if (request.status != HandoverStatus.Pending) revert NoPendingHandover();
        if (msg.sender != request.toRecipient) revert NotDesignatedRecipient();

        address custodian = request.fromCustodian;
        string memory finalNote = request.note;
        if (bytes(reason).length > 0) {
            finalNote = reason;
        }

        // Record in historical timeline
        _handoverHistories[assetId].push(
            HandoverHistoryItem({
                fromCustodian: custodian,
                toRecipient: msg.sender,
                status: HandoverStatus.Rejected,
                condition: request.condition,
                note: finalNote,
                timestamp: uint64(block.timestamp)
            })
        );

        request.status = HandoverStatus.Rejected;

        emit HandoverRejected(
            assetId,
            custodian,
            msg.sender,
            finalNote,
            block.timestamp
        );
    }

    /**
     * @notice Current custodian cancels a pending handover before recipient acts.
     */
    function cancelHandover(bytes32 assetId) external {
        HandoverRequest storage request = _activeHandovers[assetId];
        if (request.status != HandoverStatus.Pending) revert NoPendingHandover();
        if (msg.sender != request.fromCustodian) revert NotHandoverInitiator();

        address recipient = request.toRecipient;

        // Record in historical timeline
        _handoverHistories[assetId].push(
            HandoverHistoryItem({
                fromCustodian: msg.sender,
                toRecipient: recipient,
                status: HandoverStatus.Cancelled,
                condition: request.condition,
                note: request.note,
                timestamp: uint64(block.timestamp)
            })
        );

        request.status = HandoverStatus.Cancelled;

        emit HandoverCancelled(
            assetId,
            msg.sender,
            recipient,
            block.timestamp
        );
    }

    // --- Read & Query Functions ---

    function getAsset(bytes32 assetId) external view returns (Asset memory) {
        Asset memory asset = _assets[assetId];
        if (!asset.exists) revert AssetDoesNotExist();
        return asset;
    }

    function isAssetRegistered(bytes32 assetId) external view returns (bool) {
        return _assets[assetId].exists;
    }

    function isAssetRefRegistered(string calldata assetRef) external view returns (bool) {
        return _registeredAssetRefs[keccak256(abi.encodePacked(assetRef))];
    }

    function getActiveHandover(bytes32 assetId) external view returns (HandoverRequest memory) {
        return _activeHandovers[assetId];
    }

    function getHandoverHistory(bytes32 assetId) external view returns (HandoverHistoryItem[] memory) {
        return _handoverHistories[assetId];
    }

    function getTotalAssetCount() external view returns (uint256) {
        return _allAssetIds.length;
    }

    function getAllAssetIds() external view returns (bytes32[] memory) {
        return _allAssetIds;
    }

    function getAllAssets() external view returns (Asset[] memory) {
        uint256 total = _allAssetIds.length;
        Asset[] memory list = new Asset[](total);
        for (uint256 i = 0; i < total; i++) {
            list[i] = _assets[_allAssetIds[i]];
        }
        return list;
    }

    function getAssetsByCustodian(address custodian) external view returns (Asset[] memory) {
        uint256 count = 0;
        uint256 total = _allAssetIds.length;
        for (uint256 i = 0; i < total; i++) {
            if (_assets[_allAssetIds[i]].currentCustodian == custodian) {
                count++;
            }
        }

        Asset[] memory result = new Asset[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            if (_assets[_allAssetIds[i]].currentCustodian == custodian) {
                result[idx] = _assets[_allAssetIds[i]];
                idx++;
            }
        }
        return result;
    }

    function getAssetsByOriginalOwner(address owner) external view returns (Asset[] memory) {
        uint256 count = 0;
        uint256 total = _allAssetIds.length;
        for (uint256 i = 0; i < total; i++) {
            if (_assets[_allAssetIds[i]].originalOwner == owner) {
                count++;
            }
        }

        Asset[] memory result = new Asset[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            if (_assets[_allAssetIds[i]].originalOwner == owner) {
                result[idx] = _assets[_allAssetIds[i]];
                idx++;
            }
        }
        return result;
    }

    function getIncomingPendingHandovers(address recipient) external view returns (HandoverRequest[] memory) {
        uint256 count = 0;
        uint256 total = _allAssetIds.length;
        for (uint256 i = 0; i < total; i++) {
            bytes32 id = _allAssetIds[i];
            if (
                _activeHandovers[id].status == HandoverStatus.Pending &&
                _activeHandovers[id].toRecipient == recipient
            ) {
                count++;
            }
        }

        HandoverRequest[] memory result = new HandoverRequest[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            bytes32 id = _allAssetIds[i];
            if (
                _activeHandovers[id].status == HandoverStatus.Pending &&
                _activeHandovers[id].toRecipient == recipient
            ) {
                result[idx] = _activeHandovers[id];
                idx++;
            }
        }
        return result;
    }

    function getOutgoingPendingHandovers(address custodian) external view returns (HandoverRequest[] memory) {
        uint256 count = 0;
        uint256 total = _allAssetIds.length;
        for (uint256 i = 0; i < total; i++) {
            bytes32 id = _allAssetIds[i];
            if (
                _activeHandovers[id].status == HandoverStatus.Pending &&
                _activeHandovers[id].fromCustodian == custodian
            ) {
                count++;
            }
        }

        HandoverRequest[] memory result = new HandoverRequest[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            bytes32 id = _allAssetIds[i];
            if (
                _activeHandovers[id].status == HandoverStatus.Pending &&
                _activeHandovers[id].fromCustodian == custodian
            ) {
                result[idx] = _activeHandovers[id];
                idx++;
            }
        }
        return result;
    }
}
