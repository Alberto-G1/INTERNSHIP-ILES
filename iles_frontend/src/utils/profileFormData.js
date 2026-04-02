export const buildProfileUpdateFormData = (formData) => {
  const payload = new FormData();

  Object.entries(formData || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    if (key === 'profile_picture' && !(value instanceof File)) {
      return;
    }

    if (value instanceof File) {
      payload.append(key, value);
      return;
    }

    if (typeof value === 'object') {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue === null || nestedValue === undefined || nestedValue === '') {
          return;
        }
        if (nestedKey === 'profile_picture' && !(nestedValue instanceof File)) {
          return;
        }
        if (nestedValue instanceof File) {
          payload.append(nestedKey, nestedValue);
          return;
        }
        payload.append(nestedKey, nestedValue);
      });
      return;
    }

    payload.append(key, value);
  });

  return payload;
};