// backend/services/careerRecommendations.js

const careerRecommendations = {
  // Frontend
  "react": "Build a complex stateful application using React context and custom hooks.",
  "next.js": "Learn server-side rendering and static site generation for SEO performance.",
  "html": "Ensure semantic HTML structure in your projects.",
  "css": "Master modern CSS layouts like Flexbox and Grid, and explore TailwindCSS.",
  "javascript": "Deepen your understanding of ES6+ features, closures, and async programming.",
  "typescript": "Migrate a small JavaScript project to TypeScript to understand strong typing.",
  "testing": "Practice writing unit tests using Jest and integration tests using React Testing Library.",
  "accessibility": "Ensure your web apps are accessible by learning ARIA roles and contrast ratios.",
  "docker": "Learn basic containerization to ensure your environments are consistent.",
  "git": "Master branching strategies and pull request workflows.",
  
  // Backend
  "node.js": "Understand the event loop and build a robust REST API using Express or NestJS.",
  "express": "Build custom middleware for error handling and authentication.",
  "nestjs": "Learn dependency injection and architectural patterns in NestJS.",
  "mongodb": "Design schema relationships and learn how to optimize aggregation pipelines.",
  "postgresql": "Practice writing complex SQL queries and understand indexing for performance.",
  "redis": "Implement caching for your API responses to improve speed.",
  "aws": "Understand cloud fundamentals and deploy your application using AWS EC2 or Lambda.",
  "microservices": "Break down a monolithic application into smaller, independent services.",
  
  // Data Science & AI
  "python": "Master list comprehensions, generators, and object-oriented programming in Python.",
  "pandas": "Practice data cleaning and manipulation on large datasets.",
  "numpy": "Understand vectorized operations for fast numerical computing.",
  "tensorflow": "Build and train a simple neural network for image classification.",
  "pytorch": "Learn dynamic computation graphs and implement a custom deep learning model.",
  "scikit-learn": "Experiment with different machine learning algorithms and cross-validation.",
  "sql": "Write complex analytical queries to extract insights from relational databases.",
  "machine learning": "Focus on feature engineering and model evaluation metrics.",
  
  // DevOps / Cloud
  "kubernetes": "Learn how to orchestrate Docker containers and manage cluster state.",
  "ci/cd": "Set up a Github Actions pipeline to automate testing and deployment.",
  "linux": "Master shell scripting and basic server administration.",
  "terraform": "Learn Infrastructure as Code (IaC) to provision cloud resources automatically.",

  // Mobile
  "react native": "Build a cross-platform mobile application utilizing native device APIs.",
  "flutter": "Learn Dart and build a beautiful, performant mobile UI.",
  "swift": "Explore native iOS development and the UIKit/SwiftUI frameworks.",
  "kotlin": "Dive into Android development and learn how to manage app state and lifecycle."
};

/**
 * Get actionable advice for a missing skill.
 * Provides a generic response if the skill isn't hardcoded.
 */
function getRecommendationForSkill(skillName) {
  const normalized = skillName.toLowerCase().trim();
  if (careerRecommendations[normalized]) {
    return careerRecommendations[normalized];
  }
  return `Consider dedicating time to learn ${skillName} through official documentation or specialized courses.`;
}

module.exports = { getRecommendationForSkill, careerRecommendations };
