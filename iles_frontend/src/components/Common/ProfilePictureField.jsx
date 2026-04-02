import { useEffect, useState } from 'react';
import { Box, Button, Stack, Avatar, Typography } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const ProfilePictureField = ({ label = 'Profile Picture', currentSrc, value, onChange, onClear }) => {
  const [previewSrc, setPreviewSrc] = useState(currentSrc || '');

  useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewSrc(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewSrc(resolveMediaUrl(currentSrc));
    return undefined;
  }, [currentSrc, value]);

  return (
    <Stack spacing={1.5} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <Avatar
          src={previewSrc}
          alt={label}
          sx={{ width: 72, height: 72, bgcolor: 'grey.300' }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />}>
            {value ? 'Change Photo' : 'Upload Photo'}
            <input hidden type="file" accept="image/*" onChange={onChange} />
          </Button>
          {value && (
            <Button variant="text" color="inherit" startIcon={<DeleteIcon />} onClick={onClear}>
              Remove
            </Button>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

export default ProfilePictureField;