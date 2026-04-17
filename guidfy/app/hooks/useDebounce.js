// hooks/useDebounce.js
'use client';
import { useCallback, useRef } from 'react';

export const useDebounce = (fn, delay) => {
  const timer = useRef(null);

  return useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
};