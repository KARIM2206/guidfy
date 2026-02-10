import { BookOpen, FileText, Target } from "lucide-react";

export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "beginner": return "bg-green-100 text-green-800";
    case "intermediate": return "bg-yellow-100 text-yellow-800";
    case "advanced": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const getStepTypeIcon = (type) => {
  switch (type) {
    case "course": return <BookOpen size={14} />;
    case "article": return <FileText size={14} />;
    case "project": return <Target size={14} />;
    default: return <BookOpen size={14} />;
  }
};

export const getStepTypeColor = (type) => {
  switch (type) {
    case "course": return "bg-purple-100 text-purple-800";
    case "article": return "bg-blue-100 text-blue-800";
    case "project": return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
