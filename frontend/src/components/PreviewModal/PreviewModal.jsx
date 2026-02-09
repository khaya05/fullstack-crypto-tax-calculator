import { 
  FaTimes, FaCheckCircle, FaExclamationTriangle, 
  FaArrowRight, FaExchangeAlt, FaShoppingCart, 
  FaMoneyBillWave, FaCoins
} from "react-icons/fa";
import { 
  Modal, Backdrop, Content, Header, Body, Footer, Primary, Close 
} from "../PreviewModal.styles";
import { isStablecoin } from "../../utils/cryptoUtils.js";

const getTypeIcon = (type) => {
  switch(type) {
    case 'Buy': return <FaShoppingCart />;
    case 'Sell': return <FaMoneyBillWave />;
    case 'Trade': return <FaExchangeAlt />;
    case 'Transfer': return <FaArrowRight />;
    default: return <FaCoins />;
  }
};

const getTypeColor = (type) => {
  switch(type) {
    case 'Buy': return '#10b981';
    case 'Sell': return '#ef4444';
    case 'Trade': return '#3b82f6';
    case 'Transfer': return '#8b5cf6';
    default: return '#6b7280';
  }
};

export default function PreviewModal({ isOpen, onClose, data, validationErrors }) {
  if (!isOpen) return null;

  const stats = {
    totalTransactions: data.length,
    totalAssets: [...new Set(data.map(r => r.Asset))].length,
    totalValue: data.reduce((sum, t) => sum + parseFloat(t.TotalValue || 0), 0),
    totalFees: data.reduce((sum, t) => sum + parseFloat(t.Fees || 0), 0),
    typeBreakdown: data.reduce((acc, t) => {
      acc[t.TransactionType] = (acc[t.TransactionType] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <Modal>
      <Backdrop onClick={onClose} />
      <Content onClick={(e) => e.stopPropagation()}>
        <Header>
          <div>
            <h2>Transaction Data Preview</h2>
            <p>Review your data before processing FIFO calculations</p>
          </div>
          <Close onClick={onClose}>
            <FaTimes />
          </Close>
        </Header>

        <Body>
          {/* Statistics Cards */}
          <StatsGrid>
            <StatCard>
              <StatIcon style={{ color: '#3b82f6' }}>
                <FaCoins />
              </StatIcon>
              <div>
                <StatValue>{stats.totalTransactions}</StatValue>
                <StatLabel>Transactions</StatLabel>
              </div>
            </StatCard>

            <StatCard>
              <StatIcon style={{ color: '#10b981' }}>
                <FaCoins />
              </StatIcon>
              <div>
                <StatValue>{stats.totalAssets}</StatValue>
                <StatLabel>Unique Assets</StatLabel>
              </div>
            </StatCard>

            <StatCard>
              <StatIcon style={{ color: '#f59e0b' }}>
                <FaMoneyBillWave />
              </StatIcon>
              <div>
                <StatValue>R{stats.totalValue.toLocaleString()}</StatValue>
                <StatLabel>Total Value</StatLabel>
              </div>
            </StatCard>

            <StatCard>
              <StatIcon style={{ color: '#ef4444' }}>
                <FaMoneyBillWave />
              </StatIcon>
              <div>
                <StatValue>R{stats.totalFees.toLocaleString()}</StatValue>
                <StatLabel>Total Fees</StatLabel>
              </div>
            </StatCard>
          </StatsGrid>

          {/* Transaction Type Breakdown */}
          <Section>
            <SectionTitle>Transaction Types</SectionTitle>
            <TypeBreakdown>
              {Object.entries(stats.typeBreakdown).map(([type, count]) => (
                <TypeItem key={type}>
                  <TypeIcon style={{ color: getTypeColor(type) }}>
                    {getTypeIcon(type)}
                  </TypeIcon>
                  <TypeInfo>
                    <TypeName>{type}</TypeName>
                    <TypeCount>{count} transactions</TypeCount>
                  </TypeInfo>
                </TypeItem>
              ))}
            </TypeBreakdown>
          </Section>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <ErrorSection>
              <ErrorHeader>
                <FaExclamationTriangle />
                <span>Validation Issues Found</span>
              </ErrorHeader>
              <ErrorList>
                {validationErrors.map((error, i) => (
                  <ErrorItem key={i}>{error}</ErrorItem>
                ))}
              </ErrorList>
            </ErrorSection>
          )}

          {/* Data Table */}
          <Section>
            <SectionTitle>Transaction Details (First 10 rows)</SectionTitle>
            <TableWrapper>
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
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      <td>{new Date(row.Date).toLocaleDateString()}</td>
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
            </TableWrapper>
            {data.length > 10 && (
              <MoreRowsIndicator>
                ... and {data.length - 10} more rows
              </MoreRowsIndicator>
            )}
          </Section>
        </Body>

        <Footer>
          <Primary onClick={onClose}>
            <FaCheckCircle /> Continue with this Data
          </Primary>
        </Footer>
      </Content>
    </Modal>
  );
}

// Styled components for PreviewModal
import styled from "styled-components";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-teal);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: var(--gray-900);
  font-size: 1.25rem;
`;

const TypeBreakdown = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TypeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border: 2px solid var(--gray-200);
`;

const TypeIcon = styled.div`
  font-size: 1.25rem;
`;

const TypeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TypeName = styled.div`
  font-weight: 600;
  color: var(--gray-900);
`;

const TypeCount = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
`;

const ErrorSection = styled.div`
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.125rem;
`;

const ErrorList = styled.ul`
  margin: 0;
  padding-left: 1.5rem;
  color: #dc2626;
`;

const ErrorItem = styled.li`
  margin-bottom: 0.5rem;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
  }

  th {
    background: var(--gray-100);
    font-weight: 600;
    color: var(--gray-700);
    white-space: nowrap;
  }

  tbody tr:hover {
    background: var(--gray-50);
  }

  td {
    white-space: nowrap;
  }
`;

const TypeBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => {
    switch(props.type) {
      case 'Buy': return '#dcfce7';
      case 'Sell': return '#fee2e2';
      case 'Trade': return '#dbeafe';
      case 'Transfer': return '#f3e8ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'Buy': return '#166534';
      case 'Sell': return '#dc2626';
      case 'Trade': return '#1d4ed8';
      case 'Transfer': return '#7c3aed';
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

const MoreRowsIndicator = styled.div`
  text-align: center;
  padding: 1rem;
  color: var(--gray-600);
  font-style: italic;
`;