import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import {
  ApproveModal,
  ArchiveModal,
  DeleteModal,
  RejectModal,
  ResetPasswordModal,
  SignOutModal,
  SubmitModal,
} from '../Common/AppConfirmModal';
import { notifySuccess, notifyWarning } from '../Common/AppToast';

const modalActions = [
  { key: 'delete', label: 'Delete record', color: 'var(--coral-700)', bg: 'var(--coral-50)', border: 'rgba(220,38,38,0.18)' },
  { key: 'approve', label: 'Approve intern', color: 'var(--green-700)', bg: 'var(--green-50)', border: 'rgba(46,139,91,0.18)' },
  { key: 'signout', label: 'Sign out', color: 'var(--amber-600)', bg: 'var(--amber-50)', border: 'rgba(245,158,11,0.18)' },
  { key: 'reject', label: 'Reject log', color: 'var(--coral-700)', bg: 'var(--coral-50)', border: 'rgba(220,38,38,0.18)' },
  { key: 'submit', label: 'Submit report', color: 'var(--blue-700)', bg: 'var(--blue-50)', border: 'rgba(37,99,235,0.18)' },
  { key: 'reset', label: 'Reset password', color: 'var(--purple-700)', bg: 'var(--purple-50)', border: 'rgba(109,40,217,0.18)' },
  { key: 'archive', label: 'Archive record', color: 'var(--amber-600)', bg: 'var(--amber-50)', border: 'rgba(245,158,11,0.18)' },
];

const ModalReferencePanel = () => {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  const confirmAndToast = (message, options = {}) => () => {
    closeModal();
    notifySuccess(message, { title: options.title || 'Saved' });
  };

  const handleReject = (reason) => {
    closeModal();
    notifyWarning(reason ? `Rejected with reason: ${reason}` : 'The log was rejected for revision.', { title: 'Log Rejected' });
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: '22px',
          border: '1px solid var(--gray-200)',
          bgcolor: 'var(--gray-50)',
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
              Confirmation modals
            </Typography>
            <Typography sx={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--gray-600)' }}>
              These variants all use the shared modal shell and tokens, so the dialog styling stays consistent across the product.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            {modalActions.map((action) => (
              <Button
                key={action.key}
                onClick={() => setActiveModal(action.key)}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  borderRadius: '14px',
                  px: 2,
                  py: 1.4,
                  border: `1px solid ${action.border}`,
                  bgcolor: action.bg,
                  color: action.color,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: action.bg,
                    borderColor: action.color,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      <DeleteModal
        open={activeModal === 'delete'}
        onClose={closeModal}
        onConfirm={confirmAndToast('The sample record was deleted.', { title: 'Delete Complete' })}
        recordName="Intern Log - Kwame Asante · Week 7"
      />
      <ApproveModal
        open={activeModal === 'approve'}
        onClose={closeModal}
        onConfirm={confirmAndToast('The intern was approved and granted access.', { title: 'Approval Complete' })}
        personName="Abena Mensah"
      />
      <SignOutModal
        open={activeModal === 'signout'}
        onClose={closeModal}
        onConfirm={confirmAndToast('You have been signed out of the reference session.', { title: 'Signed Out' })}
        sessionInfo="Session active for 2h 14m"
      />
      <RejectModal
        open={activeModal === 'reject'}
        onClose={closeModal}
        onConfirm={handleReject}
        recordName="Week 5 Log - Kofi Darko"
      />
      <SubmitModal
        open={activeModal === 'submit'}
        onClose={closeModal}
        onConfirm={confirmAndToast('The report was submitted for review.', { title: 'Submitted' })}
        recordName="Final Internship Report"
      />
      <ResetPasswordModal
        open={activeModal === 'reset'}
        onClose={closeModal}
        onConfirm={confirmAndToast('A reset link was queued for the selected user.', { title: 'Reset Sent' })}
        userEmail="ama.osei@ailes.edu.gh"
      />
      <ArchiveModal
        open={activeModal === 'archive'}
        onClose={closeModal}
        onConfirm={confirmAndToast('The sample record was archived.', { title: 'Archive Complete' })}
        recordName="Yaw Boateng · 16 weeks · 48 logs"
      />

      <Box sx={{ mt: 2.5, fontSize: '12px', color: 'var(--gray-500)' }}>
        The shared warning shell also covers the unsaved-changes pattern used in the HTML reference.
      </Box>
    </>
  );
};

export default ModalReferencePanel;