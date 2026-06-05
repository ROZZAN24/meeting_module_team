import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, Grid, MenuItem, Box, Checkbox, ListItemText, Chip } from '@mui/material';
import { IconClipboardCheck, IconRefresh, IconPlus, IconDeviceFloppy, IconEraser, IconEye } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import { BOSDataTable, BOSFormDialog, BOSTextField, BOSFormSection, BOSFileUpload, BOSFilePreview, errorStyle, BOSStatusField, BOSTableToolbar, getCommonDateFilters, matchCommonDateFilters } from 'ui-component/bos';
import { useLookups } from 'hooks/useLookups';
import useBOSValidation from 'hooks/useBOSValidation';
import { setFilterConfig } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import { Navigate } from 'react-router-dom';

// ==============================|| INDUCTION CRITERIA MASTER ||============================== //



const INITIAL_STATE = {
  id: null,
  inductionDetails: '',
  answer: '',
  departmentCodes: [], // Will be joined as string for API
  levelCodes: [],      // Will be joined as string for API
  attachmentRequired: 'NO',
  status: 'ACTIVE',
  inductionAttachment: []
};

const FALLBACK_ROUND_OPTIONS = ['HR', 'QMS', 'DEPARTMENT', 'MANAGEMENT'];
const LEVEL_OPTIONS = [
  { code: 'L1', label: 'L1 - Trainee' },
  { code: 'L2', label: 'L2 - Junior Executive' },
  { code: 'L3', label: 'L3 - Executive' },
  { code: 'L4', label: 'L4 - Senior Executive' },
  { code: 'L5', label: 'L5 - Assistant Manager' },
  { code: 'L6', label: 'L6 - Manager & Above' },
  { code: 'L7', label: 'L7 - Director / VP & Above' }
];

