import styled, { keyframes } from "styled-components";

// Animations
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Main Modal Components
export const Modal = styled.div`
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
  animation: ${fadeIn} 0.2s ease-out;
`;

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  height: 100vh;
`;

export const Content = styled.div`
  background: #fff;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.25s ease-out;
  z-index: 2;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

export const Header = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--primary-teal-light) 0%, var(--gray-50) 100%);

  h2 {
    margin: 0 0 0.5rem 0;
    color: var(--gray-900);
    font-size: 1.75rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: var(--gray-600);
    font-size: 0.875rem;
  }
`;

export const Close = styled.button`
  background: var(--white);
  border: 2px solid var(--gray-300);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--gray-600);
  font-size: 1.5rem;
  font-weight: 300;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--error);
    color: var(--error);
    background: #fee2e2;
    transform: scale(1.1);
  }
`;

export const Body = styled.div`
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
`;

// Tab Components
export const Tabs = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 3px solid #e5e7eb;
  background: var(--gray-50);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
`;

export const Tab = styled.button`
  flex: 1;
  border: none;
  background: none;
  padding: 1.25rem 1.5rem;
  margin: 0;
  border-bottom: ${({ active }) => (active ? "var(--primary-teal)" : "transparent")} 4px solid;
  color: ${({ active }) => (active ? "var(--primary-teal)" : "var(--gray-600)")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    color: var(--primary-teal);
    background: var(--primary-teal-light);
  }

  &:first-child {
    border-radius: var(--radius-lg) 0 0 0;
  }

  &:last-child {
    border-radius: 0 var(--radius-lg) 0 0;
  }

  ${({ active }) => active && `
    background: var(--white);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-teal);
      border-radius: 2px 2px 0 0;
    }
  `}
`;

// Button Components
export const Primary = styled.button`
  background: linear-gradient(135deg, var(--accent-coral) 0%, #ff5252 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-lg);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
    
    &::after {
      content: '';
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid var(--gray-500);
      border-radius: 50%;
      animation: ${spin} 1s linear infinite;
      margin-left: 0.5rem;
    }
  }

  svg {
    font-size: 1.125rem;
  }
`;

export const Secondary = styled.button`
  background: var(--white);
  color: var(--primary-teal);
  border: 2px solid var(--primary-teal);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-teal);
    color: var(--white);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const PreviewButton = styled.button`
  background: var(--white);
  color: var(--primary-teal);
  border: 2px solid var(--primary-teal);
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-lg);
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
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  svg {
    font-size: 1rem;
  }
`;

export const SampleButton = styled.button`
  background: var(--primary-teal-light);
  color: var(--primary-teal-dark);
  border: 2px solid var(--primary-teal);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: var(--primary-teal);
    color: var(--white);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

// Footer Component
export const Footer = styled.div`
  padding: 1.5rem 2rem;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gray-50);
  
  > div:last-child {
    display: flex;
    gap: 1rem;
  }
`;

// File Upload Components
export const FileFormats = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  gap: 0.75rem;
`;

export const FileFormat = styled.div`
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: 20px;
  padding: 0.75rem 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-teal);
    background: var(--primary-teal-light);
    color: var(--primary-teal-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  svg {
    font-size: 1.125rem;
  }
`;

export const UploadZone = styled.div`
  border: 3px dashed var(--gray-300);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  background: var(--gray-50);
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;

  &:hover,
  &.drag-over {
    border-color: var(--primary-teal);
    background: var(--primary-teal-light);
    transform: scale(1.02);
    box-shadow: var(--shadow-lg);
  }

  strong {
    display: block;
    font-size: 1.125rem;
    color: var(--gray-900);
    margin-bottom: 0.5rem;
  }

  span {
    color: var(--gray-600);
    font-size: 0.875rem;
  }
`;

export const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--gray-400);
  transition: all 0.2s;

  ${UploadZone}:hover & {
    color: var(--primary-teal);
    transform: scale(1.1);
  }
`;

// List Components
export const FileList = styled.ul`
  margin-top: 1.5rem;
  list-style-type: none;
  padding: 0;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const FileItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  background: var(--white);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-teal);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }

  > div:first-child {
    display: flex;
    align-items: center;
    gap: 1rem;

    svg {
      color: var(--primary-teal);
      font-size: 1.25rem;
    }
  }

  > div:last-child {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

export const WalletItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  background: var(--white);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-teal);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }

  small {
    color: var(--gray-500);
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.75rem;
    word-break: break-all;
  }
`;

export const FileStatus = styled.div`
  font-weight: 600;
  color: var(--success);
  font-size: 0.875rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: var(--gray-400);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  &:hover {
    color: var(--error);
    background: #fee2e2;
    transform: scale(1.1);
  }
`;

// Form Components
export const Textarea = styled.textarea`
  width: 100%;
  min-height: 220px;
  margin-top: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 2px solid var(--gray-200);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.2s;
  background: var(--white);

  &:focus {
    outline: none;
    border-color: var(--primary-teal);
    box-shadow: 0 0 0 4px var(--primary-teal-light);
  }

  &::placeholder {
    color: var(--gray-400);
    line-height: 1.6;
  }
`;

export const WalletNameInput = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: var(--gray-700);
    font-size: 0.875rem;
  }

  input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
    transition: all 0.2s;
    background: var(--white);

    &:focus {
      outline: none;
      border-color: var(--primary-teal);
      box-shadow: 0 0 0 4px var(--primary-teal-light);
    }

    &::placeholder {
      color: var(--gray-400);
    }
  }
