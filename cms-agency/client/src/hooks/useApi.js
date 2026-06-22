import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (method, url, body = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api({ method, url, data: body });
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Request failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
}
