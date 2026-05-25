import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, Grid, MenuItem, Box, Checkbox, ListItemText } from '@mui/material';
import { IconClipboardCheck, IconRefresh, IconPlus, IconDeviceFloppy, IconEraser, IconEye } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import {
  BOSDataTable,
  BOSExportButton,
  btnNew,
  BOSFormDialog,
  BOSTextField,
  BOSFormSection,
  BOSFileUpload,
  BOSFilePreview,
  errorStyle
} from 'ui-component/bos';
import { useLookups } from 'hooks/useLookups';
import useBOSValidation from 'hooks/useBOSValidation';
import { setFilterConfig } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| INDUCTION CRITERIA MASTER ||============================== //



const INITIAL_STATE = {
  id: null,
  inductionDetails: '',
  answer: '',
  departmentCodes: [], // Will be joined as string for API
  levelCodes: [],      // Will be joined as string for API
  inductionRound: '',
  attachmentRequired: 'NO',
  status: 'ACTIVE',
  inductionAttachment: '' // For file upload
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
  { field: 'departmentCodes', label: 'Department', required: true, validate: (val) => (!val || val.length === 0 ? 'At least one department is required' : null) },
  { field: 'levelCodes', label: 'Level', required: true, validate: (val) => (!val || val.length === 0 ? 'At least one level is required' : null) },
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
  const { errors, validate, clearErrors, setErrors } = useBOSValidation();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const handlePreviewFile = useCallback((attachmentPath) => {
    setPreviewFile({
      serverFileName: attachmentPath,
      fileName: attachmentPath.split('/').pop(),
      isServer: true
    });
    setPreviewOpen(true);
  }, []);

  const { departments = [], levels = [] } = useLookups(['DEPARTMENTS', 'LEVELS']);

  const levelOptions = useMemo(() => {
    if (!levels || levels.length === 0) {
      return [
        { code: 'L1', label: 'L1 - Trainee' },
        { code: 'L2', label: 'L2 - Junior Executive' },
        { code: 'L3', label: 'L3 - Executive' },
        { code: 'L4', label: 'L4 - Senior Executive' },
        { code: 'L5', label: 'L5 - Assistant Manager' },
        { code: 'L6', label: 'L6 - Manager & Above' }
      ];
    }
    return levels.map(l => ({
      code: l.level,
      label: l.level
    }));
  }, [levels]);

  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.ATS_INDUCTION_CRITERIA);

  const columns = useMemo(() => [
    { id: 'index', label: 'Sl.No', minWidth: 60 },
    { id: 'serialNo', label: 'Serial No', bold: true, color: 'primary.main', minWidth: 100 },
    { id: 'inductionDetails', label: 'Induction Details', required: true, bold: true, minWidth: 250 },
    { id: 'answer', label: 'Answer', required: true, minWidth: 200 },
    { id: 'departmentCodes', label: 'Department', minWidth: 150 },
    { id: 'levelCodes', label: 'Level', minWidth: 120 },
    { id: 'inductionRound', label: 'Round', minWidth: 120 },
    { id: 'attachmentRequired', label: 'Attach Req.', minWidth: 100 },
    {
      id: 'inductionAttachment',
      label: 'Attachment',
      minWidth: 120,
      render: (row) => {
        if (!row.inductionAttachment) return '-';
        const fileName = row.inductionAttachment.split('/').pop();
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName}
            </Typography>
            <Tooltip title="View Attachment">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewFile(row.inductionAttachment);
                }}
              >
                <IconEye size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      }
    },
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
  ], [handlePreviewFile]);

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
    // Map codes back to IDs for the dropdown state
    const deptCodes = row.departmentCodes ? row.departmentCodes.split(',').filter(Boolean) : [];
    const deptIds = deptCodes.map(code => departments.find(d => d.departmentCode === code)?.id?.toString() || code);

    setFormData({
      ...row,
      departmentCodes: deptIds,
      levelCodes: row.levelCodes ? row.levelCodes.split(',').filter(Boolean) : [],
      inductionAttachment: row.inductionAttachment ? {
        serverFileName: row.inductionAttachment,
        fileName: row.inductionAttachment.split('/').pop(),
        isServer: true
      } : null
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'departmentCodes') {
      if (value.includes('ALL')) {
        if (formData.departmentCodes.length === departments.length) {
          setFormData(prev => ({ ...prev, departmentCodes: [] }));
        } else {
          setFormData(prev => ({ ...prev, departmentCodes: departments.map(d => d.id.toString()) }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) clearErrors(name);
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
      setErrors(prev => ({ ...prev, inductionAttachment: 'File required' }));
      return;
    }

    try {
      const payload = {
        ...formData,
        departmentCodes: formData.departmentCodes.map(id => departments.find(d => d.id.toString() === id)?.departmentCode || id).join(','),
        levelCodes: formData.levelCodes.join(','),
        inductionAttachment: formData.inductionAttachment?.serverFileName || formData.inductionAttachment
      };

      // Clean up audit fields and helper fields before sending to backend
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.createdBy;
      delete payload.updatedBy;
      delete payload.index; // from table mapper

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
      const msg = error.response?.data?.message || error.response?.data || 'Failed to save induction criteria';
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
      await axios.delete(`/api/hr/induction-master/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Induction Criteria Inactivated Successfully', variant: 'alert', severity: 'success' }));
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
      serialNo: `IND-${r.id.toString().padStart(3, '0')}`,
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : '-',
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'
    }));
  }, [rows]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconClipboardCheck size={24} />
          <Typography variant="h3">Induction Criteria</Typography>
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
          {perms.export && <BOSExportButton
            data={resolvedRows}
            filename="Induction_Criteria"
            columns={columns.filter(c => c.id !== 'index').map(c => ({ header: c.label, key: c.id }))}
          />}
          <Button variant="contained" color="primary" onClick={handleOpenAdd} sx={btnNew} startIcon={<IconPlus size={18} />}>
            + New
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
        title={formData.id ? 'Edit Induction Details' : 'Add Induction Details'}
        fullWidth
        maxWidth="lg"
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
        <BOSFormSection title="1. Basic Information">
          <Box sx={{ display: 'flex', gap: 2.5, width: '100%' }}>
            <Box sx={{ flex: 1 }}>
              <BOSTextField
                name="id"
                label="SERIAL NO"
                value={formData.id ? `IND-${formData.id.toString().padStart(3, '0')}` : (nextSequence ? `IND-${nextSequence.toString().padStart(3, '0')}` : 'IND-001')}
                disabled
                InputProps={{
                  readOnly: true,
                  sx: {
                    bgcolor: 'rgba(33, 150, 243, 0.04)',
                    fontWeight: 700,
                    color: 'primary.main',
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'var(--primary-main)',
                    }
                  }
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
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
            <Box sx={{ flex: 1 }}>
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
            <Box sx={{ flex: 1 }}>
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
          <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
            <Box sx={{ flex: 1 }}>
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
            <Box sx={{ flex: 1 }}>
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
          <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
            <Box sx={{ flex: 1 }}>
              <Stack spacing={2.5} sx={{ width: '100%' }}>
                <BOSTextField
                  select
                  name="departmentCodes"
                  label="DEPARTMENT"
                  value={formData.departmentCodes}
                  onChange={handleInputChange}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => {
                      if (!selected || selected.length === 0) return <em>-Select-</em>;
                      if (selected.length === departments.length) return 'All Departments';
                      return selected.map(id => departments.find(d => d.id.toString() === id)?.departmentName || id).join(', ');
                    }
                  }}
                  required
                  helperText={errors.departmentCodes || "Select departments this applies to"}
                  error={!!errors.departmentCodes}
                  sx={errorStyle(!!errors.departmentCodes)}
                >
                  <MenuItem value="ALL">
                    <Checkbox checked={formData.departmentCodes.length === departments.length} indeterminate={formData.departmentCodes.length > 0 && formData.departmentCodes.length < departments.length} />
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
                  onChange={handleInputChange}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => {
                      if (selected.length === 0) return <em>-Select-</em>;
                      return selected.map(code => levelOptions.find(l => l.code === code)?.label || code).join(', ');
                    }
                  }}
                  required
                  helperText={errors.levelCodes || "Select levels this applies to"}
                  error={!!errors.levelCodes}
                  sx={errorStyle(!!errors.levelCodes)}
                >
                  {levelOptions.map((l) => (
                    <MenuItem key={l.code} value={l.code}>
                      <Checkbox checked={formData.levelCodes.includes(l.code)} />
                      <ListItemText primary={l.label} />
                    </MenuItem>
                  ))}
                </BOSTextField>
              </Stack>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
                <BOSFileUpload
                  label="UPLOAD INDUCTION GUIDELINES / SOP"
                  files={formData.inductionAttachment ? [formData.inductionAttachment] : []}
                  onChange={(uploadedFiles) => {
                    const fileObj = uploadedFiles.length > 0 ? uploadedFiles[0] : null;
                    setFormData(prev => ({ ...prev, inductionAttachment: fileObj }));
                    if (errors.inductionAttachment) clearErrors('inductionAttachment');
                  }}
                  multiple={false}
                  required={formData.attachmentRequired === 'YES'}
                  helperText={errors.inductionAttachment || (formData.attachmentRequired === 'YES' ? "Reference document is MANDATORY" : "Optional reference document (PDF/Images)")}
                  error={!!errors.inductionAttachment}
                  sx={errorStyle(!!errors.inductionAttachment)}
                />
              </Box>
            </Box>
          </Box>
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Inactivate Induction Criteria"
        message="Are you sure you want to inactivate this induction criteria?"
        itemName={deleteTarget?.inductionDetails}
      />

      <BOSFilePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={previewFile}
      />
    </MainCard>
  );
}

