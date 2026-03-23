import { useState } from "react";
import { 
  FaChartLine, FaCoins, FaCalculator, FaDownload, 
  FaExpand, FaCompress, FaFilter, FaCog,
  FaArrowUp, FaArrowDown, FaMinus, FaHome,
  FaChevronDown, FaChevronUp, FaFileDownload,
  FaExclamationCircle
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

  // Calculate total tax owing across all years
  const totalCapitalGains = Object.values(data?.capitalGains || {}).reduce((sum, year) => sum + (year?.total || 0), 0);
  const annualExclusion = 40000;
  const inclusionRate = 0.40;
  
  // Calculate tax owing per year
  const taxOwingByYear = {};
  const taxYears = data?.taxYears || [];
  taxYears.forEach(year => {
    const yearGain = data?.capitalGains?.[year]?.total || 0;
    const netGain = Math.max(0, yearGain - annualExclusion);
    const taxableGain = netGain * inclusionRate;
    taxOwingByYear[year] = {
      capitalGain: yearGain,
      exclusion: Math.min(yearGain, annualExclusion),
      netGain,
      taxableGain
    };
  });

  const totalTaxOwing = Object.values(taxOwingByYear).reduce((sum, year) => sum + year.taxableGain, 0);
  const totalExclusionUsed = Object.values(taxOwingByYear).reduce((sum, year) => sum + year.exclusion, 0);

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
        <HeaderActions>
          {onBack && (
            <SecondaryButton onClick={onBack}>
              <FaHome />
              Back to Home
            </SecondaryButton>
          )}
          <PrimaryButton>
            <FaFileDownload />
            Export Report
          </PrimaryButton>
        </HeaderActions>
      </Header>

      {/* Tax Owing Highlight */}
      <TaxOwingSection>
        <TaxOwingCard>
          <TaxOwingHeader>
            <TaxOwingIcon>
              <FaCalculator />
            </TaxOwingIcon>
            <div>
              <TaxOwingLabel>Total Taxable Capital Gain</TaxOwingLabel>
              <TaxOwingSubtitle>Add this amount to your taxable income on SARS return</TaxOwingSubtitle>
            </div>
          </TaxOwingHeader>
          <TaxOwingAmount>R{totalTaxOwing.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TaxOwingAmount>
          <TaxOwingBreakdown>
            <BreakdownItem>
              <BreakdownLabel>Total Capital Gains</BreakdownLabel>
              <BreakdownValue positive={totalCapitalGains >= 0}>
                R{totalCapitalGains.toLocaleString()}
              </BreakdownValue>
            </BreakdownItem>
            <BreakdownItem>
              <BreakdownLabel>Annual Exclusions Used</BreakdownLabel>
              <BreakdownValue>-R{totalExclusionUsed.toLocaleString()}</BreakdownValue>
            </BreakdownItem>
            <BreakdownItem>
              <BreakdownLabel>Inclusion Rate (40%)</BreakdownLabel>
              <BreakdownValue>×0.40</BreakdownValue>
            </BreakdownItem>
          </TaxOwingBreakdown>
          <TaxOwingNote>
            <FaExclamationCircle />
            SARS will calculate your final tax based on your total income and tax bracket
          </TaxOwingNote>
        </TaxOwingCard>

        {/* Summary Cards */}
        <SummaryGrid>
          <SummaryCard>
            <CardIcon style={{ color: '#3b82f6' }}>
              <FaCoins />
            </CardIcon>
            <CardContent>
              <CardValue>{summary.totalTransactions}</CardValue>
              <CardLabel>Transactions</CardLabel>
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
              <CardLabel>Total Fees</CardLabel>
            </CardContent>
          </SummaryCard>

          <SummaryCard>
            <CardIcon style={{ color: '#8b5cf6' }}>
              <FaChartLine />
            </CardIcon>
            <CardContent>
              <CardValue>{taxYears.length}</CardValue>
              <CardLabel>Tax Years</CardLabel>
            </CardContent>
          </SummaryCard>
        </SummaryGrid>
      </TaxOwingSection>

      {/* Tax Year Breakdown */}
      <Section>
        <SectionTitle>Tax Breakdown by Year</SectionTitle>
        <TaxYearGrid>
          {taxYears.map(year => {
            const yearTax = taxOwingByYear[year];
            return (
              <TaxYearCard key={year}>
                <TaxYearHeader>
                  <TaxYearName>Tax Year {year}</TaxYearName>
                  <TaxYearPeriod>Mar {year-1} - Feb {year}</TaxYearPeriod>
                </TaxYearHeader>
                <TaxYearStats>
                  <TaxYearStat>
                    <StatLabel>Capital Gain</StatLabel>
                    <StatValue positive={yearTax.capitalGain >= 0}>
                      R{yearTax.capitalGain.toLocaleString()}
                    </StatValue>
                  </TaxYearStat>
                  <TaxYearStat>
                    <StatLabel>Exclusion</StatLabel>
                    <StatValue>-R{yearTax.exclusion.toLocaleString()}</StatValue>
                  </TaxYearStat>
                  <TaxYearStat>
                    <StatLabel>Net Gain</StatLabel>
                    <StatValue>R{yearTax.netGain.toLocaleString()}</StatValue>
                  </TaxYearStat>
                  <TaxYearStat highlight>
                    <StatLabel>Taxable (40%)</StatLabel>
                    <StatValue highlight>R{yearTax.taxableGain.toLocaleString()}</StatValue>
                  </TaxYearStat>
                </TaxYearStats>
              </TaxYearCard>
            );
          })}
        </TaxYearGrid>
      </Section>

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
            <FilterButton onClick={toggleAllCalculations}>
              {showAllCalculations ? <FaCompress /> : <FaExpand />}
              {showAllCalculations ? 'Collapse All' : 'Expand All'}
            </FilterButton>
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

// Styled components
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
  box-shadow: var(--shadow-md);
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

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const SecondaryButton = styled.button`
  background: var(--white);
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: var(--gray-100);
    border-color: var(--gray-400);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, var(--primary-teal) 0%, #059669 100%);
  color: var(--white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-md);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const TaxOwingSection = styled.div`
  margin-bottom: 3rem;
`;

const TaxOwingCard = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 3px solid #f59e0b;
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.2);
`;

const TaxOwingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const TaxOwingIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f59e0b;
  color: var(--white);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: var(--shadow-md);
`;

const TaxOwingLabel = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #92400e;
`;

const TaxOwingSubtitle = styled.div`
  font-size: 0.875rem;
  color: #b45309;
  margin-top: 0.25rem;
`;

const TaxOwingAmount = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  color: #92400e;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1;
`;

const TaxOwingBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const BreakdownItem = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: var(--radius-md);
  text-align: center;
`;

const BreakdownLabel = styled.div`
  font-size: 0.875rem;
  color: #78350f;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const BreakdownValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.positive ? '#059669' : props.positive === false ? '#dc2626' : '#92400e'};
`;

const TaxOwingNote = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  color: #78350f;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 2px solid #fbbf24;

  svg {
    color: #f59e0b;
    font-size: 1.25rem;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const SummaryCard = styled.div`
  background: var(--white);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-md);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const CardIcon = styled.div`
  font-size: 2rem;
`;

const CardContent = styled.div``;

const CardValue = styled.div`
  font-size: 1.75rem;
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
  box-shadow: var(--shadow-md);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem 0;
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
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: var(--gray-200);
    transform: translateY(-1px);
  }
`;

const TaxYearGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const TaxYearCard = styled.div`
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-teal);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const TaxYearHeader = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-200);
`;

const TaxYearName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
`;

const TaxYearPeriod = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-top: 0.25rem;
`;

const TaxYearStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaxYearStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.highlight ? '1rem' : '0.5rem'};
  background: ${props => props.highlight ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'transparent'};
  border-radius: ${props => props.highlight ? 'var(--radius-md)' : '0'};
  border: ${props => props.highlight ? '2px solid #f59e0b' : 'none'};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--gray-700);
  font-weight: 600;
`;

const StatValue = styled.div`
  font-size: ${props => props.highlight ? '1.5rem' : '1.125rem'};
  font-weight: 700;
  color: ${props => props.highlight ? '#92400e' : props.positive ? '#059669' : props.positive === false ? '#dc2626' : 'var(--gray-900)'};
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