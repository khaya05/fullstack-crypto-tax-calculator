import Logo from '../Logo/Logo.jsx';
import styled from 'styled-components';

const NavBar = () => {
  return (
    <NavContainer>
      <header>
        <Logo />
        <NavLinks>
          <NavLik href='#'>Help</NavLik>
          <NavLik href='#'>Login</NavLik>
        </NavLinks>
      </header>
    </NavContainer>
  );
};

const NavContainer = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  background: var(--white);

  header {
    padding: 1rem 0;
    align-items: center;
    justify-content: space-between;
    display: flex;
    margin-inline: auto;
    max-width: 1200px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

const NavLik = styled.a`
  text-decoration: none;
  color: var(--gray-700);
  font-weight: 500;

  &:hover {
    cursor: pointer;
    color: var(--primary-teal);
  }
`;

export default NavBar;
