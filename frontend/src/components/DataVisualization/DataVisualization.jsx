import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  FaPaste,
  FaFile,
  FaLink,
  FaUpload,
  FaBitcoin,
  FaEthereum,
  FaCalculator,
  FaFileCsv,
  FaFileExcel,
  FaFileAlt,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaWallet,
  FaTimes,
} from "react-icons/fa";
import { SiPolygon, SiSolana } from "react-icons/si";

const TABS = {
  FILE: "file",
  PASTE: "paste",
  WALLET: "wallet",
};

const TRANSACTION_TYPES = ['BUY', 'SELL', 'TRADE'];
const STABLECOINS = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'PAX'];

const blockchainIcons = {
  Bitcoin: <FaBitcoin />,
  Ethereum: <FaEthereum />,
  Polygon: <SiPolygon />,
  Solana: <SiSolana />,
};

const fileFormats = [
  { name: "CSV", icon: <FaFileCsv /> },
  { name: "Excel", icon: <FaFileExcel /> },
  { name: "Text", icon: <FaFileAlt /> },
];

// Tax year helper function (March 1 - Feb 28/29)
const getTaxYear = (date) => {
  const transactionDate = new Date(date);
  const year = transactionDate.getFullYear();
  const month = transactionDate.getMonth();
  return month >= 2 ? year + 1 : year; // March = 2 (0-indexed)
};

const isStablecoin = (coin) => STABLECOINS.includes(coin?.toUpperCase());

