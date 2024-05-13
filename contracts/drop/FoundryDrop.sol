// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title FoundryDrop
 *
 */

contract FoundryDrop is
    Initializable,
    UUPSUpgradeable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    string public baseURI;
    uint256 public price;
    uint256 public royaltiesPercentage;
    uint32 public maxSupply;
    uint8 public stage; // 1 => Guaranteed, 2 => PrivateSale, 3 => PublicSale
    string[] public cascadeUrls;
    bytes32 public guaranteedListMerkleRoot;
    bytes32 public whiteListMerkleRoot;

    mapping(address => uint256) public hasUserMintedAddress;

    event Minted(address indexed _to, uint256 _tokenId);
    event BaseURIChanged(string _uri);

    uint256 private nextTokenId;
    bool private initialized;

    modifier onlyValidToken(uint256 _tokenId) {
        require(_exists(_tokenId), "Invalid token id");
        _;
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        uint32 _maxSupply,
        uint256 _royaltiesPercentage,
        string memory _baseTokenURI
    ) public initializer {
        require(!initialized, "Already initialized");
        require(_royaltiesPercentage < 10000, "Invalid royalties");

        __ERC721_init(_name, _symbol);
        __Ownable_init();
        baseURI = _baseTokenURI;

        maxSupply = _maxSupply;
        royaltiesPercentage = _royaltiesPercentage;
        nextTokenId = 1;
        initialized = true;
        stage = 0;
    }

    function initCascadeUrls(string[] memory _cascadeUrls) public onlyOwner {
        require(_cascadeUrls.length == maxSupply, "Invalid cascade ids");

        cascadeUrls = _cascadeUrls;
    }

    function getCascadeUrl(uint256 _tokenId) public view returns (string memory) {
        require(_tokenId > 0 && _tokenId < maxSupply, "Invalid token Id");

        return cascadeUrls[_tokenId];
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function pre_mint(address pastelWallet, uint256 _quantity) external onlyOwner {
        require(stage == 0, "Can only pre-mint when minting is not started");

        for (uint256 i = 0; i < _quantity; i++) {
            require(nextTokenId < maxSupply + 1, "No available tokens");
            _safeMint(pastelWallet, nextTokenId);
            hasUserMintedAddress[pastelWallet]++;
            emit Minted(pastelWallet, nextTokenId);
            nextTokenId += 1;
        }
    }

    function verifyGuaranteed(address _address, bytes32[] calldata _proof) public view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(_address))));
        return MerkleProof.verify(_proof, guaranteedListMerkleRoot, leaf);
    }

    function verifyWhiteList(address _address, bytes32[] calldata _proof) public view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(_address))));
        return MerkleProof.verify(_proof, whiteListMerkleRoot, leaf);
    }

    function mint(bytes32[] calldata _proof) external payable nonReentrant {
        require(stage > 0, "Not started minting yet");

        if (stage == 1) {
            require(
                verifyGuaranteed(msg.sender, _proof),
                "You are not a guaranteed user, you are unable to mint during this stage"
            );
        } else if (stage == 2) {
            require(
                verifyGuaranteed(msg.sender, _proof) || verifyWhiteList(msg.sender, _proof),
                "You are not a FCFS or guaranteed user, you are unable to mint during this stage"
            );
        }
        require(hasUserMintedAddress[msg.sender] < 1, "You are not able to purchase those tokens");
        require(msg.value >= price, "Insufficient price");
        require(nextTokenId < maxSupply + 1, "No available tokens");

        _safeMint(msg.sender, nextTokenId);
        hasUserMintedAddress[msg.sender]++;
        emit Minted(msg.sender, nextTokenId);
        nextTokenId += 1;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setMaxSupply(uint8 _maxSupply) external onlyOwner {
        require(_maxSupply > nextTokenId, "Invalid maxSupply updating request");

        maxSupply = _maxSupply;
    }

    function setBaseURI(string calldata _uri) external onlyOwner {
        baseURI = _uri;

        emit BaseURIChanged(_uri);
    }

    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    function setStage(uint8 _stage, uint256 _price) external onlyOwner {
        require(_stage < 4 && _stage > 0 && _stage > stage, "Invalid stage");

        stage = _stage;
        price = _price;
    }

    function setGuaranteedMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        guaranteedListMerkleRoot = _merkleRoot;
    }

    function setWhiteListMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        whiteListMerkleRoot = _merkleRoot;
    }

    function totalBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function totalSupply() external view returns (uint256) {
        return nextTokenId - 1;
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address, uint256) {
        require(_exists(_tokenId), "Invalid token id");
        uint256 _royalties = (_salePrice * royaltiesPercentage) / 10000;
        return (owner(), _royalties);
    }
}
