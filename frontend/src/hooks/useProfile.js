import { useState, useEffect, useCallback } from 'react';
import { profileAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const useProfile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await profileAPI.get();
      setProfile(res.data.user);
      updateUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (data) => {
    const res = await profileAPI.update(data);
    setProfile(res.data.user);
    updateUser(res.data.user);
    return res.data.user;
  };

  return { profile, loading, error, fetchProfile, updateProfile };
};

export const useDiscovery = (filters = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.discover(filters);
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetch();
  }, [JSON.stringify(filters)]);

  return { users, loading, pagination };
};
