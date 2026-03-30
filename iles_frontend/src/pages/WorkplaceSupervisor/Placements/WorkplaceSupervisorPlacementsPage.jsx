import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Link, Stack, Typography } from '@mui/material';
import PageScaffold from '../../../components/Common/PageScaffold';
import { notifyError } from '../../../components/Common/AppToast';
import { placementsAPI } from '../../../services/api';

const WorkplaceSupervisorPlacementsPage = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedPlacements = async () => {
    try {
      setLoading(true);
      const res = await placementsAPI.getAssignedPlacements();
      setPlacements(res.data || []);
    } catch (err) {
      notifyError('Failed to load assigned placements', { title: 'Load Failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedPlacements();
  }, []);

  const stats = useMemo(() => {
    const active = placements.filter((p) => p.current_lifecycle_status === 'active').length;
    const upcoming = placements.filter((p) => p.current_lifecycle_status === 'approved').length;
    const completed = placements.filter((p) => p.current_lifecycle_status === 'completed').length;

    return [
      { label: 'Assigned', value: String(placements.length), helper: 'Total placements', accent: '#2E8B5B' },
      { label: 'Active', value: String(active), helper: 'Ongoing interns', accent: '#5B82A6' },
      { label: 'Upcoming', value: String(upcoming), helper: 'Approved starts', accent: '#F59E0B' },
      { label: 'Completed', value: String(completed), helper: 'Closed placements', accent: '#4DB87A' },
    ];
  }, [placements]);

  return (
    <PageScaffold
      title="Workplace Placements"
      subtitle="Track students assigned to you after admin-approved placement validation"
      stats={stats}
    >
      <Stack spacing={1.2}>
        {loading ? (
          <Typography sx={{ color: 'text.secondary' }}>Loading assigned placements...</Typography>
        ) : placements.length === 0 ? (
          <Alert severity="info">No placements currently assigned to you.</Alert>
        ) : (
          placements.map((p) => (
            <Box key={p.id} sx={{ border: '1px solid var(--gray-200)', borderRadius: '12px', p: 1.4 }}>
              <Typography sx={{ fontWeight: 600 }}>{p.student_name}</Typography>
              <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>{p.organization?.name || 'No organization'}</Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.3 }}>
                {p.start_date || 'N/A'} - {p.end_date || 'N/A'}
              </Typography>
              <Stack direction="row" spacing={0.8} sx={{ mt: 0.8, alignItems: 'center' }}>
                <Chip size="small" label={p.current_lifecycle_status.toUpperCase()} sx={{ bgcolor: 'var(--green-100)', color: 'var(--green-900)' }} />
                {p.placement_letter_url && (
                  <Link href={p.placement_letter_url} target="_blank" rel="noreferrer" sx={{ fontSize: '12px' }}>
                    View Letter
                  </Link>
                )}
              </Stack>
            </Box>
          ))
        )}
      </Stack>
    </PageScaffold>
  );
};

export default WorkplaceSupervisorPlacementsPage;
