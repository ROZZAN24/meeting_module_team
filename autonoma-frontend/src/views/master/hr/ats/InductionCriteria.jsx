import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography, Button, Stack, Tooltip, IconButton, MenuItem, Box, Checkbox, ListItemText
} from '@mui/material';
import {
  IconClipboardCheck, IconRefresh, IconPlus,
  IconDeviceFloppy, IconEraser, IconTrash
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import {
  BOSDataTable, BOSExportButton, btnNew, btnSave, btnCancel, btnClear, btnDelete,
  BOSTextField, BOSFormSection, BOSFileUpload, errorStyle
} from 'ui-component/bos';
import BOSMovableDialog from 'ui-component/bos/BOSMovableDialog';
import { useLookups } from 'hooks/useLookups';
import useBOSValidation from 'hooks/useBOSValidation';
import { setFilterConfig } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| INDUCTION CRITERIA MASTER ||============================== //

const columns = [
  { id: 'index', label: 'Sl.No', minWidth: 60 },
  { id: 'serialNo', label: 'Serial No', bold: true, color: 'primary.main', minWidth: 100 },
  { id: 'inductionDetails', label: 'Induction Details', required: true, bold: true, minWidth: 250 },
  { id: 'answer', label: 'Answer', required: true, minWidth: 200 },
  { id: 'departmentCodes', label: 'Department', minWidth: 150 },
  { id: 'levelCodes', label: 'Level', minWidth: 120 },
  { id: 'inductionRound', label: 'Round', minWidth: 120 },
  { id: 'attachmentRequired', label: 'Attach Req.', minWidth: 100 },
  {
    id: 'status',
    label: 'Status',
    required: true,
    hide: true,
    minWidth: 100,
    render: (row) => (row.status === 'ACTIVE' ? 'Active' : 'Inactive')
  },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdAt', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Edited By', minWidth: 120 },
  { id: 'updatedAt', label: 'Edited Date', minWidth: 150 }
];

const INITIAL_STATE = {
  id: null,
  inductionDetails: '',
  answer: '',
  departmentCodes: [],
  levelCodes: [],
  inductionRound: '',
  attachmentRequired: 'NO',
  status: 'ACTIVE',
  inductionAttachment: ''
};

const ROUND_OPTIONS = ['HR', 'QMS', 'DEPARTMENT', 'MANAGEMENT'];

const LEVEL_OPTIONS = [
  { code: 'L1', label: 'L1 - Trainee' },
  { code: 'L2', label: 'L2 - Junior Executive' },
  { code: 'L3', label: 'L3 - Executive' },
  { code: 'L4', label: 'L4 - Senior Executive' },
  { code: 'L5', label: 'L5 - Assistant Manager' },
  { code: 'L6', label: 'L6 - Manager & Above' }
];

const VALIDATION_RULES = [
  { field: 'inductionRound', label: 'Induction Round', required: true },
  { field: 'inductionDetails', label: 'Induction Details', required: true, maxLength: 1000 },
  { field: 'answer', label: 'Answer', required: true, maxLength: 2000 },
  {
    field: 'departmentCodes',
    label: 'Department',
    required: true,
    validate: (val) => (!val || val.length === 0 ? 'At least one department is required' : null)
  },
  {
    field: 'levelCodes',
    label: 'Level',
    required: true,
    validate: (val) => (!val || val.length === 0 ? 'At least one level is required' : null)
  },
  { field: 'status', label: 'Status', required: true }
];