const VALIDATION_RULES = [
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
    if (levels && levels.length > 0) {
      return levels.map(dl => {
        const matchingLegacy = LEVEL_OPTIONS.find(l => l.code === dl.level);
        return {
          code: dl.level,
          label: matchingLegacy ? matchingLegacy.label : dl.level
        };
      });
    }
    return LEVEL_OPTIONS;
  }, [levels]);

  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.ATS_INDUCTION_CRITERIA);

  const columns = useMemo(() => [
    { id: 'serialNo', label: 'Serial No', bold: true, color: 'primary.main', minWidth: 100 },
    { id: 'inductionDetails', label: 'Induction Details', required: true, bold: true, minWidth: 250 },
    { id: 'answer', label: 'Answer', required: true, minWidth: 200 },
    { id: 'departmentCodes', label: 'Department', minWidth: 150 },
    { id: 'levelCodes', label: 'Level', minWidth: 120 },
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
      minWidth: 100,
      render: (row) => {
        const label = row.status === 'ACTIVE' ? 'Active' : 'Inactive';
        const bg = row.status === 'ACTIVE' ? '#E8F5E9' : '#FFEBEE';
        const text = row.status === 'ACTIVE' ? '#2E7D32' : '#C62828';
        return (
          <Chip
            label={label}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: bg,
              color: text,
              borderRadius: '4px'
            }}
          />
        );
      }
    },
    { id: 'createdUser', label: 'CREATED USER', minWidth: 120 },
    { id: 'createdAt', label: 'CREATED DATE', minWidth: 150 },
    { id: 'updatedUser', label: 'UPDATED USER', minWidth: 120 },
    { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 150 }
  ], [handlePreviewFile]);

  // Dispatch starred filter configuration matching Status
  useEffect(() => {
    const config = [{
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'IN ACTIVE', label: 'INACTIVE' }
        ],
        defaultValue: 'All',
        isStarred: true
      },
      ...getCommonDateFilters('createdAt', 'updatedAt')];
    dispatch(setFilterConfig(config));
    return () => {
      dispatch(setFilterConfig(null));
    };
  }, [dispatch]);

  const fetchRows = useCallback(async () => {
    if (!perms.enabled) {
      setRows([]);
      return;
    }
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
  }, [dispatch, perms.enabled]);

  useEffect(() => {
    if (!perms.loading) {
      fetchRows();
    }
  }, [fetchRows, perms.loading]);

  // No inductionRound needed

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
    // Find the original raw row to get raw serial codes instead of resolved department names
    const originalRow = rows.find(r => r.id === row.id) || row;
    const deptCodes = originalRow.departmentCodes ? originalRow.departmentCodes.split(',').filter(Boolean) : [];
    const deptIds = deptCodes.map(
      (code) => departments.find((d) => d.departmentNo === code)?.id?.toString() || code
    );
    const order = LEVEL_OPTIONS.map(l => l.code);
    const rawLevels = originalRow.levelCodes ? originalRow.levelCodes.split(',').filter(Boolean) : [];
    const sortedLevels = [...rawLevels].sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const aNum = parseInt(a.replace(/^\D+/g, ''), 10) || 0;
      const bNum = parseInt(b.replace(/^\D+/g, ''), 10) || 0;
      return aNum - bNum;
    });

    setFormData({
      ...originalRow,
      departmentCodes: deptIds,
      levelCodes: sortedLevels,
      inductionAttachment: originalRow.inductionAttachment
        ? originalRow.inductionAttachment.split(',').filter(Boolean).map((path) => ({
            id: path,
            serverFileName: path,
            fileName: path.split('/').pop(),
            isServer: true
          }))
        : []
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

  const handleDepartmentChange = (e) => {
    const { value } = e.target;
    if (value.includes('ALL')) {
      if (formData.departmentCodes.length === departments.length) {
        setFormData(prev => ({ ...prev, departmentCodes: [] }));
      } else {
        setFormData(prev => ({ ...prev, departmentCodes: departments.map(d => d.id.toString()) }));
      }
    } else {
      setFormData(prev => ({ ...prev, departmentCodes: value }));
    }
    if (errors.departmentCodes) clearErrors('departmentCodes');
  };

  const handleLevelChange = (e) => {
    const { value } = e.target;
    let newLevels = [];
    if (value.includes('ALL')) {
      if (formData.levelCodes.length === levelOptions.length) {
        newLevels = [];
      } else {
        newLevels = levelOptions.map(l => l.code);
      }
    } else {
      newLevels = value;
    }
    const order = LEVEL_OPTIONS.map(l => l.code);
    const sortedLevels = [...newLevels].sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const aNum = parseInt(a.replace(/^\D+/g, ''), 10) || 0;
      const bNum = parseInt(b.replace(/^\D+/g, ''), 10) || 0;
      return aNum - bNum;
    });
    setFormData(prev => ({ ...prev, levelCodes: sortedLevels }));
    if (errors.levelCodes) clearErrors('levelCodes');
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;

    const selectedLevels = formData.levelCodes || [];
    if (selectedLevels.includes('L1') && selectedLevels.length < 2) {
      dispatch(openSnackbar({
        open: true,
        message: 'Minimum 2 levels must be selected when Level L1 is chosen.',
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'error'
      }));
      setErrors(prev => ({ ...prev, levelCodes: 'Minimum 2 levels required for L1' }));
      return;
    }
    if ((selectedLevels.includes('L6') || selectedLevels.includes('L7')) && selectedLevels.length < 3) {
      dispatch(openSnackbar({
        open: true,
        message: 'Minimum 3 levels must be selected when Level L6 or L7 is chosen.',
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'error'
      }));
      setErrors(prev => ({ ...prev, levelCodes: 'Minimum 3 levels required for L6/L7' }));
      return;
    }

    if (formData.attachmentRequired === 'YES' && (!formData.inductionAttachment || formData.inductionAttachment.length === 0)) {
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
        departmentCodes: formData.departmentCodes
          .map((id) => departments.find((d) => d.id.toString() === id)?.departmentNo || id)
          .join(','),
        levelCodes: formData.levelCodes.join(','),
        inductionAttachment: Array.isArray(formData.inductionAttachment)
          ? formData.inductionAttachment.map((f) => f.serverFileName || f).filter(Boolean).join(',')
          : (formData.inductionAttachment?.serverFileName || formData.inductionAttachment || '')
      };

      // Clean up audit fields and helper fields before sending to backend
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.createdUser;
      delete payload.updatedUser;
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
      dispatch(openSnackbar({ open: true, message: 'Induction Criteria Deleted Successfully', variant: 'alert', severity: 'success' }));
      setDeleteDialogOpen(false);
      fetchRows();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Failed to delete';
      dispatch(openSnackbar({ open: true, message: msg, variant: 'alert', severity: 'error' }));
    }
  };

  const resolvedRows = useMemo(() => {
    return rows.map((r, i) => {
      // Resolve comma-separated department serial codes (e.g. "DEPT-01") to actual department names
      const deptNames = r.departmentCodes
        ? r.departmentCodes
            .split(',')
            .map((code) => {
              const match = departments.find((d) => d.departmentNo === code.trim());
              return match ? match.departmentName.toUpperCase() : code.toUpperCase();
            })
            .join(', ')
        : '-';

      return {
        ...r,
        index: i + 1,
        serialNo: (i + 1).toString(),
        departmentCodes: deptNames, // Render friendly department names in table row
        createdUser: r.createdUser || r.createdBy || '-',
        updatedUser: r.updatedUser || r.updatedBy || '-',
        createdAt: r.createdAt || '-',
        updatedAt: r.updatedAt || '-'
      };
    });
  }, [rows, departments]);

  if (perms.loading) {
    return null;
  }

  return (
    <MainCard fullWidth
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconClipboardCheck size={24} />
          <Typography variant="h3">Induction Criteria</Typography>
        </Stack>
      }
      secondary={
        <BOSTableToolbar
          onRefresh={fetchRows}
          onNew={handleOpenAdd}
          newLabel="+ New"
          hasWritePermission={perms.write}
          exportData={resolvedRows}
          
          exportFilename="Induction_Criteria"
          hasExportPermission={perms.export}
         columns={columns} />
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
                value={
                  formData.id
                    ? formData.id.toString()
                    : nextSequence
                    ? nextSequence.toString()
                    : '1'
                }
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
            {/* Induction round field removed */}
            <Box sx={{ flex: 1 }}>
              <BOSStatusField
                isCreate={!formData.id}
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
              </BOSStatusField>
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
                  onChange={handleDepartmentChange}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => {
                      if (!selected || selected.length === 0) return <em>-Select-</em>;
                      if (selected.length === departments.length) return 'All Departments';
                      return selected.map(id => (departments.find(d => d.id.toString() === id)?.departmentName || id).toUpperCase()).join(', ');
                    }
                  }}
                  required
                  helperText={errors.departmentCodes || "Select departments this applies to"}
                  error={!!errors.departmentCodes}
                  sx={errorStyle(!!errors.departmentCodes)}
                >
                  {departments.length > 0 && (
                    <MenuItem value="ALL">
                      <Checkbox checked={formData.departmentCodes.length === departments.length} indeterminate={formData.departmentCodes.length > 0 && formData.departmentCodes.length < departments.length} />
                      <ListItemText primary="Select All" sx={{ '& .MuiTypography-root': { fontWeight: 'bold' } }} />
                    </MenuItem>
                  )}
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id.toString()}>
                      <Checkbox checked={formData.departmentCodes.includes(d.id.toString())} />
                      <ListItemText primary={d.departmentName.toUpperCase()} secondary={d.departmentNo} />
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
                      if (!selected || selected.length === 0) return <em>-Select-</em>;
                      return selected.map(code => levelOptions.find(l => l.code === code)?.label || code).join(', ');
                    }
                  }}
                  required
                  helperText={errors.levelCodes || "Select levels this applies to"}
                  error={!!errors.levelCodes}
                  sx={errorStyle(!!errors.levelCodes)}
                >
                  {levelOptions.length > 0 && (
                    <MenuItem value="ALL">
                      <Checkbox checked={formData.levelCodes.length === levelOptions.length} indeterminate={formData.levelCodes.length > 0 && formData.levelCodes.length < levelOptions.length} />
                      <ListItemText primary="Select All" sx={{ '& .MuiTypography-root': { fontWeight: 'bold' } }} />
                    </MenuItem>
                  )}
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
                  files={formData.inductionAttachment || []}
                  onChange={(uploadedFiles) => {
                    setFormData((prev) => ({ ...prev, inductionAttachment: uploadedFiles }));
                    if (errors.inductionAttachment) clearErrors('inductionAttachment');
                  }}
                  multiple={true}
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
        title="Delete Induction Criteria"
        message="Are you sure you want to delete this induction criteria?"
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

