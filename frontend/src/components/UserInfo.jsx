import React, { useState, useEffect } from 'react';
import AxiosInstance from './AxiosInstance';

export const UserInfo = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AxiosInstance.get('user-info/')
      .then((res) => {
        setUserData(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
        setLoading(false);
      });
  }, []);

  return { userData, loading };
};
