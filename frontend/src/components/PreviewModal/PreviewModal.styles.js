import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const Modal = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1001;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
`;

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
`;

export const Content = styled.div`
  background: #fff;
  max-width: 1400px;
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
  border-bottom: 2px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--primary-teal-light) 0%, var(--gray-50) 100%);

  h2 {
    margin: 0 0 0.5rem 0;
    color: var(--gray-900);
    font-size: 1.5rem;
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
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--error);
    color: var(--error);
    transform: scale(1.1);
  }
`;

export const Body = styled.div`
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
`;

export const Footer = styled.div`
  padding: 1.5rem 2rem;
  border-top: 2px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  background: var(--gray-50);
`;

export const Primary = styled.button`
  background: linear-gradient(135deg, var(--primary-teal) 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-lg);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  &:active {
    transform: translateY(0);
  }
`;