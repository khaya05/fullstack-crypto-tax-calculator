import { useState } from "react";
import { 
  FaChartLine, FaCoins, FaCalculator, FaDownload, 
  FaExpand, FaCompress, FaFilter, FaCog,
  FaArrowUp, FaArrowDown, FaMinus, FaHome,
  FaChevronDown, FaChevronUp
} from "react-icons/fa";
import styled from "styled-components";
import { getTaxYear } from "../utils/taxCalculations.js";

export default function DataVisualization({ data, onBack }) {
  const [expandedTransactions, setExpandedTransactions] = useState(new Set());
  const [showAllCalculations, setShowAllCalculations] = useState(false);

  console.log('DataVisualization rendered with data:', {
    hasData: !!data,
    transactionCount: data?.originalTransactions?.length || 0,
    calculationCount: data?.calculations?.transactions?.length || 0,
    taxYears: data?.taxYears || []
  });

  if (!data) {
    return <Container>No data available</Container>;
  }

  const toggleTransaction = (index) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTransactions(newExpanded);
  };

  const toggleAllCalculations = () => {
    if (showAllCalculations) {
      setExpandedTransactions(new Set());
    } else {
      const transactions = data?.originalTransactions || [];
      setExpandedTransactions(new Set(transactions.map((_, i) => i)));
    }
    setShowAllCalculations(!showAllCalculations);
  };

  const getCapitalGainIcon = (gain) => {
    if (gain > 0) return <FaArrowUp style={{ color: '#10b981' }} />;
    if (gain < 0) return <FaArrowDown style={{ color: '#ef4444' }} />;
    return <FaMinus style={{ color: '#6b7280' }} />;
  };

  // Get all March 1st dates from baseCostsByDate
  const marchDates = Object.keys(data?.baseCostsByDate || {})
    .filter(date => {
      try {
        const d = new Date(date);
        return d.getMonth() === 2 && d.getDate() === 1;
      } catch {
        return false;
      }
    })
    .sort();
  
  const taxYears = data?.taxYears || [];
  const originalTransactions = data?.originalTransactions || [];
  const summary = data?.summary || { totalTransactions: 0, totalAssets: 0, totalFees: 0 };
  const capitalGains = data?.capitalGains || {};
  const capitalGainsByCoin = data?.capitalGainsByCoin || {};

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            <FaChartLine />
            Crypto Tax Calculator Results
          </Title>
          <Subtitle>SARS FIFO Calculation Report</Subtitle>
        </HeaderContent>
        <Actions>
          {onBack && (
            <ActionButton onClick={onBack}>
              <FaHome />
              Back to Home
            </ActionButton>
          )}
          <ActionButton onClick={toggleAllCalculations}>
            {showAllCalculations ? <FaCompress /> : <FaExpand />}
            {showAllCalculations ? 'Collapse All' : 'Expand All'}
          </ActionButton>
          <ActionButton primary>
            <FaDownload />
            Export Report
          </ActionButton>
        </Actions>
      </Header>

      {/* Summary Cards */}
      <SummaryGrid>
        <SummaryCard>
          <CardIcon style={{ color: '#3b82f6' }}>
            <FaCoins />
          </CardIcon>
          <CardContent>
            <CardValue>{summary.totalTransactions}</CardValue>
            <CardLabel>Total Transactions</CardLabel>
          </CardContent>
        </SummaryCard>

        <SummaryCard>
          <CardIcon style={{ color: '#10b981' }}>
            <FaCoins />
          </CardIcon>
          <CardContent>
            <CardValue>{summary.totalAssets}</CardValue>
            <CardLabel>Unique Assets</CardLabel>
          </CardContent>
        </SummaryCard>

        <SummaryCard>
          <CardIcon style={{ color: '#f59e0b' }}>
            <FaCalculator />
          </CardIcon>
          <CardContent>
            <CardValue>R{summary.totalFees.toLocaleString()}</CardValue>
            <CardLabel>Total Fees Paid</CardLabel>
          </CardContent>
        </SummaryCard>

        <SummaryCard>
          <CardIcon style={{ color: '#8b5cf6' }}>
            <FaChartLine />
          </CardIcon>
          <CardContent>
            <CardValue>R{(Object.values(capitalGains).reduce((sum, year) => sum + (year?.total || 0), 0)).toLocaleString()}</CardValue>
            <CardLabel>Total Capital Gains</CardLabel>
          </CardContent>
        </SummaryCard>
      </SummaryGrid>

      {/* Base Costs for every 1 March */}
      <Section>
        <SectionTitle>Base Cost Balances at 1 March (for each year in dataset)</SectionTitle>
        <BaseCostsSection>
          {marchDates.length > 0 ? (
            marchDates.map(marchDate => {
              const year = new Date(marchDate).getFullYear();
              const baseCosts = data?.baseCostsByDate?.[marchDate] || {};
              return (
                <BaseCostYearSection key={marchDate}>
                  <BaseCostYearTitle>1 March {year}</BaseCostYearTitle>
                  <BaseCostsGrid>
                    {Object.keys(baseCosts).length > 0 ? (
                      Object.entries(baseCosts).map(([asset, cost]) => (
                        <BaseCostCard key={asset}>
                          <AssetName>{asset}</AssetName>
                          <BaseCostValue>R{cost.toLocaleString()}</BaseCostValue>
                          <BaseCostLabel>Base Cost</BaseCostLabel>
                        </BaseCostCard>
                      ))
                    ) : (
                      <NoDataMessage>No base costs for this date</NoDataMessage>
                    )}
                  </BaseCostsGrid>
                </BaseCostYearSection>
              );
            })
          ) : (
            <NoDataMessage>No March 1st dates found in dataset</NoDataMessage>
          )}
        </BaseCostsSection>
      </Section>

      {/* Transactions with FIFO Calculations */}
      <Section>
        <SectionHeader>
          <SectionTitle>Transaction History with FIFO Calculations</SectionTitle>
          <FilterControls>
            <FilterButton>
              <FaFilter />
              Filter
            </FilterButton>
            <FilterButton>
              <FaCog />
              Settings
            </FilterButton>
          </FilterControls>
        </SectionHeader>

        <TransactionsList>
          {originalTransactions.map((transaction, index) => {
            const calc = data?.calculations?.transactions?.[index];
            const taxYear = getTaxYear(transaction.Date);
            return (
              <TransactionCard key={index}>
                <TransactionHeader onClick={() => toggleTransaction(index)}>
                  <TransactionBasic>
                    <TransactionDate>
                      {new Date(transaction.Date).toLocaleDateString('en-ZA')}
                    </TransactionDate>
                    <TransactionType type={transaction.TransactionType}>
                      {transaction.TransactionType}
                    </TransactionType>
                    <AssetInfo>
                      <AssetSymbol>{transaction.Asset}</AssetSymbol>
                      <AssetAmount>{parseFloat(transaction.Quantity).toLocaleString()} @ R{parseFloat(transaction.PricePerUnit || 0).toLocaleString()}</AssetAmount>
                    </AssetInfo>
                  </TransactionBasic>
                  
                  <TransactionSummary>
                    <TransactionValue>R{parseFloat(transaction.TotalValue || 0).toLocaleString()}</TransactionValue>
                    {calc?.capitalGain !== undefined && (
                      <CapitalGain gain={calc.capitalGain}>
                        {getCapitalGainIcon(calc.capitalGain)}
                        R{Math.abs(calc.capitalGain).toLocaleString()}
                      </CapitalGain>
                    )}
                    <ExpandIcon expanded={expandedTransactions.has(index)}>
                      {expandedTransactions.has(index) ? <FaChevronUp /> : <FaChevronDown />}
                    </ExpandIcon>
                  </TransactionSummary>
                </TransactionHeader>

                {expandedTransactions.has(index) && (
                  <TransactionDetails>
                    <DetailsGrid>
                      <DetailItem>
                        <DetailLabel>Transaction ID</DetailLabel>
                        <DetailValue>{transaction.TransactionID || 'N/A'}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Exchange/Wallet</DetailLabel>
                        <DetailValue>{transaction.ExchangeWallet}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Fees Paid</DetailLabel>
                        <DetailValue>R{parseFloat(transaction.Fees || 0).toLocaleString()}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Tax Year</DetailLabel>
                        <DetailValue>{taxYear} (Mar {taxYear-1} - Feb {taxYear})</DetailValue>
                      </DetailItem>
                    </DetailsGrid>

                    {transaction.Notes && (
                      <NotesSection>
                        <DetailLabel>Notes</DetailLabel>
                        <Notes>{transaction.Notes}</Notes>
                      </NotesSection>
                    )}

                    {calc && (
                      <FIFOCalculation>
                        <CalculationTitle>FIFO Calculation Details</CalculationTitle>
                        <CalculationContent>
                          {calc.fifoDetails?.map((detail, i) => (
                            <CalculationStep key={i}>
                              <StepDescription>{detail.description}</StepDescription>
                              <StepValue>{typeof detail.value === 'number' ? `R${detail.value.toLocaleString()}` : detail.value}</StepValue>
                            </CalculationStep>
                          ))}
                          {calc.capitalGain !== undefined && (
                            <CalculationStep>
                              <StepDescription><strong>Capital Gain/Loss</strong></StepDescription>
                              <StepValue style={{ 
                                color: calc.capitalGain >= 0 ? '#10b981' : '#ef4444',
                                fontWeight: 700
                              }}>
                                R{calc.capitalGain.toLocaleString()}
                              </StepValue>
                            </CalculationStep>
                          )}
                        </CalculationContent>
                        {calc.balancesAfter && Object.keys(calc.balancesAfter).length > 0 && (
                          <BalanceAfterSection>
                            <BalanceTitle>Balances After Transaction:</BalanceTitle>
                            {Object.entries(calc.balancesAfter).map(([coin, balances]) => (
                              <BalanceItem key={coin}>
                                <BalanceCoin>{coin}:</BalanceCoin>
                                <BalanceList>
                                  {balances.map((bal, i) => (
                                    <BalanceEntry key={i}>
                                      {bal.amount.toFixed(8)} @ R{bal.price.toLocaleString()} ({new Date(bal.date).toLocaleDateString()})
                                    </BalanceEntry>
                                  ))}
                                </BalanceList>
                              </BalanceItem>
                            ))}
                          </BalanceAfterSection>
                        )}
                      </FIFOCalculation>
                    )}
                  </TransactionDetails>
                )}
              </TransactionCard>
            );
          })}
        </TransactionsList>
      </Section>

      {/* Capital Gains Summary by Tax Year */}
      <Section>
        <SectionTitle>Capital Gains Summary by Tax Year</SectionTitle>
        <CapitalGainsTable>
          <table>
            <thead>
              <tr>
                <th>Tax Year</th>
                <th>Capital Gain/Loss (Total)</th>
                <th>Tax Implications</th>
              </tr>
            </thead>
            <tbody>
              {taxYears.map(year => {
                const total = capitalGains[year]?.total || 0;
                return (
                  <tr key={year}>
                    <td>{year} (Mar {year-1} - Feb {year})</td>
                    <td>
                      <CapitalGainCell gain={total}>
                        {getCapitalGainIcon(total)}
                        R{Math.abs(total).toLocaleString()}
                      </CapitalGainCell>
                    </td>
                    <td>
                      {total > 0 ? 
                        'Taxable gain' : 
                        total < 0 ? 'Allowable loss' : 'No gain/loss'
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CapitalGainsTable>
      </Section>

      {/* Capital Gains by Coin */}
      <Section>
        <SectionTitle>Capital Gains per Coin by Tax Year</SectionTitle>
        <CapitalGainsByCoinTable>
          <table>
            <thead>
              <tr>
                <th>Coin</th>
                {taxYears.map(year => (
                  <th key={year}>{year}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(capitalGainsByCoin).map(coin => {
                const totalForCoin = taxYears.reduce((sum, year) => 
                  sum + (capitalGainsByCoin[coin]?.[year] || 0), 0
                );
                return (
                  <tr key={coin}>
                    <td><strong>{coin}</strong></td>
                    {taxYears.map(year => {
                      const gain = capitalGainsByCoin[coin]?.[year] || 0;
                      return (
                        <td key={year}>
                          <CapitalGainCell gain={gain}>
                            {getCapitalGainIcon(gain)}
                            R{Math.abs(gain).toLocaleString()}
                          </CapitalGainCell>
                        </td>
                      );
                    })}
                    <td>
                      <CapitalGainCell gain={totalForCoin}>
                        {getCapitalGainIcon(totalForCoin)}
                        R{Math.abs(totalForCoin).toLocaleString()}
                      </CapitalGainCell>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CapitalGainsByCoinTable>
      </Section>
    </Container>
  );
}

// Styled components for DataVisualization
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--gray-50);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: var(--white);
  padding: 2rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--gray-600);
  font-size: 1.125rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? 
    'linear-gradient(135deg, var(--primary-teal) 0%, #059669 100%)' : 
    'var(--white)'};
  color: ${props => props.primary ? 'var(--white)' : 'var(--primary-teal)'};
  border: 2px solid var(--primary-teal);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    ${props => !props.primary && 'background: var(--primary-teal); color: var(--white);'}
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const SummaryCard = styled.div`
  background: var(--white);
  padding: 2rem;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: var(--shadow-lg);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
`;

const CardIcon = styled.div`
  font-size: 2.5rem;
`;

const CardContent = styled.div``;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1;
`;

const CardLabel = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-top: 0.5rem;
`;

const Section = styled.div`
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: var(--gray-900);
  font-size: 1.5rem;
`;

const FilterControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  background: var(--gray-100);
  color: var(--gray-700);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: var(--gray-200);
  }
`;

const BaseCostsSection = styled.div`
  margin-top: 1rem;
`;

const BaseCostYearSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border: 2px solid var(--gray-200);
`;

const BaseCostYearTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: var(--gray-900);
  font-size: 1.125rem;
  font-weight: 700;
`;

const BaseCostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const BaseCostCard = styled.div`
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
`;

const AssetName = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
`;

const BaseCostValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-teal);
  margin-bottom: 0.25rem;
`;

const BaseCostLabel = styled.div`
  font-size: 0.75rem;
  color: var(--gray-600);
`;

const NoDataMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--gray-500);
  font-style: italic;
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TransactionCard = styled.div`
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-teal);
  }
`;

const TransactionHeader = styled.div`
  background: var(--gray-50);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--gray-100);
  }
