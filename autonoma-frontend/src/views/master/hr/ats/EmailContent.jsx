import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, MenuItem } from '@mui/material';
import { IconMail, IconRefresh, IconPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import {
  BOSDataTable,
  BOSFormDialog,
  BOSTextField,
  errorStyle
} from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import { setFilterConfig } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| EMAIL CONTENT MASTER ||============================== //

const INITIAL_STATE = {
  id: null,
  type: '',
  subject: '',
  bodyContent: '',
  yoursWindfully: '',
  status: 'ACTIVE'
};

const TYPE_OPTIONS = [
  'CALL LETTER',
  'OFFER LETTER',
  'VISITOR PASS',
  'INTERVIEW ASSIGN',
  'APPOINTMENT LETTER',
  'LTA APPLY',
  'ASSIGN INDUCTION',
  'INDUCTION TRAINEE REJECT',
  'INDUCTION TRAINEE COMPLETED'
];

const VALIDATION_RULES = [
  { field: 'type', label: 'Type', required: true },
  { field: 'subject', label: 'Subject', required: true },
  { field: 'bodyContent', label: 'Body/Content', required: true },
  { field: 'yoursWindfully', label: 'Yours Windfully', required: true },
  { field: 'status', label: 'Status', required: true }
];

export default function EmailContent() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const { errors, validate, clearErrors, setErrors } = useBOSValidation();

  const perms = usePagePermissions(PAGE_CODES.ATS_EMAIL_CONTENT);

  const columns = useMemo(() => [
    { id: 'index', label: '#', minWidth: 60 },
    { id: 'type', label: 'Type', bold: true, color: 'primary.main', minWidth: 150 },
    { id: 'subject', label: 'Subject', bold: true, minWidth: 200 },
    { id: 'bodyContent', label: 'Body/Content', minWidth: 300 },
    { id: 'yoursWindfully', label: 'Yours Windfully', minWidth: 150 },
    { id: 'createdUser', label: 'CREATED USER', minWidth: 120 },
    { id: 'createdAt', label: 'CREATED DATE', minWidth: 150 },
    { id: 'updatedUser', label: 'UPDATED USER', minWidth: 120 },
    { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 150 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      render: (row) => (row.status === 'ACTIVE' ? 'Active' : 'Inactive')
    }
  ], []);

  // Dispatch starred filter configuration matching Status
  useEffect(() => {
    const config = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ],
        defaultValue: 'ALL',
        isStarred: true
      }
    ];
    dispatch(setFilterConfig(config));
    return () => {
      dispatch(setFilterConfig(null));
    };
  }, [dispatch]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/hr/email-content');
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch email contents:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load data', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleOpenAdd = () => {
    setFormData(INITIAL_STATE);
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => {
    setFormData({
      ...row
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) clearErrors(name);
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;

    try {
      const payload = {
        ...formData
      };

      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.createdBy;
      delete payload.updatedBy;
      delete payload.createdUser;
      delete payload.updatedUser;
      delete payload.index;

      if (formData.id) {
        await axios.put(`/api/hr/email-content/${formData.id}`, payload);
        dispatch(openSnackbar({
          open: true,
          message: 'Email Content Updated Successfully',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success'
        }));
      } else {
        await axios.post('/api/hr/email-content', payload);
        dispatch(openSnackbar({
          open: true,
          message: 'Email Content Saved Successfully',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success'
        }));
      }
      setDialogOpen(false);
      fetchRows();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Failed to save email content';
      dispatch(openSnackbar({
        open: true,
        message: msg,
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'error'
      }));
    }
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/hr/email-content/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Email Content Deleted Successfully', variant: 'alert', severity: 'success' }));
      setDeleteDialogOpen(false);
      fetchRows();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete', variant: 'alert', severity: 'error' }));
    }
  };

  const resolvedRows = useMemo(() => {
    return rows.map((r, i) => ({
      ...r,
      index: i + 1,
      createdUser: r.createdUser || r.createdBy || '-',
      updatedUser: r.updatedUser || r.updatedBy || '-',
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : '-',
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'
    }));
  }, [rows]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconMail size={24} />
          <Typography variant="h3">Email Content</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchRows} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="contained" color="primary" onClick={handleOpenAdd} sx={{ borderRadius: '8px', textTransform: 'none' }} startIcon={<IconPlus size={18} />}>
            New
          </Button>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={resolvedRows}
        loading={loading}
        onEditRow={perms.write ? handleOpenEdit : undefined}
        onDeleteRow={handleDelete}
        onDoubleClickRow={perms.write ? handleOpenEdit : undefined}
      />

      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Email Content"
        fullWidth
        maxWidth="sm"
        onSave={handleSave}
        onClear={() => {
          setFormData(INITIAL_STATE);
          setErrors({});
        }}
        secondaryActions={
          <Button
            variant="outlined"
            onClick={() => setDialogOpen(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.secondary'
            }}
          >
            Back
          </Button>
        }
        hasId={!!formData.id}
        onDelete={() => {
          setDeleteTarget(formData);
          setDeleteDialogOpen(true);
        }}
      >
        <Stack spacing={2.5} sx={{ mt: 1.5 }}>
          <BOSTextField
            select
            name="type"
            label="TYPE"
            value={formData.type}
            onChange={handleInputChange}
            required
            helperText={errors.type || "Select email type"}
            error={!!errors.type}
            sx={errorStyle(!!errors.type)}
          >
            <MenuItem value="">-SELECT-</MenuItem>
            {TYPE_OPTIONS.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </BOSTextField>

          <BOSTextField
            name="subject"
            label="SUBJECT"
            placeholder="Enter email subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            fullWidth
            error={!!errors.subject}
            helperText={errors.subject}
            sx={errorStyle(!!errors.subject)}
          />

          <BOSTextField
            name="bodyContent"
            label="BODY/CONTENT"
            placeholder="Enter email body content..."
            value={formData.bodyContent}
            onChange={handleInputChange}
            multiline
            rows={6}
            required
            fullWidth
            error={!!errors.bodyContent}
            helperText={errors.bodyContent}
            sx={errorStyle(!!errors.bodyContent)}
          />

          <BOSTextField
            name="yoursWindfully"
            label="YOURS WINDFULLY"
            placeholder="Enter yours windfully signature"
            value={formData.yoursWindfully}
            onChange={handleInputChange}
            required
            fullWidth
            error={!!errors.yoursWindfully}
            helperText={errors.yoursWindfully}
            sx={errorStyle(!!errors.yoursWindfully)}
          />

          <BOSTextField
            select
            name="status"
            label="STATUS"
            value={formData.status}
            onChange={handleInputChange}
            error={!!errors.status}
            helperText={errors.status}
            sx={errorStyle(!!errors.status)}
          >
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </BOSTextField>
        </Stack>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Email Content"
        message="Are you sure you want to completely remove this email content?"
        itemName={deleteTarget?.type}
      />
    </MainCard>
  );
}
