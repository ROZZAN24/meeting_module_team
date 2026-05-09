import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, TextField, Button, Typography, Stack, MenuItem, useTheme, IconButton, Avatar, Tooltip } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { IconDeviceFloppy, IconX, IconUserPlus, IconPhotoPlus, IconSignature } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useLookups } from 'hooks/useLookups';
import { API_PATHS } from 'utils/api-constants';

const initialFormState = {
  categoryId: '',
  empLevelId: '',
  employeeTypeId: '',
  title: '',
  employeeName: '',
  fatherHusbandName: '',
  empCode: '',
  departmentId: '',
  designationId: '',
  dateOfJoining: '',
  confirmationDate: '',
  unitId: '',
  referMode: '',
  profileUpload: '',
  signature: ''
};

const EmployeeMaster = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('id');

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState({ profileUpload: null, signature: null });

  // PROFESSIONAL LOOKUP FETCH
  const { departments = [], designations = [], loading: lookupsLoading } = useLookups(['DEPARTMENTS', 'DESIGNATIONS']);

  // Fetch employee if ID exists (Edit Mode)
  useEffect(() => {
    if (employeeId) {
      const fetchEmployee = async () => {
        try {
          const response = await axios.get(`${API_PATHS.HRM.EMPLOYEES}/${employeeId}`);
          const data = response.data;
          // Format dates to YYYY-MM-DD if present
          if (data.dateOfJoining) data.dateOfJoining = data.dateOfJoining.split('T')[0];
          if (data.confirmationDate) data.confirmationDate = data.confirmationDate.split('T')[0];
          setFormData({ ...initialFormState, ...data });
        } catch (error) {
          console.error('Error fetching employee data:', error);
        }
      };
      fetchEmployee();
    }
  }, [employeeId]);

  // BOS Standard 4: Shortcut Keys (Ctrl+S, Esc)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const isSaveDisabled =
          loading ||
          !formData.categoryId ||
          !formData.empLevelId ||
          !formData.employeeTypeId ||
          !formData.title ||
          !formData.employeeName ||
          !formData.fatherHusbandName ||
          !formData.empCode;

        if (!isSaveDisabled) {
          handleSave();
        }
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, loading]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [type]: url }));
      // Optionally store file name or base64 in formData if backend supports it
      setFormData((prev) => ({ ...prev, [type]: file.name }));
    }
  };

  const handleRemoveFile = (type) => {
    setPreviews((prev) => ({ ...prev, [type]: null }));
    setFormData((prev) => ({ ...prev, [type]: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setPreviews({ profileUpload: null, signature: null });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };

      // Convert empty strings to null for numeric IDs and dates
      ['categoryId', 'empLevelId', 'employeeTypeId', 'departmentId', 'designationId', 'unitId'].forEach((field) => {
        if (payload[field] === '') payload[field] = null;
      });
      ['dateOfJoining', 'confirmationDate'].forEach((field) => {
        if (payload[field] === '') payload[field] = null;
      });

      if (employeeId) {
        await axios.put(`${API_PATHS.HRM.EMPLOYEES}/${employeeId}`, payload);
        alert('Employee details updated successfully');
      } else {
        await axios.post(API_PATHS.HRM.EMPLOYEES, payload);
        alert('Employee details saved successfully');
        handleClear();
      }
      // Navigate back to overview after slight delay to ensure user sees alert
      setTimeout(() => navigate('/master/hr/employee'), 500);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUserPlus size={24} />
          <Typography variant="h3">Employee Master</Typography>
        </Stack>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SubCard title="Employee Details" sx={{ border: '1px solid', borderColor: theme.palette.divider }}>
            <Grid container spacing={2}>
              {/* === ROW 1 === */}
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 'bold' }}>
                  Category *
                </Typography>
                <TextField select fullWidth name="categoryId" value={formData.categoryId} onChange={handleChange} required size="small">
                  <MenuItem value={1}>Staff</MenuItem>
                  <MenuItem value={2}>Worker</MenuItem>
                  <MenuItem value={3}>Management</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 'bold' }}>
                  Emp Level *
                </Typography>
                <TextField select fullWidth name="empLevelId" value={formData.empLevelId} onChange={handleChange} required size="small">
                  <MenuItem value={1}>Level 1</MenuItem>
                  <MenuItem value={2}>Level 2</MenuItem>
                  <MenuItem value={3}>Level 3</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 'bold' }}>
                  Employee Type *
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="employeeTypeId"
                  value={formData.employeeTypeId}
                  onChange={handleChange}
                  required
                  size="small"
                >
                  <MenuItem value={1}>Permanent</MenuItem>
                  <MenuItem value={2}>Contract</MenuItem>
                  <MenuItem value={3}>Trainee</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 'bold' }}>
                  Title *
                </Typography>
                <TextField select fullWidth name="title" value={formData.title} onChange={handleChange} required size="small">
                  <MenuItem value="Mr">Mr</MenuItem>
                  <MenuItem value="Ms">Ms</MenuItem>
                  <MenuItem value="Mrs">Mrs</MenuItem>
                  <MenuItem value="Mx">Mx</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8} md={4}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 'bold' }}>
                  Employee Name *
                </Typography>
                <TextField
                  fullWidth
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  required
                  size="small"
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>

              {/* === ROW 2 === */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 'bold' }}>
                  Father/Husband Name *
                </Typography>
                <TextField
                  fullWidth
                  name="fatherHusbandName"
                  value={formData.fatherHusbandName}
                  onChange={handleChange}
                  required
                  size="small"
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 'bold' }}>
                  Emp Code *
                </Typography>
                <TextField
                  fullWidth
                  name="empCode"
                  value={formData.empCode}
                  onChange={handleChange}
                  required
                  size="small"
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={6} sm={6} md={2}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                  Department
                </Typography>
                <TextField select fullWidth name="departmentId" value={formData.departmentId} onChange={handleChange} size="small">
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={6} md={2}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                  Designation
                </Typography>
                <TextField select fullWidth name="designationId" value={formData.designationId} onChange={handleChange} size="small">
                  {designations.map((desig) => (
                    <MenuItem key={desig.id} value={desig.id}>
                      {desig.designationName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* === ROW 3 === */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                  Date of Joining
                </Typography>
                <TextField fullWidth name="dateOfJoining" type="date" value={formData.dateOfJoining} onChange={handleChange} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                  Confirmation Date
                </Typography>
                <TextField
                  fullWidth
                  name="confirmationDate"
                  type="date"
                  value={formData.confirmationDate}
                  onChange={handleChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                  Unit Name
                </Typography>
                <TextField select fullWidth name="unitId" value={formData.unitId} onChange={handleChange} size="small">
                  <MenuItem value={1}>Unit 1</MenuItem>
                  <MenuItem value={2}>Unit 2</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                  Refer Mode
                </Typography>
                <TextField select fullWidth name="referMode" value={formData.referMode} onChange={handleChange} size="small">
                  <MenuItem value="Direct">Direct</MenuItem>
                  <MenuItem value="Consultancy">Consultancy</MenuItem>
                  <MenuItem value="Reference">Reference</MenuItem>
                </TextField>
              </Grid>

              {/* === ROW 4 === */}
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  {previews.profileUpload ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={previews.profileUpload} sx={{ width: 40, height: 40 }} variant="rounded" />
                      <IconButton color="error" size="small" onClick={() => handleRemoveFile('profileUpload')} sx={{ bgcolor: '#ffebee' }}>
                        <IconX size={16} />
                      </IconButton>
                      <Button size="small" variant="text" onClick={() => window.open(previews.profileUpload, '_blank')}>
                        View
                      </Button>
                    </Stack>
                  ) : (
                    <>
                      <IconButton color="primary" component="label" sx={{ bgcolor: '#f5f5f5' }}>
                        <input hidden accept="image/*" type="file" onChange={(e) => handleFileChange(e, 'profileUpload')} />
                        <IconPhotoPlus />
                      </IconButton>
                      <Typography variant="body2" color="textSecondary">
                        Profile Upload
                      </Typography>
                    </>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  {previews.signature ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={previews.signature} sx={{ width: 40, height: 40 }} variant="rounded" />
                      <IconButton color="error" size="small" onClick={() => handleRemoveFile('signature')} sx={{ bgcolor: '#ffebee' }}>
                        <IconX size={16} />
                      </IconButton>
                      <Button size="small" variant="text" onClick={() => window.open(previews.signature, '_blank')}>
                        View
                      </Button>
                    </Stack>
                  ) : (
                    <>
                      <IconButton color="primary" component="label" sx={{ bgcolor: '#f5f5f5' }}>
                        <input hidden accept="image/*" type="file" onChange={(e) => handleFileChange(e, 'signature')} />
                        <IconSignature />
                      </IconButton>
                      <Typography variant="body2" color="textSecondary">
                        Signature Upload
                      </Typography>
                    </>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </SubCard>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Tooltip title="Clear (Esc)">
              <Button variant="outlined" color="inherit" startIcon={<IconX size={18} />} onClick={handleClear} sx={{ borderRadius: 2 }}>
                Clear
              </Button>
            </Tooltip>
            <Tooltip title="Save (Ctrl + S)">
              <span>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<IconDeviceFloppy size={18} />}
                  onClick={handleSave}
                  disabled={
                    loading ||
                    !formData.categoryId ||
                    !formData.empLevelId ||
                    !formData.employeeTypeId ||
                    !formData.title ||
                    !formData.employeeName ||
                    !formData.fatherHusbandName ||
                    !formData.empCode
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default EmployeeMaster;
