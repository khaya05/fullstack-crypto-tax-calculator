import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import styled from "styled-components";

const InfoBoxContainer = styled.div`
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

const ErrorBoxContainer = styled.div`
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

export function InfoBox({ children }) {
  return (
    <InfoBoxContainer>
      {children}
    </InfoBoxContainer>
  );
}

export function ErrorBox({ errors }) {
  return (
    <ErrorBoxContainer>
      <FaExclamationTriangle />
      <div>
        <strong>Validation Errors:</strong>
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </div>
    </ErrorBoxContainer>
  );
}