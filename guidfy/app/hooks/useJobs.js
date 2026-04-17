
'use client';

import { useJobContext } from '../CONTEXT/JobsContext';

export const useJobs = () => {
  return useJobContext();
};