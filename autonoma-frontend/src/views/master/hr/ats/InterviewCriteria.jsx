import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, MenuItem } from '@mui/material';
import { IconClipboardCheck, IconRefresh, IconPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import {
  BOSDataTable,
  BOSFormDialog,
  BOSTextField,
  BOSFileUpload,
  errorStyle
} from 'ui-component/bos';
import { useLookups } from 'hooks/useLookups';
import useBOSValidation from 'hooks/useBOSValidation';
import { setFilterConfig } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| INTERVIEW CRITERIA MASTER ||============================== //

const INITIAL_STATE = {
  id: null,
  criteriaDetails: '',
  answer: '',
  departmentCodes: '', // Maps to department ID string in UI state
  levelCodes: '',      // Maps to designation level rowId string in UI state
  interviewRound: '',
  attachmentRequired: 'NO',
  status: 'ACTIVE',
  interviewAttachment: '' // For file upload
};

const ROUND_OPTIONS = ['TECHNICAL', 'HR', 'MANAGEMENT', 'SPECIAL ROUND'];

const VALIDATION_RULES = [
  { field: 'interviewRound', label: 'Interview Round', required: true },
  { field: 'criteriaDetails', label: 'Criteria Details', required: true, maxLength: 300 },
  { field: 'departmentCodes', label: 'Department', required: true },
  { field: 'levelCodes', label: 'Level', required: true },
  { field: 'status', label: 'Status', required: true }
];

export default function InterviewCriteria() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nextSequence, setNextSequence] = useState(null);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [levels, setLevels] = useState([]);
  const { errors, validate, clearErrors, setErrors } = useBOSValidation();

  const { departments = [] } = useLookups(['DEPARTMENTS']);

  const perms = usePagePermissions(PAGE_CODES.ATS_INTERVIEW_CRITERIA);

  // Dynamic columns definition using useMemo to display department name and level instead of codes
  const columns = useMemo(() => [
    { id: 'index', label: 'Sl.No', minWidth: 60 },
    { id: 'serialNo', label: 'Serial No', bold: true, color: 'primary.main', minWidth: 100 },
    { id: 'criteriaDetails', label: 'Criteria', required: true, bold: true, minWidth: 250 },
    {
      id: 'departmentCodes',
      label: 'Department',
      minWidth: 150,
      render: (row) => {
        const dept = departments.find((d) => d.departmentNo === row.departmentCodes);
        return dept ? dept.departmentName : (row.departmentCodes || '-');
      }
    },
    {
      id: 'levelCodes',
      label: 'Level',
      minWidth: 120,
      render: (row) => {
        const lvl = levels.find((l) => l.level === row.levelCodes);
        return lvl ? lvl.level : (row.levelCodes || '-');
      }
    },
    { id: 'interviewRound', label: 'Round', minWidth: 120 },
    { id: 'attachmentRequired', label: 'Attachment Required', minWidth: 120 },
    { id: 'createdBy', label: 'Created User', minWidth: 120 },
    { id: 'createdAt', label: 'Created Date', minWidth: 150 },
    { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
    { id: 'updatedAt', label: 'Updated Date', minWidth: 150 },
    {
      id: 'status',
      label: 'Status',
      required: true,
      hide: true,
      minWidth: 100,
      render: (row) => (row.status === 'ACTIVE' ? 'Active' : 'Inactive')
    }
  ], [departments, levels]);

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
      const response = await axios.get('/api/hr/interview-master');
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch interview criteria:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load data', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchLevels = useCallback(async () => {
    try {
      const res = await axios.get('/api/master/hr/designationlevel');
      setLevels(res.data || []);
    } catch (err) {
      console.error('Failed to fetch designation levels:', err);
    }
  }, []);

  useEffect(() => {
    fetchRows();
    fetchLevels();
  }, [fetchRows, fetchLevels]);

  const handleOpenAdd = async () => {
    setFormData(INITIAL_STATE);
    setErrors({});
    try {
      const res = await axios.get('/api/hr/interview-master/next-sequence');
      setNextSequence(res.data);
    } catch (err) {
      console.error('Failed to fetch next sequence:', err);
    }
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => {
    // Map department code back to department database ID string
    const matchedDept = departments.find(d => d.departmentNo === row.departmentCodes);
    const deptIdVal = matchedDept ? matchedDept.id.toString() : (row.departmentCodes || '');

    // Map designation level code back to level row_id string
    const matchedLevel = levels.find(l => l.level === row.levelCodes);
    const levelIdVal = matchedLevel ? matchedLevel.rowId.toString() : (row.levelCodes || '');

    setFormData({
      ...row,
      departmentCodes: deptIdVal,
      levelCodes: levelIdVal,
      interviewAttachment: row.interviewAttachment ? {
        serverFileName: row.interviewAttachment,
        fileName: row.interviewAttachment.split('/').pop(),
        isServer: true
      } : null
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

    if (formData.attachmentRequired === 'YES' && !formData.interviewAttachment) {
      dispatch(openSnackbar({
        open: true,
        message: 'Attachment is mandatory when Attachment Required is set to YES',
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'error'
      }));
      setErrors(prev => ({ ...prev, interviewAttachment: 'File required' }));
      return;
    }

    try {
      const selectedDeptObj = departments.find(d => d.id.toString() === formData.departmentCodes);
      const selectedLevelObj = levels.find(l => l.rowId.toString() === formData.levelCodes);

      const payload = {
        ...formData,
        answer: formData.answer || '-',
        departmentCodes: selectedDeptObj ? selectedDeptObj.departmentNo : formData.departmentCodes,
        levelCodes: selectedLevelObj ? selectedLevelObj.level : formData.levelCodes,
        interviewAttachment: formData.interviewAttachment?.serverFileName || formData.interviewAttachment
      };

      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.createdBy;
      delete payload.updatedBy;
      delete payload.index;

      if (formData.id) {
        await axios.put(`/api/hr/interview-master/${formData.id}`, payload);
        dispatch(openSnackbar({
          open: true,
          message: 'Interview Criteria Updated Successfully',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success'
        }));
      } else {
        await axios.post('/api/hr/interview-master', payload);
        dispatch(openSnackbar({
          open: true,
          message: 'Interview Criteria Saved Successfully',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success'
        }));
      }
      setDialogOpen(false);
      fetchRows();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Failed to save interview criteria';
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
      await axios.delete(`/api/hr/interview-master/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Interview Criteria Deleted Successfully', variant: 'alert', severity: 'success' }));
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
      serialNo: r.id.toString(),
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : '-',
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'
    }));
  }, [rows]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconClipboardCheck size={24} />
          <Typography variant="h3">Interview Criteria</Typography>
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
        title={formData.id ? 'Edit Interview Details' : 'Add Interview Details'}
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
        <Stack spacing={2.5} sx={{ mt: 1.5 }}>
          <BOSTextField
            name="id"
            label="SERIAL NUMBER"
            value={formData.id ? formData.id.toString() : (nextSequence ? nextSequence.toString() : '1')}
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

          <BOSTextField
            name="criteriaDetails"
            label="CRITERIA DETAILS"
            placeholder="Enter 300 characters only..."
            value={formData.criteriaDetails}
            onChange={handleInputChange}
            multiline
            rows={3}
            required
            fullWidth
            inputProps={{ maxLength: 300 }}
            error={!!errors.criteriaDetails}
            helperText={errors.criteriaDetails || `${formData.criteriaDetails.length}/300 characters`}
            sx={errorStyle(!!errors.criteriaDetails)}
          />

          <BOSTextField
            select
            name="departmentCodes"
            label="DEPARTMENT"
            value={formData.departmentCodes}
            onChange={handleInputChange}
            required
            helperText={errors.departmentCodes || "Select department"}
            error={!!errors.departmentCodes}
            sx={errorStyle(!!errors.departmentCodes)}
          >
            <MenuItem value="">-Select-</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id.toString()}>
                {d.departmentName}
              </MenuItem>
            ))}
          </BOSTextField>

          <BOSTextField
            select
            name="levelCodes"
            label="LEVEL"
            value={formData.levelCodes}
            onChange={handleInputChange}
            required
            helperText={errors.levelCodes || "Select designation level"}
            error={!!errors.levelCodes}
            sx={errorStyle(!!errors.levelCodes)}
          >
            <MenuItem value="">-Select-</MenuItem>
            {levels.map((l) => (
              <MenuItem key={l.rowId} value={l.rowId.toString()}>
                {l.level}
              </MenuItem>
            ))}
          </BOSTextField>

          <BOSTextField
            select
            name="interviewRound"
            label="INTERVIEW ROUND"
            value={formData.interviewRound}
            onChange={handleInputChange}
            required
            error={!!errors.interviewRound}
            helperText={errors.interviewRound || 'Select Round'}
            sx={errorStyle(!!errors.interviewRound)}
          >
            <MenuItem value="">-Select-</MenuItem>
            {ROUND_OPTIONS.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </BOSTextField>

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

          <BOSFileUpload
            label="UPLOAD DOCUMENT"
            files={formData.interviewAttachment ? [formData.interviewAttachment] : []}
            onChange={(uploadedFiles) => {
              const fileObj = uploadedFiles.length > 0 ? uploadedFiles[0] : null;
              setFormData(prev => ({ ...prev, interviewAttachment: fileObj }));
              if (errors.interviewAttachment) clearErrors('interviewAttachment');
            }}
            multiple={false}
            required={formData.attachmentRequired === 'YES'}
            helperText={errors.interviewAttachment || (formData.attachmentRequired === 'YES' ? "Reference document is MANDATORY" : "Optional reference document")}
            error={!!errors.interviewAttachment}
            sx={errorStyle(!!errors.interviewAttachment)}
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
        title="Delete Interview Criteria"
        message="Are you sure you want to completely remove this interview criteria?"
        itemName={deleteTarget?.criteriaDetails}
      />
    </MainCard>
  );
}
