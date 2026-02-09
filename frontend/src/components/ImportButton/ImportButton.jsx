import { useState } from 'react';
import React from 'react'
import { FaDownload } from 'react-icons/fa';
import styled from 'styled-components';
import ImportModal from '../Modal/Modal.jsx';

const ImportButton = ({ onDataProcessed }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleDataProcessed = (data) => {
    if (onDataProcessed) {
      onDataProcessed(data);
    }
    setIsOpen(false);
  };

  return (
    <Container className='import-section'>
      <button className='btn-import-large' onClick={() => setIsOpen(true)}>
        <div className='import-icon'>
          <FaDownload />
        </div>
        <div>
          <div className='import-title'>Import Transaction Data</div>
          <div className='import-subtitle'>
            Upload files, paste data, or connect wallets to get started
          </div>
        </div>
      </button>
      <ImportModal isOpen={isOpen} onClose={() => setIsOpen(false)} onDataProcessed={handleDataProcessed} />
    </Container>
  );
};

const Container = styled.div`
  margin-top: 2rem;

  .btn-import-large {
    width: 100%;
    background: linear-gradient(
      135deg,
      var(--primary-teal) 0%,
      var(--primary-teal-dark) 100%
    );
    border: none;
    border-radius: var(--radius-xl);
    padding: 1.5rem 1rem;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 2rem;
    color: white;
  }

  .btn-import-large:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }

  .import-icon {
    font-size: 3rem;
    background: rgba(255, 255, 255, 0.2);
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .import-title {
    font-size: 1.75rem;
    font-weight: 700;
    text-align: left;
    margin-bottom: 0.5rem;
  }

  .import-subtitle {
    font-size: 1rem;
    opacity: 0.9;
    text-align: left;
  }
`;

export default ImportButton