import { FaBitcoin, FaEthereum, FaCheckCircle, FaTimes } from "react-icons/fa";
import { SiPolygon, SiSolana } from "react-icons/si";
import { InfoBox } from "../MessageBoxes/MessageBoxes.jsx";
import {
  WalletNameInput, BlockchainTiles, BlockchainTile, BlockchainLogo,
  BlockchainName, BlockchainSymbol, AddressRow, FileList, WalletItem, RemoveButton
} from "../ImportModal.styles";

const blockchainIcons = {
  Bitcoin: <FaBitcoin />,
  Ethereum: <FaEthereum />,
  Polygon: <SiPolygon />,
  Solana: <SiSolana />,
};

export default function WalletConnectTab({
  walletName,
  setWalletName,
  selectedBlockchain,
  setSelectedBlockchain,
  walletInput,
  setWalletInput,
  walletAddresses,
  setWalletAddresses
}) {
  const addWalletAddress = () => {
    if (!walletInput || !selectedBlockchain) return;
    setWalletAddresses(prev => [...prev, { 
      blockchain: selectedBlockchain, 
      address: walletInput.trim(),
      name: walletName || 'Main'
    }]);
    setWalletInput("");
  };

  const handleRemoveWallet = (index) => {
    setWalletAddresses(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <InfoBox>
        <FaCheckCircle />
        <div>
          <strong>Connect wallet addresses to auto-import transactions.</strong>
          <br />
          <small>We'll fetch your transaction history directly from the blockchain.</small>
        </div>
      </InfoBox>

      <WalletNameInput>
        <label>Wallet Name:</label>
        <input
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
          placeholder="e.g., Main, Hardware, Binance"
        />
      </WalletNameInput>

      <BlockchainTiles>
        {["Bitcoin", "Ethereum", "Polygon", "Solana"].map((chain) => (
          <BlockchainTile
            key={chain}
            selected={selectedBlockchain === chain}
            onClick={() => setSelectedBlockchain(chain)}
          >
            <BlockchainLogo>{blockchainIcons[chain]}</BlockchainLogo>
            <BlockchainName>{chain}</BlockchainName>
            <BlockchainSymbol>
              {chain === "Bitcoin" ? "BTC" : chain === "Ethereum" ? "ETH" : 
               chain === "Polygon" ? "MATIC" : "SOL"}
            </BlockchainSymbol>
          </BlockchainTile>
        ))}
      </BlockchainTiles>

      <AddressRow>
        <input
          disabled={!selectedBlockchain}
          value={walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
          placeholder="Enter wallet address"
        />
        <button 
          disabled={!walletInput.trim() || !selectedBlockchain} 
          onClick={addWalletAddress}
        >
          + Add Address
        </button>
      </AddressRow>

      {walletAddresses.length > 0 && (
        <FileList as="ul">
          {walletAddresses.map((w, i) => (
            <WalletItem key={i}>
              <div>
                <strong>{w.name}</strong> ({w.blockchain})
                <br />
                <small>{w.address}</small>
              </div>
              <RemoveButton onClick={() => handleRemoveWallet(i)}>
                <FaTimes />
              </RemoveButton>
            </WalletItem>
          ))}
        </FileList>
      )}
    </>
  );
}