import React from 'react';
import './App.css';

import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import GitHub from './components/GitHub';
import Contact from './components/Contact';
import Donate from './components/Donate';

const App = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="container">
        <About />
        <Skills />
        <Projects />
        <GitHub />
        <Contact />
        <Donate />
      </main>
    </div>
  );
};

export default App;
