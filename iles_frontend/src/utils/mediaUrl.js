const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const MEDIA_BASE_URL = API_URL.replace(/\/api\/?$/, '');

export const resolveMediaUrl = (url) => {
  if (!url) {
    return '';
  }

  if (typeof url !== 'string') {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('//')) {
    return `${window.location.protocol}${url}`;
  }

  if (url.startsWith('/')) {
    return `${MEDIA_BASE_URL}${url}`;
  }

  return `${MEDIA_BASE_URL}/${url}`;
};