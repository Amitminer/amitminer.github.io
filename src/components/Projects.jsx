 
import React, { useEffect, useState } from 'react';
import '../styles/Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchGitHubProjects() {
      const username = "Amitminer";
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
      const data = await response.json();
      setProjects(data);
    }

    fetchGitHubProjects();
  }, []);

  return (
    <section id="projects">
      <h2>Projects</h2>
      <div className="projects-grid" id="projects-container">
        {projects.map((project) => (
          <div className="project-card" key={project.id}>
            <img src={`https://opengraph.githubassets.com/1/${project.full_name}`} alt={project.name} className="project-img" />
            <div className="project-info">
              <h3 className="project-title">{project.name}</h3>
              <p className="project-description">{project.description || "No description available."}</p>
              <a href={project.html_url} className="project-link" target="_blank" rel="noopener noreferrer">
                View Project
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