export default function InductionCriteria() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nextSequence, setNextSequence] = useState(null);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [saveLoading, setSaveLoading] = useState(false);
  const { errors, validate, clearErrors, setErrors } = useBOSValidation();

  const { departments = [] } = useLookups(['DEPARTMENTS']);

  // eslint-disable-next-line no-unused-vars
  const globalQuery = useSelector((state) => state.search.query);
  // eslint-disable-next-line no-unused-vars
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.ATS_INDUCTION_CRITERIA);

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
    return () => { dispatch(setFilterConfig(null)); };
  }, [dispatch]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/hr/induction-master');
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch induction criteria:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load data', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleOpenAdd = async () => {
    setFormData(INITIAL_STATE);
    setErrors({});
    try {
      const res = await axios.get('/api/hr/induction-master/next-sequence');
      setNextSequence(res.data);
    } catch (err) {
      console.error('Failed to fetch next sequence:', err);
    }
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => {
    const deptCodes = row.departmentCodes ? row.departmentCodes.split(',').filter(Boolean) : [];
    const deptIds = deptCodes.map(
      (code) => departments.find((d) => d.departmentCode === code)?.id?.toString() || code
    );
    setFormData({
      ...row,
      departmentCodes: deptIds,
      levelCodes: row.levelCodes ? row.levelCodes.split(',').filter(Boolean) : [],
      inductionAttachment: row.inductionAttachment
        ? {
            serverFileName: row.inductionAttachment,
            fileName: row.inductionAttachment.split('/').pop(),
            isServer: true
          }
        : null
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) clearErrors(name);
  };

  const handleDepartmentChange = (event) => {
    const { value } = event.target;
    if (value.includes('all')) {
      if (formData.departmentCodes.length === departments.length) {
        setFormData((prev) => ({ ...prev, departmentCodes: [] }));
      } else {
        setFormData((prev) => ({ ...prev, departmentCodes: departments.map((d) => d.id.toString()) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, departmentCodes: typeof value === 'string' ? value.split(',') : value }));
    }
    if (errors.departmentCodes) clearErrors('departmentCodes');
  };

  const handleLevelChange = (event) => {
    const { value } = event.target;
    if (value.includes('all')) {
      if (formData.levelCodes.length === LEVEL_OPTIONS.length) {
        setFormData((prev) => ({ ...prev, levelCodes: [] }));
      } else {
        setFormData((prev) => ({ ...prev, levelCodes: LEVEL_OPTIONS.map((l) => l.code) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, levelCodes: typeof value === 'string' ? value.split(',') : value }));
    }
    if (errors.levelCodes) clearErrors('levelCodes');
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;

    if (formData.attachmentRequired === 'YES' && !formData.inductionAttachment) {
      dispatch(openSnackbar({
        open: true,
        message: 'Attachment is mandatory when Attachment Required is set to YES',
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'error'
      }));
      setErrors((prev) => ({ ...prev, inductionAttachment: 'File required' }));
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        ...formData,
        departmentCodes: formData.departmentCodes
          .map((id) => departments.find((d) => d.id.toString() === id)?.departmentCode || id)
          .join(','),
        levelCodes: formData.levelCodes.join(','),
        inductionAttachment:
          formData.inductionAttachment?.serverFileName || formData.inductionAttachment
      };
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.createdBy;
      delete payload.updatedBy;
      delete payload.index;

      if (formData.id) {
        await axios.put(`/api/hr/induction-master/${formData.id}`, payload);
        dispatch(openSnackbar({
          open: true,
          message: 'Induction Criteria Updated Successfully',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success'
        }));
      } else {
        await axios.post('/api/hr/induction-master', payload);
        dispatch(openSnackbar({
          open: true,
          message: 'Induction Criteria Saved Successfully',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success'
        }));
      }
      setDialogOpen(false);
      fetchRows();
    } catch (error) {
      const msg =
        error.response?.data?.message || error.response?.data || 'Failed to save induction criteria';
      dispatch(openSnackbar({ open: true, message: msg, variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/hr/induction-master/${deleteTarget.id}`);
      dispatch(openSnackbar({
        open: true,
        message: 'Induction Criteria Inactivated Successfully',
        variant: 'alert',
        severity: 'success'
      }));
      setDeleteDialogOpen(false);
      fetchRows();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete', variant: 'alert', severity: 'error' }));
    }
  };

  const resolvedRows = useMemo(
    () =>
      rows.map((r, i) => ({
        ...r,
        index: i + 1,
        serialNo: `IND-${r.id.toString().padStart(3, '0')}`,
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : '-',
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'
      })),
    [rows]
  );

  // Dialog action buttons
  const dialogActions = (
    <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ width: '100%' }}>
      <Button variant="contained" sx={btnCancel} onClick={() => setDialogOpen(false)}>
        Cancel
      </Button>
      {formData.id && perms.delete && (
        <Button
          variant="contained"
          sx={btnDelete}
          startIcon={<IconTrash size={16} />}
          onClick={() => { setDeleteTarget(formData); setDeleteDialogOpen(true); }}
        >
          Delete
        </Button>
      )}
      <Button
        variant="contained"
        sx={btnClear}
        startIcon={<IconEraser size={16} />}
        onClick={() => { setFormData(INITIAL_STATE); setErrors({}); }}
      >
        Clear
      </Button>
      <Button
        variant="contained"
        sx={btnSave}
        startIcon={<IconDeviceFloppy size={16} />}
        onClick={handleSave}
        disabled={saveLoading}
      >
        {saveLoading ? 'Saving...' : 'Save'}
      </Button>
    </Stack>
  );

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconClipboardCheck size={24} />
          <Typography variant="h4">Induction Criteria</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchRows}
              color="primary"
              size="small"
              sx={{
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                p: 1,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
              }}
            >
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>

          {perms.export && (
            <BOSExportButton
              data={resolvedRows}
              filename="Induction_Criteria"
              columns={columns.filter((c) => c.id !== 'index').map((c) => ({ header: c.label, key: c.id }))}
            />
          )}

          {perms.write && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAdd}
              sx={btnNew}
              startIcon={<IconPlus size={18} />}
            >
              + New
            </Button>
          )}
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

      {/* Movable & Resizable Dialog */}
      <BOSMovableDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={formData.id ? 'Edit Induction Criteria' : 'Add Induction Criteria'}
        defaultWidth={860}
        defaultHeight={640}
        actions={dialogActions}
      >
        <Stack spacing={3}>
          <BOSFormSection title="1. Basic Information">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, width: '100%' }}>
              <Box sx={{ flex: '1 1 150px', minWidth: 130 }}>
                <BOSTextField
                  name="id"
                  label="SERIAL NO"
                  value={
                    formData.id
                      ? `IND-${formData.id.toString().padStart(3, '0')}`
                      : nextSequence
                        ? `IND-${nextSequence.toString().padStart(3, '0')}`
                        : 'IND-001'
                  }
                  disabled
                  InputProps={{
                    readOnly: true,
                    sx: {
                      bgcolor: 'rgba(33, 150, 243, 0.04)',
                      fontWeight: 700,
                      color: 'primary.main',
                      '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'var(--primary-main)' }
                    }
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 130 }}>
                <BOSTextField
                  select
                  name="inductionRound"
                  label="INDUCTION ROUND"
                  value={formData.inductionRound}
                  onChange={handleInputChange}
                  required
                  error={!!errors.inductionRound}
                  helperText={errors.inductionRound}
                  sx={errorStyle(!!errors.inductionRound)}
                >
                  <MenuItem value="">-Select-</MenuItem>
                  {ROUND_OPTIONS.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </BOSTextField>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 130 }}>
                <BOSTextField
                  select
                  name="status"
                  label="STATUS"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  error={!!errors.status}
                  helperText={errors.status}
                  sx={errorStyle(!!errors.status)}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="IN ACTIVE">Inactive</MenuItem>
                </BOSTextField>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 130 }}>
                <BOSTextField
                  select
                  name="attachmentRequired"
                  label="ATTACHMENT REQUIRED"
                  value={formData.attachmentRequired}
                  onChange={handleInputChange}
                  required
                  error={!!errors.attachmentRequired}
                  helperText={errors.attachmentRequired}
                  sx={errorStyle(!!errors.attachmentRequired)}
                >
                  <MenuItem value="NO">NO</MenuItem>
                  <MenuItem value="YES">YES</MenuItem>
                </BOSTextField>
              </Box>
            </Box>
          </BOSFormSection>

          <BOSFormSection title="2. Criteria Content">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%' }}>
              <Box sx={{ flex: '1 1 240px', minWidth: 200 }}>
                <BOSTextField
                  name="inductionDetails"
                  label="INDUCTION DETAILS"
                  placeholder="Enter specific induction criteria or question details..."
                  value={formData.inductionDetails}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                  fullWidth
                  error={!!errors.inductionDetails}
                  helperText={errors.inductionDetails}
                  sx={errorStyle(!!errors.inductionDetails)}
                />
              </Box>
              <Box sx={{ flex: '1 1 240px', minWidth: 200 }}>
                <BOSTextField
                  name="answer"
                  label="ANSWER"
                  placeholder="Enter the expected answer or guidelines for this induction..."
                  value={formData.answer}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                  fullWidth
                  error={!!errors.answer}
                  helperText={errors.answer}
                  sx={errorStyle(!!errors.answer)}
                />
              </Box>
            </Box>
          </BOSFormSection>

          <BOSFormSection title="3. Target Assignment & Reference">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%' }}>
              <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
                <Stack spacing={2.5}>
                  <BOSTextField
                    select
                    name="departmentCodes"
                    label="DEPARTMENT"
                    value={formData.departmentCodes}
                    onChange={handleDepartmentChange}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => {
                        if (!selected || selected.length === 0) return <em>-Select-</em>;
                        return selected
                          .map((id) => departments.find((d) => d.id.toString() === id)?.departmentName || id)
                          .join(', ');
                      }
                    }}
                    required
                    helperText={errors.departmentCodes || 'Select departments this applies to'}
                    error={!!errors.departmentCodes}
                    sx={errorStyle(!!errors.departmentCodes)}
                  >
                    <MenuItem value="all">
                      <Checkbox
                        checked={formData.departmentCodes.length === departments.length && departments.length > 0}
                        indeterminate={
                          formData.departmentCodes.length > 0 &&
                          formData.departmentCodes.length < departments.length
                        }
                      />
                      <ListItemText primary="Select All" />
                    </MenuItem>
                    {departments.map((d) => (
                      <MenuItem key={d.id} value={d.id.toString()}>
                        <Checkbox checked={formData.departmentCodes.includes(d.id.toString())} />
                        <ListItemText primary={d.departmentName} secondary={d.departmentCode} />
                      </MenuItem>
                    ))}
                  </BOSTextField>
                  <BOSTextField
                    select
                    name="levelCodes"
                    label="LEVEL"
                    value={formData.levelCodes}
                    onChange={handleLevelChange}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => {
                        if (selected.length === 0) return <em>-Select-</em>;
                        return selected
                          .map((code) => LEVEL_OPTIONS.find((l) => l.code === code)?.label || code)
                          .join(', ');
                      }
                    }}
                    required
                    helperText={errors.levelCodes || 'Select levels this applies to'}
                    error={!!errors.levelCodes}
                    sx={errorStyle(!!errors.levelCodes)}
                  >
                    <MenuItem value="all">
                      <Checkbox
                        checked={formData.levelCodes.length === LEVEL_OPTIONS.length && LEVEL_OPTIONS.length > 0}
                        indeterminate={
                          formData.levelCodes.length > 0 &&
                          formData.levelCodes.length < LEVEL_OPTIONS.length
                        }
                      />
                      <ListItemText primary="Select All" />
                    </MenuItem>
                    {LEVEL_OPTIONS.map((l) => (
                      <MenuItem key={l.code} value={l.code}>
                        <Checkbox checked={formData.levelCodes.includes(l.code)} />
                        <ListItemText primary={l.label} />
                      </MenuItem>
                    ))}
                  </BOSTextField>
                </Stack>
              </Box>
              <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
                <BOSFileUpload
                  label="UPLOAD INDUCTION GUIDELINES / SOP"
                  files={formData.inductionAttachment ? [formData.inductionAttachment] : []}
                  onChange={(uploadedFiles) => {
                    const fileObj = uploadedFiles.length > 0 ? uploadedFiles[0] : null;
                    setFormData((prev) => ({ ...prev, inductionAttachment: fileObj }));
                    if (errors.inductionAttachment) clearErrors('inductionAttachment');
                  }}
                  multiple={false}
                  required={formData.attachmentRequired === 'YES'}
                  helperText={
                    errors.inductionAttachment ||
                    (formData.attachmentRequired === 'YES'
                      ? 'Reference document is MANDATORY'
                      : 'Optional reference document (PDF/Images)')
                  }
                  error={!!errors.inductionAttachment}
                  sx={errorStyle(!!errors.inductionAttachment)}
                />
              </Box>
            </Box>
          </BOSFormSection>
        </Stack>
      </BOSMovableDialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Inactivate Induction Criteria"
        message="Are you sure you want to inactivate this induction criteria?"
        itemName={deleteTarget?.inductionDetails}
      />
    </MainCard>
  );
}
