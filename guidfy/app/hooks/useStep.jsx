// hooks/useStep.js
'use client';

import { useStepContext } from '../CONTEXT/StepProvider';

export const useSteps = () => {
  return useStepContext();
};