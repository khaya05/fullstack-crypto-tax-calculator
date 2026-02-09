import { FaArrowRight, FaExchangeAlt, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { 
  PreviewSection, PreviewHeader, PreviewTable, 
  TypeBadge, CoinBadge 
} from "../ImportModal.styles";
import { isStablecoin } from "../../utils/cryptoUtils";

const getTypeIcon = (type) => {
  switch(type) {
    case 'Buy': 
      return <FaArrowDown style={{ fontSize: '0.8rem', color: '#10b981' }} />;
    case 'Sell': 
      return <FaArrowUp style={{ fontSize: '0.8rem', color: '#ef4444' }} />;
    case 'Trade': return <FaExchangeAlt style={{ fontSize: '0.8rem' }} />;
    case 'Transfer': return <FaArrowRight style={{ fontSize: '0.8rem' }} />;
    default: return '';
  }
};

export default function DataPreview({ data }) {
  return (
    <PreviewSection>
      <PreviewHeader>
        <h3>Data Preview</h3>
        <div>
          <small>Showing {data.length} rows | </small>
          <small>{[...new Set(data.map(r => r.Asset))].length} unique assets</small>
        </div>
      </PreviewHeader>
      <PreviewTable>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Asset</th>
            <th>Quantity</th>
            <th>Price/Unit</th>
            <th>Total Value</th>
            <th>Fees</th>
            <th>Exchange</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.Date}</td>
              <td>
                <TypeBadge type={row.TransactionType}>
                  {getTypeIcon(row.TransactionType)}
                  {row.TransactionType}
                </TypeBadge>
              </td>
              <td>
                <CoinBadge stable={isStablecoin(row.Asset)}>
                  {row.Asset}
                </CoinBadge>
              </td>
              <td>{parseFloat(row.Quantity).toLocaleString()}</td>
              <td>R{parseFloat(row.PricePerUnit || 0).toLocaleString()}</td>
              <td>R{parseFloat(row.TotalValue || 0).toLocaleString()}</td>
              <td>R{parseFloat(row.Fees || 0).toLocaleString()}</td>
              <td>{row.ExchangeWallet}</td>
            </tr>
          ))}
        </tbody>
      </PreviewTable>
    </PreviewSection>
  );
}
