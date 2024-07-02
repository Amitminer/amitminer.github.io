const skillsData = [
  { name: "C++", level: "Intermediate" },
  { name: "PHP", level: "Advanced" },
  { name: "Python", level: "Advanced" },
  { name: "HTML/CSS", level: "Intermediate" },
  { name: "JavaScript", level: "Intermediate" },
  { name: "Git", level: "Intermediate" },
  { name: "Problem-solving", level: "Intermediate" },
  { name: "Teamwork", level: "Beginner" },
  { name: "Communication", level: "Beginner" },
];

function populateSkills() {
  const skillsContainer = document.getElementById("skills-container");
  skillsData.forEach((skill) => {
    const skillItem = document.createElement("div");
    skillItem.className = "skill-item";
    skillItem.innerHTML = `
            <p>${skill.name}</p>
            <span>${skill.level}</span>
        `;
    skillsContainer.appendChild(skillItem);
  });
}

async function fetchGitHubProjects() {
  const username = "Amitminer";
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`
  );
  const projects = await response.json();
  return projects;
}

async function populateProjects() {
  const projectsContainer = document.getElementById("projects-container");
  try {
    const projects = await fetchGitHubProjects();
    projects.forEach((project) => {
      const projectCard = document.createElement("div");
      projectCard.className = "project-card";
      projectCard.innerHTML = `
                <img src="https://opengraph.githubassets.com/1/${
                  project.full_name
                }" alt="${project.name}" class="project-img">
                <div class="project-info">
                    <h3 class="project-title">${project.name}</h3>
                    <p class="project-description">${
                      project.description || "No description available."
                    }</p>
                    <a href="${
                      project.html_url
                    }" class="project-link" target="_blank">View Project</a>
                </div>
            `;
      projectsContainer.appendChild(projectCard);
    });
  } catch (error) {
    console.error("Error fetching GitHub projects:", error);
    projectsContainer.innerHTML =
      "<p>Error loading projects. Please try again later.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateSkills();
  populateProjects();
});

document.querySelectorAll(".control").forEach((control) => {
  control.addEventListener("click", () => {
    alert("Just for show! 😉");
  });
});
