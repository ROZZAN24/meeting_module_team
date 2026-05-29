import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, MenuItem, Chip } from '@mui/material';
import { IconRotate2, IconRefresh, IconPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import {
  BOSDataTable,
  BOSFormDialog,
  BOSTextField,
  BOSFormSection,
  btnNew,
  errorStyle
} from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import { setFilterConfig } from 'store/slices/search';

// ==============================|| INDUCTION ROUND MASTER ||============================== //

const INITIAL_STATE = {
  id: null,
  roundName: '',
  description: '',
  displayOrder: '',
  status: 'ACTIVE'
};

const VALIDATION_RULES = [
  { field: 'roundName', label: 'Round Name', required: true },
  { field: 'status', label: 'Status', required: true }
];

export default function InductionRoundMaster() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const { errors, validate, clearErrors, setErrors } = useBOSValidation();

  const columns = useMemo(() => [
    { id: 'index', label: 'Sl.No', minWidth: 60 },
    { id: 'roundName', label: 'Round Name', bold: true, color: 'primary.main', minWidth: 180 },
    { id: 'description', label: 'Description', minWidth: 280 },
    { id: 'displayOrder', label: 'Order', minWidth: 80 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      render: (row) => (
        <Chip
          label={row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          variant="outlined"
          size="small"
          color={row.status === 'ACTIVE' ? 'success' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      )
    },
    { id: 'createdBy', label: 'Created By', minWidth: 120 },
    { id: 'createdAt', label: 'Created Date', minWidth: 150 },
    { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
    { id: 'updatedAt', label: 'Updated Date', minWidth: 150 }
  ], []);

  // Filter config
  useEffect(() => {
    const config = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'IN ACTIVE', label: 'INACTIVE' }
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
      const response = await axios.get('/api/hr/induction-round');
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch induction rounds:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load data', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleOpenAdd = () => {
    setFormData(INITIAL_STATE);
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => {
    setFormData({
      ...row,
      displayOrder: row.displayOrder ?? ''
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
        roundName: formData.roundName.trim().toUpperCase(),
        description: formData.description,
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder, 10) : null,
        status: formData.status
      };

      if (formData.id) {
        await axios.put(`/api/hr/induction-round/${formData.id}`, payload);
        dispatch(openSnackbar({
          open: true,
          message: 'Induction Round Updated Successfully',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success'
        }));
      } else {
        await axios.post('/api/hr/induction-round', payload);
        dispatch(openSnackbar({
          open: true,
          message: 'Induction Round Created Successfully',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success'
        }));
      }
      setDialogOpen(false);
      fetchRows();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Failed to save induction round';
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
      await axios.delete(`/api/hr/induction-round/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Induction Round Inactivated Successfully', variant: 'alert', severity: 'success' }));
      setDeleteDialogOpen(false);
      fetchRows();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to inactivate', variant: 'alert', severity: 'error' }));
    }
  };

  const resolvedRows = useMemo(() => {
    return rows.map((r, i) => ({
      ...r,
      index: i + 1,
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : '-',
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'
    }));
  }, [rows]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconRotate2 size={24} />
          <Typography variant="h3">Induction Round Master</Typography>
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
          <Button variant="contained" color="primary" onClick={handleOpenAdd} sx={btnNew} startIcon={<IconPlus size={18} />}>
            + New Round
          </Button>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={resolvedRows}
        loading={loading}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDelete}
        onDoubleClickRow={handleOpenEdit}
      />

      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={formData.id ? 'Edit Induction Round' : 'Add Induction Round'}
        fullWidth
        maxWidth="sm"
        onSave={handleSave}
        onClear={() => {
          setFormData(INITIAL_STATE);
          setErrors({});
        }}
        hasId={!!formData.id}
        onDelete={() => {
          setDeleteTarget(formData);
          setDeleteDialogOpen(true);
        }}
      >
        <BOSFormSection title="Round Details">
          <Stack spacing={2.5} sx={{ mt: 1.5 }}>
            <BOSTextField
              name="roundName"
              label="ROUND NAME"
              placeholder="e.g. SAFETY, IT, FINANCE..."
              value={formData.roundName}
              onChange={handleInputChange}
              required
              fullWidth
              error={!!errors.roundName}
              helperText={errors.roundName || 'Name will be auto-uppercased'}
              sx={errorStyle(!!errors.roundName)}
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />

            <BOSTextField
              name="description"
              label="DESCRIPTION"
              placeholder="Brief description of this screening round..."
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
              error={!!errors.description}
              helperText={errors.description}
              sx={errorStyle(!!errors.description)}
            />

            <BOSTextField
              name="displayOrder"
              label="DISPLAY ORDER"
              type="number"
              placeholder="e.g. 1, 2, 3..."
              value={formData.displayOrder}
              onChange={handleInputChange}
              fullWidth
              helperText="Controls the order rounds appear in dropdowns"
              inputProps={{ min: 1 }}
            />

            <BOSTextField
              select
              name="status"
              label="STATUS"
              value={formData.status}
              onChange={handleInputChange}
              required
              error={!!errors.status}
              helperText={errors.status || 'Inactive rounds will not appear in dropdowns'}
              sx={errorStyle(!!errors.status)}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="IN ACTIVE">Inactive</MenuItem>
            </BOSTextField>
          </Stack>
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Inactivate Induction Round"
        message="Are you sure you want to inactivate this induction round? It will no longer appear in dropdowns."
        itemName={deleteTarget?.roundName}
      />
    </MainCard>
  );
}