`;

const TransactionBasic = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const TransactionDate = styled.div`
  font-weight: 600;
  color: var(--gray-900);
  min-width: 100px;
`;

const TransactionType = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    switch(props.type?.toUpperCase()) {
      case 'BUY': return '#dcfce7';
      case 'SELL': return '#fee2e2';
      case 'TRADE': return '#dbeafe';
      case 'TRANSFER': return '#f3e8ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.type?.toUpperCase()) {
      case 'BUY': return '#166534';
      case 'SELL': return '#dc2626';
      case 'TRADE': return '#1d4ed8';
      case 'TRANSFER': return '#7c3aed';
      default: return '#374151';
    }
  }};
`;

const AssetInfo = styled.div``;

const AssetSymbol = styled.div`
  font-weight: 700;
  color: var(--gray-900);
`;

const AssetAmount = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
`;

const TransactionSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TransactionValue = styled.div`
  font-weight: 700;
  color: var(--gray-900);
  font-size: 1.125rem;
`;

const CapitalGain = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: ${props => props.gain >= 0 ? '#10b981' : '#ef4444'};
`;

const ExpandIcon = styled.div`
  transform: rotate(${props => props.expanded ? '180deg' : '0deg'});
  transition: transform 0.2s;
  color: var(--gray-400);
`;

