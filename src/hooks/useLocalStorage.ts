import { useState, useEffect } from 'react';
import { AppData } from '../types';
import { loadData, saveData } from '../utils/storage';

export const useLocalStorage = () => {
  const [data, setData] = useState<AppData>(loadData);

  const updateData = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setData(loadData());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { data, updateData };
};