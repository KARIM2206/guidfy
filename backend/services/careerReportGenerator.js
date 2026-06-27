// backend/services/careerReportGenerator.js
const { getRecommendationForSkill } = require('./careerRecommendations');

function generateProjectRecommendations(missingSkills, career) {
  const projects = [];
  
  if (missingSkills.includes('react') || missingSkills.includes('next.js') || career.toLowerCase().includes('frontend')) {
    projects.push({
      name: "Interactive E-Commerce Dashboard",
      goal: "Build a responsive dashboard handling real-time state, cart logic, and API data fetching.",
      skills: "React, Next.js, API Integration, State Management"
    });
  }
  
  if (missingSkills.includes('node.js') || missingSkills.includes('sql') || career.toLowerCase().includes('backend')) {
    projects.push({
      name: "RESTful Authentication API",
      goal: "Develop a secure backend service with JWT authentication, role-based access, and a relational database.",
      skills: "Node.js, Express, SQL/MongoDB, Security"
    });
  }

  if (missingSkills.includes('docker') || missingSkills.includes('ci/cd') || career.toLowerCase().includes('devops')) {
    projects.push({
      name: "Automated Deployment Pipeline",
      goal: "Containerize a sample application and set up an automated CI/CD pipeline using GitHub Actions.",
      skills: "Docker, CI/CD, Git, Linux"
    });
  }
  
  if (missingSkills.includes('python') || missingSkills.includes('machine learning') || career.toLowerCase().includes('data')) {
    projects.push({
      name: "Predictive Analytics Model",
      goal: "Clean a public dataset and build a machine learning model to predict user behavior.",
      skills: "Python, Pandas, Scikit-learn, Data Analysis"
    });
  }

  // Fallback if no specific projects matched
  if (projects.length === 0) {
    projects.push({
      name: "Full-Stack Portfolio System",
      goal: "Build an end-to-end web application integrating a database, API, and frontend.",
      skills: missingSkills.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') || "General Programming"
    });
  }

  return projects.slice(0, 2); // Return top 2 projects
}

function generateTextReport(analysis) {
  const { career, matchScore, readinessScore, acquiredSkills, missingSkills } = analysis;

  const topSkills = acquiredSkills.slice(0, 5).map(s => s.charAt(0).toUpperCase() + s.slice(1));
  const projects = generateProjectRecommendations(missingSkills, career);

  let level = "beginner";
  if (readinessScore >= 80) level = "strong";
  else if (readinessScore >= 50) level = "solid";

  let report = `# 📊 **AI Career Readiness Report**

🎯 **Target Career Path:**
${career}

📈 **Career Match Score:**
${matchScore}%

🚀 **Current Professional Readiness:**
${readinessScore}%

---

📝 **Career Assessment Summary:**

Based on your learning progress, completed roadmap activities, projects, and skill evaluations, you have demonstrated a ${level} foundation for the ${career} career path.

---

✅ **Strong Skills Acquired:**

You have demonstrated proficiency in:

`;

  if (topSkills.length > 0) {
    topSkills.forEach(skill => {
      report += `• ${skill}\n`;
    });
  } else {
    report += `• Fundamentals (Keep learning to build your profile!)\n`;
  }

  report += `
---

⚠️ **Skills Gap Analysis:**

To improve your professional readiness and become more job-ready, focus on developing these areas:

`;

  missingSkills.forEach(skill => {
    const formattedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
    const advice = getRecommendationForSkill(skill);
    report += `🔹 **${formattedSkill}:**\n${advice}\n\n`;
  });

  report += `---

🛠️ **Recommended Projects to Improve Skills:**

`;

  projects.forEach((proj, index) => {
    report += `${index + 1}. ${proj.name}:

   * Goal: ${proj.goal}
   * Skills Improved: ${proj.skills}

`;
  });

  report += `---

💡 **Next Steps:**

Completing these missing skills and projects will significantly improve your readiness for professional roles.

Recommended actions:
• Complete targeted learning paths.
• Build practical projects.
• Improve problem-solving skills.
• Strengthen your portfolio.

---

🌟 **Final Career Recommendation:**

Based on your current progress, your next focus should be improving the missing technical skills and gaining more hands-on experience to reach professional-level readiness.

================================================
`;

  return report;
}

module.exports = { generateTextReport };
