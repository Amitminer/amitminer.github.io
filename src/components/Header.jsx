import React, { useState } from 'react';
import pfp from "../assets/pfp.webp";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <div className="container">
        <img src={pfp} alt="AmitxD Developer Profile Picture" className="profile-img" />
        <h1>AmitxD</h1>
        <p>Self-taught Developer.</p>
        <button className="menu-toggle" aria-label="Toggle menu" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#github">GitHub</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