export default function ImportModal({ isOpen, onClose, onDataProcessed }) {
  const [activeTab, setActiveTab] = useState(TABS.FILE);
  const [files, setFiles] = useState([]);
  const [pastedData, setPastedData] = useState("");
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [selectedBlockchain, setSelectedBlockchain] = useState(null);
  const [walletInput, setWalletInput] = useState("");
  const [walletName, setWalletName] = useState("Main");
  
  // Validation and processing states
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedTransactions, setProcessedTransactions] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Parse CSV data
  const parseCSVData = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['Date', 'Type', 'Coin', 'Quantity', 'Price', 'Fee', 'Wallet'];
    
    // Validate headers
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      setValidationErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
      return [];
    }

    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      // Add default wallet if missing
      if (!row.Wallet) row.Wallet = 'Main';
      
      return { ...row, rowIndex: index + 2 };
    });

    return data;
  };

  // Validate transaction data
  const validateTransactionData = (data) => {
    const errors = [];
    
    data.forEach((transaction, index) => {
      const rowNum = transaction.rowIndex || index + 1;
      
      // Validate date
      if (!transaction.Date || isNaN(Date.parse(transaction.Date))) {
        errors.push(`Row ${rowNum}: Invalid or missing date`);
      }
      
      // Validate transaction type
      if (!TRANSACTION_TYPES.includes(transaction.Type?.toUpperCase())) {
        errors.push(`Row ${rowNum}: Invalid transaction type. Must be BUY, SELL, or TRADE`);
      }
      
      // Validate coin
      if (!transaction.Coin || transaction.Coin.length < 2) {
        errors.push(`Row ${rowNum}: Invalid or missing coin symbol`);
      }
      
      // Validate quantity
      const quantity = parseFloat(transaction.Quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Row ${rowNum}: Invalid quantity. Must be a positive number`);
      }
      
      // Validate price
      const price = parseFloat(transaction.Price);
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${rowNum}: Invalid price. Must be a positive number`);
      }
      
      // Validate fee (optional but must be valid if provided)
      if (transaction.Fee && transaction.Fee !== '') {
        const fee = parseFloat(transaction.Fee);
        if (isNaN(fee) || fee < 0) {
          errors.push(`Row ${rowNum}: Invalid fee. Must be a positive number or empty`);
        }
      }
    });
    
    return errors;
  };

  // Process file data
  const processFileData = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = parseCSVData(e.target.result);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Handle preview generation
  const generatePreview = async () => {
    let data = [];
    
    if (activeTab === TABS.FILE && files.length > 0) {
      // Process first file for preview
      try {
        data = await processFileData(files[0]);
      } catch (error) {
        setValidationErrors(['Failed to process file: ' + error.message]);
        return;
      }
    } else if (activeTab === TABS.PASTE && pastedData.trim()) {
      data = parseCSVData(pastedData);
    } else if (activeTab === TABS.WALLET && walletAddresses.length > 0) {
      // For wallet connections, show placeholder data
      data = [{
        Date: new Date().toISOString().split('T')[0],
        Type: 'IMPORT',
        Coin: 'Various',
        Quantity: 'Auto-fetched',
        Price: 'Market rate',
        Fee: 'Auto-calculated',
        Wallet: walletAddresses[0].blockchain,
        rowIndex: 1
      }];
    }
    
    if (data.length > 0) {
      const errors = validateTransactionData(data);
      setValidationErrors(errors);
      setPreviewData(data.slice(0, 5)); // Show first 5 rows
      setShowPreview(true);
    }
  };

  // Process and calculate
  const handleProcessAndCalculate = async () => {
    setIsProcessing(true);
    
    try {
      let allData = [];
      
      if (activeTab === TABS.FILE) {
        // Process all files
        for (const file of files) {
          const fileData = await processFileData(file);
          allData = [...allData, ...fileData];
        }
      } else if (activeTab === TABS.PASTE) {
        allData = parseCSVData(pastedData);
      } else if (activeTab === TABS.WALLET) {
        // Simulate blockchain data fetching
        allData = await fetchBlockchainData();
      }
      
      // Final validation
      const errors = validateTransactionData(allData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsProcessing(false);
        return;
      }
      
      // Sort by date
      allData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      // Send to backend for FIFO calculations
      const response = await fetch('/api/calculate-crypto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: allData,
          wallets: walletAddresses,
          taxYearStart: 'March'
        })
      });
      
      if (!response.ok) {
        throw new Error('Calculation failed');
      }
      
      const calculationResults = await response.json();
      setProcessedTransactions(allData);
      
      // Pass results to parent component for visualization
      onDataProcessed({
        transactions: allData,
        calculations: calculationResults,
        taxYears: getUniqueTaxYears(allData),
        baseCosts: calculationResults.baseCosts,
        capitalGains: calculationResults.capitalGains
      });
      
      onClose();
      
    } catch (error) {
      console.error('Processing error:', error);
      setValidationErrors(['Processing failed: ' + error.message]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate blockchain data fetching
  const fetchBlockchainData = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock data - in real implementation, this would fetch from blockchain APIs
    return walletAddresses.map((wallet, index) => ({
      Date: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      Type: 'BUY',
      Coin: wallet.blockchain === 'Bitcoin' ? 'BTC' : wallet.blockchain === 'Ethereum' ? 'ETH' : 'SOL',
      Quantity: '0.1',
      Price: '50000',
      Fee: '25',
      Wallet: wallet.blockchain,
      Address: wallet.address
    }));
  };

  // Get unique tax years from data
  const getUniqueTaxYears = (data) => {
    const years = data.map(t => getTaxYear(t.Date));
    return [...new Set(years)].sort();
  };

  if (!isOpen) return null;

  const canProcess = (files.length > 0 || pastedData.trim().length > 0 || walletAddresses.length > 0) 
                    && validationErrors.length === 0;

  const addWalletAddress = () => {
    if (!walletInput || !selectedBlockchain) return;
    setWalletAddresses(prev => [...prev, { 
      blockchain: selectedBlockchain, 
      address: walletInput.trim(),
      name: walletName || 'Main'
    }]);
    setWalletInput("");
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setShowPreview(false);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    setShowPreview(false);
  };

  const handleRemoveWallet = (index) => {
    setWalletAddresses(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal>
      <Backdrop onClick={onClose} />
      <Content onClick={(e) => e.stopPropagation()}>
        <Header>
          <div>
            <h2>Import Your Crypto Transaction Data</h2>
            <p>Calculate capital gains using SARS-compliant FIFO method</p>
          </div>
          <Close onClick={onClose}>
            <FaTimes />
          </Close>
        </Header>

        <Body>
          <Tabs>
            {Object.values(TABS).map((tab) => (
              <Tab key={tab} active={activeTab === tab} onClick={() => {
                setActiveTab(tab);
                setShowPreview(false);
                setValidationErrors([]);
              }}>
                {tab === "file" && (
                  <>
                    <div style={{ fontSize: "1.2rem", paddingRight: "0.5rem" }}>
                      <FaFile />
                    </div>
                    Upload File
                  </>
                )}
                {tab === "paste" && (
                  <>
                    <div style={{ fontSize: "1.2rem", paddingRight: "0.5rem" }}>
                      <FaPaste />
                    </div>
                    Paste Data
                  </>
                )}
                {tab === "wallet" && (
                  <>
                    <div style={{ fontSize: "1.2rem", paddingRight: "0.5rem" }}>
                      <FaWallet />
                    </div>
                    Connect Wallet
                  </>
                )}
              </Tab>
            ))}
          </Tabs>

          {activeTab === TABS.FILE && (
            <>
              <InfoBox>
                <FaCheckCircle />
                <div>
                  <strong>Required Format:</strong> Date, Type, Coin, Quantity, Price, Fee, Wallet
                  <br />
                  <small>Types: BUY, SELL, TRADE | Prices in ZAR | Dates: YYYY-MM-DD</small>
                </div>
              </InfoBox>

              <label>Supported Formats:</label>
              <FileFormats>
                {fileFormats.map((format) => (
                  <FileFormat key={format.name}>
                    {format.icon}
                    {format.name}
                  </FileFormat>
                ))}
              </FileFormats>

              <input
                type="file"
                hidden
                multiple
                accept=".csv,.xlsx,.xls,.txt"
                id="file-input"
                onChange={handleFileChange}
              />
              <UploadZone onClick={() => document.getElementById("file-input").click()}>
                <UploadIcon>
                  <FaUpload />
                </UploadIcon>
                <strong>Drag & drop your transaction files</strong>
                <span>or click to browse (CSV, Excel, Text)</span>
              </UploadZone>

              {files.length > 0 && (
                <FileList>
                  {files.map((f, i) => (
                    <FileItem key={i}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <FaFile />
                        <div>
                          <p style={{ margin: 0, fontWeight: 600 }}>{f.name}</p>
                          <small style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
                            {(f.size / 1024).toFixed(2)} KB
                          </small>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FileStatus ready>
                          <FaCheckCircle style={{ marginRight: "0.25rem" }} />
                          Ready
                        </FileStatus>
                        <RemoveButton onClick={() => handleRemoveFile(i)}>
                          <FaTimes />
                        </RemoveButton>
                      </div>
                    </FileItem>
                  ))}
                </FileList>
              )}
            </>
          )}

          {activeTab === TABS.PASTE && (
            <>
              <InfoBox>
                <FaCheckCircle />
                <div>
                  <strong>Paste your CSV data below:</strong>
                  <br />
                  <small>Include headers: Date,Type,Coin,Quantity,Price,Fee,Wallet</small>
                </div>
              </InfoBox>

              <label>Transaction Data (CSV Format)</label>
              <Textarea
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                placeholder="Date,Type,Coin,Quantity,Price,Fee,Wallet
2024-11-01,BUY,BTC,0.1,800000,100,Main
2024-11-02,BUY,BTC,0.2,900000,150,Main
2025-05-03,BUY,BTC,0.3,1000000,200,Main
2025-05-05,TRADE,BTC,0.133,1500000,75,Main"
              />
            </>
          )}

          {activeTab === TABS.WALLET && (
            <>
              <InfoBox>
                <FaCheckCircle />
                <div>
                  <strong>Connect wallet addresses to auto-import transactions.</strong>
                  <br />
                  <small>We'll fetch your transaction history from the blockchain.</small>
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
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <ErrorBox>
              <FaExclamationTriangle />
              <div>
                <strong>Validation Errors:</strong>
                <ul>
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </ErrorBox>
          )}

          {/* Preview Section */}
          {showPreview && previewData.length > 0 && (
            <PreviewSection>
              <PreviewHeader>
                <h3>Data Preview</h3>
                <small>Showing first {previewData.length} rows</small>
              </PreviewHeader>
              <PreviewTable>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Coin</th>
                    <th>Quantity</th>
                    <th>Price (ZAR)</th>
                    <th>Fee</th>
                    <th>Wallet</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i}>
                      <td>{row.Date}</td>
                      <td>
                        <TypeBadge type={row.Type}>
                          {row.Type}
                        </TypeBadge>
                      </td>
                      <td>
                        <CoinBadge stable={isStablecoin(row.Coin)}>
                          {row.Coin}
                        </CoinBadge>
                      </td>
                      <td>{row.Quantity}</td>
                      <td>R{parseFloat(row.Price || 0).toLocaleString()}</td>
                      <td>R{parseFloat(row.Fee || 0).toLocaleString()}</td>
                      <td>{row.Wallet}</td>
                    </tr>
                  ))}
                </tbody>
              </PreviewTable>
            </PreviewSection>
          )}
        </Body>

        <Footer>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(files.length > 0 || pastedData.trim().length > 0 || walletAddresses.length > 0) && (
              <PreviewButton onClick={generatePreview}>
                <FaEye /> Preview Data
              </PreviewButton>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Secondary onClick={onClose}>Cancel</Secondary>
            <Primary 
              disabled={!canProcess || isProcessing} 
              onClick={handleProcessAndCalculate}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <FaCalculator /> Calculate FIFO & Capital Gains
                </>
              )}
            </Primary>
          </div>
        </Footer>
      </Content>
    </Modal>
  );
}