const TransactionDetails = styled.div`
  padding: 2rem;
  background: var(--white);
  border-top: 1px solid var(--gray-200);
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div``;

const DetailLabel = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-weight: 600;
  color: var(--gray-900);
`;

const NotesSection = styled.div`
  margin-bottom: 1.5rem;
`;

const Notes = styled.div`
  background: var(--gray-50);
  padding: 1rem;
  border-radius: var(--radius-md);
  color: var(--gray-700);
  font-style: italic;
`;

const FIFOCalculation = styled.div`
  background: var(--primary-teal-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
`;

const CalculationTitle = styled.div`
  font-weight: 700;
  color: var(--primary-teal-dark);
  margin-bottom: 1rem;
`;

const CalculationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CalculationStep = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--white);
  border-radius: var(--radius-md);
`;

const StepDescription = styled.div`
  color: var(--gray-700);
`;

const StepValue = styled.div`
  font-weight: 600;
  color: var(--gray-900);
`;

const BalanceAfterSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--white);
`;

const BalanceTitle = styled.div`
  font-weight: 700;
  color: var(--primary-teal-dark);
  margin-bottom: 1rem;
`;

const BalanceItem = styled.div`
  margin-bottom: 1rem;
`;

const BalanceCoin = styled.div`
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
`;

const BalanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 1rem;
`;

const BalanceEntry = styled.div`
  font-size: 0.875rem;
  color: var(--gray-700);
  font-family: monospace;
`;

const CapitalGainsTable = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--gray-200);
    }

    th {
      background: var(--gray-100);
      font-weight: 600;
      color: var(--gray-700);
    }

    tbody tr:hover {
      background: var(--gray-50);
    }
  }
`;

const CapitalGainCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: ${props => props.gain >= 0 ? '#10b981' : '#ef4444'};
`;

const CapitalGainsByCoinTable = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--gray-200);
    }

    th {
      background: var(--gray-100);
      font-weight: 600;
      color: var(--gray-700);
    }

    tbody tr:hover {
      background: var(--gray-50);
    }
  }
`;
