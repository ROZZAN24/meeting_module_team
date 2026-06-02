import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { IconClipboardCheck, IconRefresh, IconPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import { BOSDataTable, BOSFormDialog, BOSTextField, BOSFileUpload, errorStyle, BOSStatusField, BOSTableToolbar, getCommonDateFilters, matchCommonDateFilters } from 'ui-component/bos';
import { useLookups } from 'hooks/useLookups';
import useBOSValidation from 'hooks/useBOSValidation';
import { setFilterConfig, setFilters } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| INTERVIEW CRITERIA MASTER ||============================== //

const INITIAL_STATE = {
  id: null,
  criteriaDetails: '',
  answer: '',
  departmentCodes: [], // Maps to department ID strings in UI state
  levelCodes: [],      // Maps to designation level rowId strings in UI state
  interviewRound: '',
  attachmentRequired: 'NO',
  status: 'ACTIVE',
  interviewAttachment: '' // For file upload
};

const ROUND_OPTIONS = ['TECHNICAL', 'HR', 'MANAGEMENT', 'SPECIAL ROUND'];

const VALIDATION_RULES = [
  { field: 'interviewRound', label: 'Interview Round', required: true },
  { field: 'criteriaDetails', label: 'Criteria Details', required: true, maxLength: 300 },
  { field: 'answer', label: 'Answer', required: true, maxLength: 2000 },
  { field: 'departmentCodes', label: 'Department', required: true, validate: (val) => (!val || val.length === 0 ? 'At least one department is required' : null) },
  { field: 'levelCodes', label: 'Level', required: true, validate: (val) => (!val || val.length === 0 ? 'At least one level is required' : null) },
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
    { id: 'criteriaDetails', label: 'Criteria', required: true, bold: true, minWidth: 250 },
    { id: 'answer', label: 'Answer', required: true, minWidth: 250 },
    { id: 'departmentCodes', label: 'Department', minWidth: 150 },
    {
      id: 'levelCodes',
      label: 'Level',
      minWidth: 120,
      render: (row) => {
        if (!row.levelCodes) return '-';
        return row.levelCodes.split(',').map(c => c.trim()).join(', ');
      }
    },
    { id: 'interviewRound', label: 'Round', minWidth: 120 },
    { id: 'attachmentRequired', label: 'Attachment Required', minWidth: 120 },
    { id: 'createdUser', label: 'CREATED USER', minWidth: 120 },
    { id: 'createdAt', label: 'CREATED DATE', minWidth: 150 },
    { id: 'updatedUser', label: 'UPDATED USER', minWidth: 120 },
    { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 150 },
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
        id: 'criteriaDetails',
        label: 'Criteria',
        type: 'text',
        isStarred: true,
        isRequired: true
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ],
        defaultValue: 'ACTIVE',
        isStarred: true
      },
      {
        id: 'createdAt',
        label: 'CREATED DATE',
        type: 'dateRange',
        isStarred: true
      },
      {
        id: 'updatedAt',
        label: 'UPDATED DATE',
        type: 'dateRange',
        isStarred: false
      }
    ];

    dispatch(setFilterConfig(config));

    // Get current local date in YYYY-MM-DD format
    // Adjusting for local timezone offset to avoid UTC date mismatch issues
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const todayStr = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

    dispatch(setFilters({
      status: 'ACTIVE',
      createdAtStart: todayStr,
      createdAtEnd: todayStr,
      createdAtConsider: 'Yes'
    }));

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
      const res = await axios.get('/api/master/hr/designation-levels');
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
    const originalRow = rows.find(r => r.id === row.id) || row;

    // Map department code back to department database ID string
    const rawDepts = originalRow.departmentCodes ? originalRow.departmentCodes.split(',').map(s => s.trim()).filter(Boolean) : [];
    const deptIdVals = rawDepts.map(
      (code) => departments.find((d) => d.departmentNo === code)?.id?.toString() || code
    );

    // Map designation level code back to level row_id string
    const rawLevels = originalRow.levelCodes ? originalRow.levelCodes.split(',').map(s => s.trim()).filter(Boolean) : [];
    const levelIdVals = rawLevels.map(
      (lvlName) => levels.find((l) => l.level === lvlName)?.rowId?.toString() || lvlName
    );

    setFormData({
      ...originalRow,
      departmentCodes: deptIdVals,
      levelCodes: levelIdVals,
      interviewAttachment: originalRow.interviewAttachment ? {
        serverFileName: originalRow.interviewAttachment,
        fileName: originalRow.interviewAttachment.split('/').pop(),
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

  const handleDepartmentChange = (e) => {
    const { value } = e.target;
    if (value.includes('ALL')) {
      if (formData.departmentCodes.length === departments.length) {
        setFormData(prev => ({ ...prev, departmentCodes: [] }));
      } else {
        setFormData(prev => ({ ...prev, departmentCodes: departments.map(d => d.id.toString()) }));
      }
    } else {
      setFormData(prev => ({ ...prev, departmentCodes: typeof value === 'string' ? value.split(',') : value }));
    }
    if (errors.departmentCodes) clearErrors('departmentCodes');
  };

  const handleLevelChange = (e) => {
    const { value } = e.target;
    if (value.includes('ALL')) {
      if (formData.levelCodes.length === levels.length) {
        setFormData(prev => ({ ...prev, levelCodes: [] }));
      } else {
        setFormData(prev => ({ ...prev, levelCodes: levels.map(l => l.rowId.toString()) }));
      }
    } else {
      const selectedIds = typeof value === 'string' ? value.split(',') : value;
      const order = levels.map(l => l.rowId.toString());
      const sortedIds = [...selectedIds].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      setFormData(prev => ({ ...prev, levelCodes: sortedIds }));
    }
    if (errors.levelCodes) clearErrors('levelCodes');
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
      const selectedDepts = formData.departmentCodes
        .map(id => departments.find(d => d.id.toString() === id.toString())?.departmentNo || id)
        .join(',');
      const selectedLevels = formData.levelCodes
        .map(rowId => levels.find(l => l.rowId.toString() === rowId.toString())?.level || rowId)
        .join(',');

      const payload = {
        ...formData,
        answer: formData.answer || '-',
        departmentCodes: selectedDepts,
        levelCodes: selectedLevels,
        interviewAttachment: formData.interviewAttachment?.serverFileName || formData.interviewAttachment
      };

      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.createdBy;
      delete payload.updatedBy;
      delete payload.createdUser;
      delete payload.updatedUser;
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
    return rows.map((r, i) => {
      const deptNames = r.departmentCodes
        ? r.departmentCodes
            .split(',')
            .map((code) => {
              const match = departments.find((d) => d.departmentNo === code.trim());
              return match ? match.departmentName : code;
            })
            .join(', ')
        : '-';

      return {
        ...r,
        index: i + 1,
        serialNo: r.id.toString(),
        departmentCodes: deptNames,
        createdUser: r.createdUser || r.createdBy || '-',
        updatedUser: r.updatedUser || r.updatedBy || '-',
        createdAt: r.createdAt || '-',
        updatedAt: r.updatedAt || '-'
      };
    });
  }, [rows, departments]);

  return (
    <MainCard fullWidth
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconClipboardCheck size={24} />
          <Typography variant="h3">Interview Criteria</Typography>
        </Stack>
      }
            secondary={
        <BOSTableToolbar
          onRefresh={fetchRows}
          onNew={handleOpenAdd}
          newLabel="New"
          hasWritePermission={perms.write}
          exportData={resolvedRows}
          exportFilename="Interview_Criteria"
          hasExportPermission={perms.export}
        />
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
            name="answer"
            label="ANSWER"
            placeholder="Enter expected answer or guidelines (2000 characters max)..."
            value={formData.answer}
            onChange={handleInputChange}
            multiline
            rows={4}
            required
            fullWidth
            inputProps={{ maxLength: 2000 }}
            error={!!errors.answer}
            helperText={errors.answer || `${formData.answer?.length || 0}/2000 characters`}
            sx={errorStyle(!!errors.answer)}
          />

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
                return selected.map(id => departments.find(d => d.id.toString() === id.toString())?.departmentName || id).join(', ');
              }
            }}
            required
            helperText={errors.departmentCodes || "Select departments"}
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
                <ListItemText primary={d.departmentName} />
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
                if (selected.length === levels.length) return 'All Levels';
                return selected.map(id => levels.find(l => l.rowId.toString() === id.toString())?.level || id).join(', ');
              }
            }}
            required
            helperText={errors.levelCodes || "Select designation levels"}
            error={!!errors.levelCodes}
            sx={errorStyle(!!errors.levelCodes)}
          >
            {levels.length > 0 && (
              <MenuItem value="ALL">
                <Checkbox checked={formData.levelCodes.length === levels.length} indeterminate={formData.levelCodes.length > 0 && formData.levelCodes.length < levels.length} />
                <ListItemText primary="Select All" sx={{ '& .MuiTypography-root': { fontWeight: 'bold' } }} />
              </MenuItem>
            )}
            {levels.map((l) => (
              <MenuItem key={l.rowId} value={l.rowId.toString()}>
                <Checkbox checked={formData.levelCodes.includes(l.rowId.toString())} />
                <ListItemText primary={l.level} />
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

          <BOSStatusField
            isCreate={!formData.id}
            type="string-upper"
            name="status"
            label="STATUS"
            value={formData.status}
            onChange={handleInputChange}
            error={!!errors.status}
            helperText={errors.status}
            sx={errorStyle(!!errors.status)}
          />
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