`;

// Blockchain Components
export const BlockchainTiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const BlockchainTile = styled.div`
  background: var(--white);
  border: 3px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: 2rem 1rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-teal);
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  ${({ selected }) =>
    selected &&
    `
    border-color: var(--primary-teal);
    background: var(--primary-teal-light);
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);

    &::after {
      content: "✓";
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: var(--primary-teal);
      color: var(--white);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 700;
      animation: ${fadeIn} 0.3s ease-out;
    }
  `}
`;

export const BlockchainLogo = styled.div`
  font-size: 3rem;
  margin-bottom: 0.75rem;
  color: var(--gray-600);
  transition: all 0.2s;

  ${BlockchainTile}:hover & {
    transform: scale(1.1);
  }
`;

export const BlockchainName = styled.div`
  font-weight: 600;
  color: var(--gray-900);
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

export const BlockchainSymbol = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 600;
  text-transform: uppercase;
`;

export const AddressRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;

  input {
    flex: 1;
    padding: 1rem;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
    font-family: 'Monaco', 'Courier New', monospace;
    transition: all 0.2s;
    background: var(--white);

    &:focus {
      outline: none;
      border-color: var(--primary-teal);
      box-shadow: 0 0 0 4px var(--primary-teal-light);
    }

    &:disabled {
      background: var(--gray-100);
      cursor: not-allowed;
      color: var(--gray-500);
    }

    &::placeholder {
      color: var(--gray-400);
    }
  }

  button {
    background: var(--primary-teal);
    color: var(--white);
    border: none;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-lg);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;

    &:hover:not(:disabled) {
      background: var(--primary-teal-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
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

// Message Box Components
export const InfoBox = styled.div`
  background: var(--primary-teal-light);
  border-left: 4px solid var(--primary-teal);
  padding: 1.25rem 1.75rem;
  border-radius: var(--radius-lg);
  color: var(--gray-700);
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  svg {
    color: var(--primary-teal);
    margin-top: 0.2rem;
    font-size: 1.25rem;
  }

  strong {
    color: var(--gray-900);
  }

  small {
    color: var(--gray-600);
    display: block;
    margin-top: 0.5rem;
  }
`;

export const ErrorBox = styled.div`
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 1.25rem 1.75rem;
  border-radius: var(--radius-lg);
  color: #dc2626;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  svg {
    font-size: 1.25rem;
    margin-top: 0.2rem;
  }

  ul {
    margin: 0.75rem 0 0 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  strong {
    color: #991b1b;
  }
`;

// Preview Components
export const PreviewSection = styled.div`
  margin-top: 2rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

export const PreviewHeader = styled.div`
  background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-50) 100%);
  padding: 1.25rem 1.75rem;
  border-bottom: 2px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: var(--gray-900);
    font-size: 1.25rem;
  }

  div {
    color: var(--gray-600);
    font-size: 0.875rem;
  }
`;

export const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
  }

  th {
    background: var(--gray-50);
    font-weight: 600;
    color: var(--gray-700);
    white-space: nowrap;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  tbody tr {
    transition: all 0.2s;
    
    &:hover {
      background: var(--primary-teal-light);
    }
  }

  td {
    white-space: nowrap;
    color: var(--gray-900);
  }
`;

export const TypeBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
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

  svg {
    font-size: 0.875rem;
  }
`;

export const CoinBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => props.stable ? '#fef3c7' : '#e0e7ff'};
  color: ${props => props.stable ? '#92400e' : '#3730a3'};
  border: 2px solid ${props => props.stable ? '#f59e0b' : '#6366f1'};
`;

// Responsive Design
export const ResponsiveGrid = styled.div`
  display: grid;
  gap: 1rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

// Loading States
export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Utility Components
export const Divider = styled.hr`
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--gray-200), transparent);
  margin: 2rem 0;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
`;