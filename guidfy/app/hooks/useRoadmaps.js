// hooks/useRoadmaps.js
'use client';

import { useRoadmapContext } from '../CONTEXT/RoadmapProvider';

export const useRoadmaps = () => {
  return useRoadmapContext();
};