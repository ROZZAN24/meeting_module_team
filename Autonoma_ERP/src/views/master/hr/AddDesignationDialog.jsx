import { useState, useEffect } from 'react';
import { MenuItem, Box, Stack } from '@mui/material';
import { IconBriefcase, IconInfoCircle } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';

const VALIDATION_RULES = [
  { field: 'designationName', label: 'Designation Name', required: true },
  { field: 'subCategoryLevel', label: 'Sub Category Level', required: true }
];

const LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];

export default function AddDesignationDialog({ open, handleClose, initialData }) {
  const dispatch = useDispatch();
  const { errors, validate, clearErrors } = useBOSValidation();
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    designationCode: '',
    designationName: '',
    experience: '',
    appearInCompetency: 'YES',
    displaySlNo: '',
    qualification: '',
    jobDescription: '',
    subCategoryLevel: '',
    budgetedPositions: '',
    orgSeqNo: ''
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          ...initialData,
          displaySlNo: initialData.displaySlNo || '',
          budgetedPositions: initialData.budgetedPositions || '',
          orgSeqNo: initialData.orgSeqNo || ''
        });
      } else {
        setFormData({
          designationCode: '',
          designationName: '',
          experience: '',
          appearInCompetency: 'YES',
          displaySlNo: '',
          qualification: '',
          jobDescription: '',
          subCategoryLevel: '',
          budgetedPositions: '',
          orgSeqNo: ''
        });
        fetchNextCode();
      }
      clearErrors();
    }
  }, [open, initialData, clearErrors]);

  const fetchNextCode = async () => {
    setFormData(prev => ({ ...prev, designationCode: 'Generating...', displaySlNo: '' }));
    try {
      const [codeRes, slRes] = await Promise.all([
        axios.get('/api/master/hr/designation/next-code'),
        axios.get('/api/master/hr/designation/next-sl-no')
      ]);
      setFormData(prev => ({ ...prev, designationCode: codeRes.data, displaySlNo: slRes.data }));
    } catch (e) {
      console.error('Failed to fetch next code or serial number');
      setFormData(prev => ({ ...prev, designationCode: '1', displaySlNo: '1' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;

    try {
      if (isEditing) {
        await axios.put(`/api/master/hr/designation/${initialData.id}`, formData);
      } else {
        await axios.post('/api/master/hr/designation', formData);
      }
      dispatch(openSnackbar({ open: true, message: `Designation ${isEditing ? 'updated' : 'saved'} successfully!`, severity: 'success', variant: 'alert' }));
      handleClose(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save designation', severity: 'error', variant: 'alert' }));
    }
  };

  const handleClear = () => {
    setFormData({
      designationCode: formData.designationCode, // keep generated code
      designationName: '',
      experience: '',
      appearInCompetency: 'YES',
      displaySlNo: formData.displaySlNo, // keep generated sl no
      qualification: '',
      jobDescription: '',
      subCategoryLevel: '',
      budgetedPositions: '',
      orgSeqNo: ''
    });
    clearErrors();
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      onSave={handleSave}
      onClear={handleClear}
      title={isEditing ? 'Edit Designation' : 'Add New Designation'}
      maxWidth="md"
    >
      <Stack spacing={3}>
        <BOSFormSection icon={<IconBriefcase size={20} />} title="Primary Information">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
            <BOSTextField label="Designation Code" name="designationCode" value={formData.designationCode} inputProps={{ readOnly: true }} />
            <BOSTextField
              required
              label="Designation Name"
              name="designationName"
              value={formData.designationName}
              onChange={handleChange}
              error={!!errors.designationName}
              helperText={errors.designationName}
            />
            <BOSTextField
              select
              required
              label="Sub Category Level"
              name="subCategoryLevel"
              value={formData.subCategoryLevel}
              onChange={handleChange}
              error={!!errors.subCategoryLevel}
              helperText={errors.subCategoryLevel}
            >
              {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </BOSTextField>
            <BOSTextField label="Experience" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 2-5 Years" />
          </Box>
        </BOSFormSection>

        <BOSFormSection icon={<IconInfoCircle size={20} />} title="Additional Details">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2.5 }}>
            <BOSTextField select label="Appear in Competency" name="appearInCompetency" value={formData.appearInCompetency} onChange={handleChange}>
              <MenuItem value="YES">YES</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </BOSTextField>
            <BOSTextField type="number" label="Display Serial Number" name="displaySlNo" value={formData.displaySlNo} onChange={handleChange} />
            <BOSTextField type="number" label="Organization Sequence Number" name="orgSeqNo" value={formData.orgSeqNo} onChange={handleChange} />
            <BOSTextField label="Qualification" name="qualification" value={formData.qualification} onChange={handleChange} />
            <BOSTextField type="number" label="Number of Positions (Budget)" name="budgetedPositions" value={formData.budgetedPositions} onChange={handleChange} />
          </Box>
          <Box sx={{ mt: 2.5 }}>
            <BOSTextField multiline rows={3} label="Job Description" name="jobDescription" value={formData.jobDescription} onChange={handleChange} fullWidth />
          </Box>
        </BOSFormSection>
      </Stack>
    </BOSFormDialog>
  );
}