// Additional styled components
const InfoBox = styled.div`
  background: var(--primary-teal-light);
  border-left: 4px solid var(--primary-teal);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  color: var(--gray-700);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  svg {
    color: var(--primary-teal);
    margin-top: 0.2rem;
  }
`;

const ErrorBox = styled.div`
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  color: #dc2626;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.25rem;
  }
`;

const WalletNameInput = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-md);
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: var(--primary-teal);
    }
  }
`;

const PreviewSection = styled.div`
  margin-top: 1.5rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  background: var(--gray-100);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: var(--gray-800);
  }

  small {
    color: var(--gray-600);
  }
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
    font-size: 0.875rem;
  }

  th {
    background: var(--gray-50);
    font-weight: 600;
    color: var(--gray-700);
  }

  tbody tr:hover {
    background: var(--gray-50);
  }
`;

const TypeBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch(props.type) {
      case 'BUY': return '#dcfce7';
      case 'SELL': return '#fee2e2';
      case 'TRADE': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'BUY': return '#166534';
      case 'SELL': return '#dc2626';
      case 'TRADE': return '#1d4ed8';
      default: return '#374151';
    }
  }};
`;

const CoinBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.stable ? '#fef3c7' : '#e0e7ff'};
  color: ${props => props.stable ? '#92400e' : '#3730a3'};
