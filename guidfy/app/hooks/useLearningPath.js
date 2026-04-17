
'use client';

import { useLearningPathContext } from '../CONTEXT/LearningPathContext';

export const useLearningPaths = () => {
  return useLearningPathContext();
};