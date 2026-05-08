'use client'// hooks/useRecommendations.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '@/services/apiCommunity';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/recommendations');
      setRecommendations(data.recommendations || []);
      setMeta(data.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, loading, error, meta, refetch: fetchRecommendations };
}