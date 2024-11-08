import React, { useEffect, useState } from 'react';
import '../styles/Skills.css';

const skillsData = [
  { name: "C++", level: 65, color: 'blue' },
  { name: "Rust", level: 20, color: 'darker-blue' },
  { name: "Python", level: 85, color: 'blue' },
  { name: "PHP", level: 85, color: 'darker-blue' },
  { name: "HTML/CSS", level: 75, color: 'blue' }
];

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setSkills(skillsData);
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <div className="skills-container">
      <h2 className="skills-title">Skills</h2>
      <div className="skills-list">
        {skills.map((skill, index) => (
          <div key={index} className="skill-item">
            <div className="skill-header">
              <span className="skill-name">{skill.name}</span>
              <span className="skill-percentage">{skill.level}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${skill.color}`}
                style={{
                  width: animate ? `${skill.level}%` : '0%'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;