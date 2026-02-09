import { useEffect, useState } from "react";
import { FaCalculator, FaEye, FaUpload, FaPaste, FaLink, FaTimes } from "react-icons/fa";
import { 
  Modal, Backdrop, Content, Header, Close, Body, Footer, 
  Secondary, Primary, Tabs, Tab 
} from "../ImportModal.styles";
import { InfoBox, ErrorBox } from "../MessageBoxes/MessageBoxes";
import FileUploadTab from "../FileUploadTab/FileUploadTab";
import PasteDataTab from "../PasteDataTab/PasteDataTab";
import WalletConnectTab from "../WalletConnectTab/WalletConnectTab";
import DataPreview from "../DataPreview/DataPreview";
import { parseCSVData, validateTransactionData } from "../../utils/dataProcessing.js";
import { getUniqueTaxYears } from "../../utils/taxCalculations.js";
import { calculateFIFO } from "../../utils/fifoCalculations.js";

const TABS = {
  FILE: "file",
  PASTE: "paste",
  WALLET: "wallet",
};

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
    setValidationErrors([]);
    
    if (activeTab === TABS.FILE && files.length > 0) {
      try {
        data = await processFileData(files[0]);
      } catch (error) {
        setValidationErrors(['Failed to process file: ' + error.message]);
        return;
      }
    } else if (activeTab === TABS.PASTE && pastedData.trim()) {
      data = parseCSVData(pastedData);
    } else if (activeTab === TABS.WALLET && walletAddresses.length > 0) {
      data = await fetchBlockchainData();
    }
    
    if (data.length > 0) {
      const errors = validateTransactionData(data);
      setValidationErrors(errors);
      setPreviewData(data.slice(0, 10));
      setShowPreview(true);
    }
  };

  // Simulate blockchain data fetching
  const fetchBlockchainData = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return walletAddresses.map((wallet, index) => ({
      Date: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      TransactionType: 'Buy',
      Asset: wallet.blockchain === 'Bitcoin' ? 'BTC' : wallet.blockchain === 'Ethereum' ? 'ETH' : 'SOL',
      Quantity: '0.1',
      PricePerUnit: '500000',
      TotalValue: '50000',
      Fees: '250',
      ExchangeWallet: wallet.name,
      TransactionID: `AUTO-${Date.now()}-${index}`,
      Notes: `Auto-imported from ${wallet.blockchain} blockchain`,
      Address: wallet.address
    }));
  };

  // Process and calculate
  const handleProcessAndCalculate = async () => {
    setIsProcessing(true);
    
    try {
      let allData = [];
      
      if (activeTab === TABS.FILE) {
        for (const file of files) {
          const fileData = await processFileData(file);
          allData = [...allData, ...fileData];
        }
      } else if (activeTab === TABS.PASTE) {
        allData = parseCSVData(pastedData);
      } else if (activeTab === TABS.WALLET) {
        allData = await fetchBlockchainData();
      }
      
      const errors = validateTransactionData(allData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsProcessing(false);
        return;
      }
      
      allData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      // Perform FIFO calculations client-side
      console.log('Starting FIFO calculation with', allData.length, 'transactions');
      let fifoResults;
      try {
        fifoResults = calculateFIFO(allData);
        console.log('FIFO calculation completed:', fifoResults);
      } catch (calcError) {
        console.error('FIFO calculation error:', calcError);
        throw new Error('FIFO calculation failed: ' + calcError.message);
      }
      
      // Format base costs for display (group by tax year's March 1st)
      const baseCostsByTaxYear = {};
      Object.keys(fifoResults.baseCostsByDate).forEach(dateKey => {
        const date = new Date(dateKey);
        const taxYear = date.getMonth() === 2 ? date.getFullYear() : date.getFullYear() - 1;
        if (!baseCostsByTaxYear[taxYear]) {
          baseCostsByTaxYear[taxYear] = {};
        }
        Object.assign(baseCostsByTaxYear[taxYear], fifoResults.baseCostsByDate[dateKey]);
      });
      
      // Format capital gains for display
      const capitalGainsFormatted = {};
      fifoResults.taxYears.forEach(year => {
        const yearData = fifoResults.capitalGainsByYear[year] || { total: 0 };
        capitalGainsFormatted[year] = {
          total: yearData.total,
          byCoin: {}
        };
        
        Object.keys(fifoResults.capitalGainsByCoin).forEach(coin => {
          if (fifoResults.capitalGainsByCoin[coin][year]) {
            capitalGainsFormatted[year].byCoin[coin] = fifoResults.capitalGainsByCoin[coin][year];
          }
        });
      });
      
      // Ensure calculations array matches originalTransactions array
      // Create a map by transaction index for quick lookup
      const calculationsMap = {};
      fifoResults.transactionCalculations.forEach(calc => {
        calculationsMap[calc.transactionIndex] = {
          capitalGain: calc.capitalGain || 0,
          proceeds: calc.proceeds || 0,
          baseCost: calc.baseCost || 0,
          fifoDetails: calc.fifoDetails || [],
          balancesAfter: calc.balancesAfter || {}
        };
      });
      
      // Create calculations array in the same order as originalTransactions
      const calculationsArray = allData.map((_, index) => calculationsMap[index] || {
        capitalGain: 0,
        proceeds: 0,
        baseCost: 0,
        fifoDetails: [],
        balancesAfter: {}
      });
      
      const processedData = {
        originalTransactions: allData,
        calculations: {
          transactions: calculationsArray
        },
        taxYears: fifoResults.taxYears || [],
        baseCosts: baseCostsByTaxYear,
        baseCostsByDate: fifoResults.baseCostsByDate || {},
        capitalGains: capitalGainsFormatted,
        capitalGainsByCoin: fifoResults.capitalGainsByCoin || {},
        capitalGainsByYear: fifoResults.capitalGainsByYear || {},
        summary: {
          totalTransactions: allData.length,
          totalAssets: [...new Set(allData.map(t => t.Asset))].length,
          totalFees: allData.reduce((sum, t) => sum + parseFloat(t.Fees || 0), 0),
          dateRange: {
            from: allData[0]?.Date,
            to: allData[allData.length - 1]?.Date
          }
        }
      };
      
      console.log('Calling onDataProcessed with:', {
        transactionCount: processedData.originalTransactions.length,
        calculationCount: processedData.calculations.transactions.length,
        taxYears: processedData.taxYears,
        hasBaseCosts: !!processedData.baseCostsByDate
      });
      
      if (onDataProcessed) {
        onDataProcessed(processedData);
      } else {
        console.error('onDataProcessed callback is not defined!');
      }
      
      onClose();
      
    } catch (error) {
      console.error('Processing error:', error);
      setValidationErrors(['Processing failed: ' + error.message]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const canProcess = (files.length > 0 || pastedData.trim().length > 0 || walletAddresses.length > 0) 
                    && validationErrors.length === 0;

  return (
    <Modal>
      <Backdrop onClick={onClose} />
      <Content onClick={(e) => e.stopPropagation()}>
        <Header>
          <div>
            <h2>Import Your Crypto Transaction Data</h2>
            <p>SARS-compliant FIFO calculation for South African tax returns</p>
          </div>
          <Close onClick={onClose}>
            <FaTimes />
          </Close>
        </Header>

        <Body>
          <Tabs>
            {Object.values(TABS).map((tab) => (
              <Tab
                key={tab}
                active={activeTab === tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowPreview(false);
                  setValidationErrors([]);
                }}
              >
                {tab === "file" && (
                  <>
                    <FaUpload style={{ marginRight: "0.5rem" }} />
                    Upload File
                  </>
                )}
                {tab === "paste" && (
                  <>
                    <FaPaste style={{ marginRight: "0.5rem" }} />
                    Paste Data
                  </>
                )}
                {tab === "wallet" && (
                  <>
                    <FaLink style={{ marginRight: "0.5rem" }} />
                    Connect Wallet
                  </>
                )}
              </Tab>
            ))}
          </Tabs>

          {activeTab === TABS.FILE && (
            <FileUploadTab 
              files={files}
              setFiles={setFiles}
              setShowPreview={setShowPreview}
            />
          )}

          {activeTab === TABS.PASTE && (
            <PasteDataTab 
              pastedData={pastedData}
              setPastedData={setPastedData}
            />
          )}

          {activeTab === TABS.WALLET && (
            <WalletConnectTab
              walletName={walletName}
              setWalletName={setWalletName}
              selectedBlockchain={selectedBlockchain}
              setSelectedBlockchain={setSelectedBlockchain}
              walletInput={walletInput}
              setWalletInput={setWalletInput}
              walletAddresses={walletAddresses}
              setWalletAddresses={setWalletAddresses}
            />
          )}

          {validationErrors.length > 0 && (
            <ErrorBox errors={validationErrors} />
          )}

          {showPreview && previewData.length > 0 && (
            <DataPreview data={previewData} />
          )}
        </Body>

        <Footer>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(files.length > 0 || pastedData.trim().length > 0 || walletAddresses.length > 0) && (
              <button onClick={generatePreview}>
                <FaEye /> Preview Data
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Secondary onClick={onClose}>Cancel</Secondary>
            <Primary 
              disabled={!canProcess || isProcessing} 
              onClick={handleProcessAndCalculate}
            >
              {isProcessing ? (
                <>Processing FIFO...</>
              ) : (
                <>
                  <FaCalculator /> Calculate Capital Gains
                </>
              )}
            </Primary>
          </div>
        </Footer>
      </Content>
    </Modal>
  );
}