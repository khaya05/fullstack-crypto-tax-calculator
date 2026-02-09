import React from 'react';
import styled from 'styled-components';
import ImportButton from '../ImportButton/ImportButton.jsx';

const Hero = ({ onDataProcessed }) => {
  return (
    <Container>
      <div className='wrapper'>
        <div className='badge'>SARS Approved Calculator</div>
        <h1>Crypto Tax Calculator</h1>
        <p>
          Calculate your cryptocurrency capital gains tax using the South
          African Revenue Service approved First-In-First-Out method
        </p>
      </div>
      <ImportButton onDataProcessed={onDataProcessed} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(100vh - 174px);

  .badge {
    color: var(--primary-teal-dark);
    background-color: var(--primary-teal-light);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    margin-inline: auto;
    margin-top: 3rem;
    width: fit-content;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .wrapper {
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
    font-weight: 700;
    color: var(--gray-900);
    margin-block: 1rem;
    font-size: 2.5rem;
  }

  p {
    text-align: center;
    font-size: 1.125rem;
    max-width: 600px;
    color: var(--gray-600);
  }
`;

export default Hero;
