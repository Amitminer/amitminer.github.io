import React, { Suspense, lazy } from 'react';
import './App.css';

const Header = lazy(() => import('./components/Header'));
const About = lazy(() => import('./components/About'));
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const GitHub = lazy(() => import('./components/GitHub'));
const Contact = lazy(() => import('./components/Contact'));
const Donate = lazy(() => import('./components/Donate'));

const App = () => {
  return (
    <div className="app-container">
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main className="container">
        <Suspense fallback={<div>Loading About...</div>}>
          <About />
        </Suspense>
        <Suspense fallback={<div>Loading Skills...</div>}>
          <Skills />
        </Suspense>
        <Suspense fallback={<div>Loading Projects...</div>}>
          <Projects />
        </Suspense>
        <Suspense fallback={<div>Loading GitHub...</div>}>
          <GitHub />
        </Suspense>
        <Suspense fallback={<div>Loading Contact...</div>}>
          <Contact />
        </Suspense>
        <Suspense fallback={<div>Loading Donate...</div>}>
          <Donate />
        </Suspense>
      </main>
    </div>
  );
};

export default App;
