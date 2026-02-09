import { FaCheckCircle, FaFile } from "react-icons/fa";
import { InfoBox } from "../MessageBoxes/MessageBoxes.jsx";
import { SampleButton, Textarea } from "../ImportModal.styles";

const sampleCSVData = `Date	Transaction Type	Asset	Quantity	Price per Unit (ZAR)	Total Value (ZAR)	Fees (ZAR)	Exchange / Wallet	Transaction ID	Notes
2024-01-15	Buy	BTC	0.01	850000	8500	50	Binance	TXN001	Initial BTC purchase
2024-02-02	Buy	ETH	0.5	45000	22500	120	Luno	TXN002	ETH accumulation
2024-03-10	Sell	BTC	0.005	920000	4600	40	Binance	TXN003	Partial BTC sell`;

export default function PasteDataTab({ pastedData, setPastedData }) {
  return (
    <>
      <InfoBox>
        <FaCheckCircle />
        <div>
          <strong>Paste your transaction data below:</strong>
          <br />
          <small>Include the header row. Use tabs or commas to separate columns.</small>
        </div>
      </InfoBox>

      <SampleButton onClick={() => setPastedData(sampleCSVData)}>
        <FaFile/> Use Sample Data
      </SampleButton>

      <label>Transaction Data (Tab or Comma Separated)</label>
      <Textarea
        value={pastedData}
        onChange={(e) => setPastedData(e.target.value)}
        placeholder={sampleCSVData}
      />
    </>
  );
}