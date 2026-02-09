import React, { useState } from 'react';
import styled from 'styled-components';
import NavBar from './components/NavBar/NavBar.jsx';
import Hero from './components/Hero/Hero.jsx';
import Footer from './components/Footer/Footer.jsx';
import DataVisualization from './pages/DataVisualization.jsx';

function App() {
  const [calculationData, setCalculationData] = useState(null);

  const handleDataProcessed = (data) => {
    console.log('App received data:', data);
    if (data && data.originalTransactions && data.originalTransactions.length > 0) {
      setCalculationData(data);
    } else {
      console.error('Invalid data received:', data);
    }
  };

  const handleBack = () => {
    setCalculationData(null);
  };

  try {
    if (calculationData) {
      return (
        <Container>
          <NavBar />
          <DataVisualization data={calculationData} onBack={handleBack} />
          <Footer />
        </Container>
      );
    }

    return (
      <Container>
        <NavBar />
        <Hero onDataProcessed={handleDataProcessed} />
        <Footer />
      </Container>
    );
  } catch (error) {
    console.error('App error:', error);
    return (
      <Container>
        <ErrorDisplay>
          <h1>Error loading application</h1>
          <p>{error.message}</p>
          <pre>{error.stack}</pre>
        </ErrorDisplay>
      </Container>
    );
  }
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ErrorDisplay = styled.div`
  padding: 2rem;
  color: red;
  background: #fee;
  margin: 2rem;
  border-radius: 8px;
  
  pre {
    background: #fff;
    padding: 1rem;
    border-radius: 4px;
    overflow: auto;
  }
`;

export default App;
