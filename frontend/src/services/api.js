export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('coworking_access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw { status: response.status, data, message: data.message || 'Error occurred' };
  }

  return data;
};
