// hooks/useStep.js
'use client';

import { useLessonContext } from '../CONTEXT/LessonProvider';

export const useLessons = () => {
  return useLessonContext();
};