`;

const PreviewButton = styled.button`
  background: var(--white);
  color: var(--primary-teal);
  border: 2px solid var(--primary-teal);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-teal);
    color: var(--white);
  }
`;

// Keep all your existing styled components below...
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Modal = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  height: 100vh;
`;

const Content = styled.div`
  background: #fff;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.25s ease-out;
  z-index: 2;
`;

const Header = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  h2 {
    margin: 0 0 0.5rem 0;
    color: var(--gray-900);
  }

  p {
    margin: 0;
    color: var(--gray-600);
    font-size: 0.875rem;
  }
`;

const Close = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--gray-500);
  padding: 0.5rem;
  
  &:hover {
    color: var(--gray-800);
  }
`;

const Body = styled.div`
  padding: 1.5rem 2rem;
  overflow-y: auto;
  flex: 1;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
`;

const Tab = styled.button`
  flex: 1;
  border: none;
  background: none;
  padding: 1rem;
  margin: 0rem;
  border-bottom: ${({ active }) => (active ? "var(--primary-teal)" : "#ff262600")} 3px solid;
  color: ${({ active }) => (active ? "var(--primary-teal)" : "var(--gray-600)")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    color: var(--primary-teal);
    background: var(--gray-50);
  }
`;

const UploadZone = styled.div`
  border: 3px dashed var(--gray-300);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background: var(--gray-50);
  transition: all 0.2s ease;

  &:hover,
  .drag-over {
    border-color: var(--primary-teal);
    background: var(--primary-teal-light);
    transform: scale(1.01);
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--gray-400);
`;

const FileList = styled.ul`
  margin-top: 1rem;
  list-style-type: none;
  padding: 0;
  font-size: 0.875rem;
`;

const FileItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  background: var(--gray-50);
`;

const WalletItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  background: var(--gray-50);

  small {
    color: var(--gray-500);
    font-family: monospace;
  }
`;

const FileStatus = styled.div`
  font-weight: 600;
  color: var(--success);
  font-size: 0.875rem;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: var(--gray-400);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;

  &:hover {
    color: var(--error);
    background: var(--gray-100);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 180px;
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 2px solid var(--gray-200);
  font-family: monospace;
  font-size: 0.875rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary-teal);
    box-shadow: 0 0 0 3px var(--primary-teal-light);
  }
`;

const BlockchainTiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const BlockchainTile = styled.div`
  background: var(--white);
  border: 3px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-teal);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  ${({ selected }) =>
    selected &&
    `
    border-color: var(--primary-teal);
    background: var(--primary-teal-light);
    box-shadow: var(--shadow-md);

    &::after {
      content: "✓";
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: var(--primary-teal);
      color: var(--white);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 700;
    }
  `}
`;

const BlockchainLogo = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--gray-600);
`;

const BlockchainName = styled.div`
  font-weight: 600;
  color: var(--gray-900);
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
`;

const BlockchainSymbol = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 600;
`;

const AddressRow = styled.div`
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    padding: 0.875rem 1rem;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
    font-family: "Monaco", "Courier New", monospace;
    transition: all 0.2s;
    background: var(--gray-50);

    &:focus {
      outline: none;
      border-color: var(--primary-teal);
      background: var(--white);
      box-shadow: 0 0 0 3px var(--primary-teal-light);
    }

    &:disabled {
      background: var(--gray-100);
      cursor: not-allowed;
    }
  }

  button {
    background: var(--primary-teal);
    color: var(--white);
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: var(--radius-lg);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      background: var(--primary-teal-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    &:disabled {
      background: var(--gray-300);
      color: var(--gray-500);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
  }
`;

const FileFormats = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const FileFormat = styled.div`
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-teal);
    background: var(--primary-teal-light);
    color: var(--primary-teal-dark);
  }
`;

const Footer = styled.div`
  padding: 1rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Secondary = styled.button`
  background: var(--white);
  color: var(--primary-teal);
  border: 2px solid var(--primary-teal);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-teal);
    color: var(--white);
  }
`;

const Primary = styled.button`
  background: linear-gradient(135deg, var(--accent-coral) 0%, #ff5252 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-md);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: var(--gray-300);
    color: var(--gray-500);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;