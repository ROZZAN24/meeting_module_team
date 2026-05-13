import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  Grid, 
  Typography, 
  MenuItem, 
  InputAdornment, 
  IconButton, 
  Avatar, 
  Tooltip,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
  Slider
} from '@mui/material';
import { 
  IconPhoto, 
  IconPencil, 
  IconShieldLock, 
  IconCrop,
  IconX
} from '@tabler/icons-react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Cropper from 'react-easy-crop';

import autonomaLogo from 'assets/images/logo.png';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_BASE } from 'utils/api-base';
import getCroppedImg from 'utils/cropImage';
import { autoUploadFile, getUserImageUrl } from 'utils/upload-helper';
import useAuth from 'hooks/useAuth';

export default function AddUserDialog({ open, onClose, editingUser, employees, fetchUsers }) {
  const dispatch = useDispatch();
  const { user: currentUser, updateProfile } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Crop states
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const initialData = {
    userId: editingUser?.userId || '',
    empId: editingUser?.empId || '',
    password: editingUser?.password || '',
    status: editingUser?.status ?? 1,
    imgName: editingUser?.imgName || ''
  };

  const [formData, setFormData] = useState(initialData);
  const { errors, validate, clearErrors, setErrors } = useBOSValidation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) clearErrors(name);
  };

  const validateForm = () => {
    const rules = [
      { field: 'userId', label: 'User ID', required: true, minLength: 3, maxLength: 50 },
      { field: 'empId', label: 'Employee', required: true },
      { field: 'password', label: 'Password', required: !editingUser, minLength: editingUser ? 0 : 5 },
      { field: 'status', label: 'Status', required: true }
    ];
    return validate(formData, rules);
  };

  // Sync form data when editingUser changes
  React.useEffect(() => {
    if (open) {
      setFormData(initialData);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingUser]);

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await axios.put(`/api/users/update/${editingUser.userId}`, { 
          empId: Number(formData.empId), 
          password: formData.password, 
          status: Number(formData.status), 
          imgName: formData.imgName 
        });
      } else {
        await axios.post('/api/users/create', { 
          userId: formData.userId, 
          empId: Number(formData.empId), 
          password: formData.password, 
          status: Number(formData.status), 
          imgName: formData.imgName 
        });
      }

      if (editingUser?.userId === currentUser?.id || formData.userId === currentUser?.id) {
        updateProfile({ imgName: formData.imgName });
      }

      console.log(`[AddUserDialog] User ${editingUser ? 'Update' : 'Creation'} Successful:`, formData.userId);
      dispatch(openSnackbar({ 
        open: true, 
        message: `User ${editingUser ? 'updated' : 'created'} successfully`, 
        variant: 'alert', 
        severity: 'success',
        alert: { variant: 'filled' }
      }));
      
      console.log('[AddUserDialog] Refreshing users list...');
      await fetchUsers();
      console.log('[AddUserDialog] Closing dialog.');
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      // Robust error message extraction
      let msg = 'Save failed';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') msg = err.response.data;
        else if (typeof err.response.data === 'object') {
          msg = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
        }
      } else {
        msg = err.message || 'Save failed';
      }
      
      dispatch(openSnackbar({ 
        open: true, 
        message: msg, 
        variant: 'alert', 
        severity: 'error',
        alert: { variant: 'filled' }
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Image Cropping Logic ──
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const uploadedPath = await autoUploadFile(croppedBlob, 'USER_PROFILE');
      setFormData(prev => ({ ...prev, imgName: uploadedPath }));
      setIsCropOpen(false);
      dispatch(openSnackbar({ open: true, message: 'Image cropped & uploaded', variant: 'alert', severity: 'success' }));
    } catch (err) {
      console.error('Crop failed', err);
      dispatch(openSnackbar({ open: true, message: 'Crop failed', variant: 'alert', severity: 'error' }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <BOSFormDialog
        open={open}
        onClose={onClose}
        title={editingUser ? 'Edit User Credential' : 'New User Account'}
        icon={<IconShieldLock size={20} />}
        maxWidth="md"
        onSave={handleSave}
        isSaving={isSubmitting}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 4, height: '100%', borderRadius: 3, bgcolor: 'background.paper', 
              border: '2px dashed', borderColor: 'primary.light', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 
            }}>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                PROFILE IDENTITY
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <Tooltip
                  title={formData.imgName ? (
                    <Paper elevation={12} sx={{ p: 0.5, bgcolor: 'white', borderRadius: 2 }}>
                      <img src={getUserImageUrl(formData.imgName)} alt="Preview" style={{ maxWidth: 300, maxHeight: 300, borderRadius: 4, display: 'block' }} />
                    </Paper>
                  ) : null}
                  arrow placement="right"
                >
                  <Avatar 
                    src={formData.imgName ? getUserImageUrl(formData.imgName) : autonomaLogo} 
                    sx={{ width: 130, height: 130, border: '4px solid white', bgcolor: 'primary.light', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', cursor: formData.imgName ? 'pointer' : 'default' }}
                  >
                    <IconPhoto size={50} />
                  </Avatar>
                </Tooltip>
                <IconButton component="label" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, width: 36, height: 36, border: '3px solid white' }}>
                  <IconPencil size={16} />
                  <input type="file" hidden accept="image/*" onChange={(e) => { handleFileSelect(e); e.target.value = ''; }} />
                </IconButton>
              </Box>
              <Typography variant="h3" fontWeight={800} color="primary.main">{formData.userId || 'User Name'}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <BOSFormSection title="Account Credentials">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <BOSTextField
                    select
                    name="empId"
                    label="Employee Selection"
                    value={formData.empId}
                    onChange={(e) => {
                      const emp = employees.find(emp => emp.id === e.target.value);
                      handleChange({ target: { name: 'empId', value: e.target.value } });
                      if (emp && emp.profileUpload) {
                        setFormData(prev => ({ ...prev, imgName: emp.profileUpload }));
                      }
                    }}
                    error={errors.empId}
                  >
                    {employees.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>{emp.employeeName} ({emp.empCode})</MenuItem>
                    ))}
                  </BOSTextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <BOSTextField
                    name="userId"
                    label="User ID"
                    value={formData.userId}
                    onChange={handleChange}
                    error={errors.userId}
                    disabled={Boolean(editingUser)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <BOSTextField
                    name="password"
                    label={editingUser ? 'Update Password' : 'Password'}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    InputProps={{ 
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <BOSTextField
                    select
                    name="status"
                    label="Account Status"
                    value={formData.status}
                    onChange={handleChange}
                    error={errors.status}
                  >
                    <MenuItem value={1}>ACTIVE</MenuItem>
                    <MenuItem value={0}>SUSPENDED</MenuItem>
                  </BOSTextField>
                </Grid>
              </Grid>
            </BOSFormSection>
          </Grid>
        </Grid>
      </BOSFormDialog>

      {/* ── CROP DIALOG ── */}
      <Dialog open={isCropOpen} onClose={() => setIsCropOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 0, overflow: 'hidden' } }}>
        <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid #eee' }}>
          <Typography variant="h4" fontWeight={800}>Crop Profile Picture</Typography>
          <IconButton onClick={() => setIsCropOpen(false)}><IconX size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 400, position: 'relative', bgcolor: '#000' }}>
          {imageToCrop && (
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 2 }}>
          <Box sx={{ width: '100%', px: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" fontWeight={700}>ZOOM</Typography>
              <Slider value={zoom} min={1} max={3} step={0.1} onChange={(e, v) => setZoom(v)} sx={{ color: 'primary.main' }} />
            </Stack>
          </Box>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button fullWidth variant="outlined" color="inherit" onClick={() => setIsCropOpen(false)} sx={{ borderRadius: '10px', fontWeight: 700 }}>Cancel</Button>
            <Button 
              fullWidth variant="contained" color="primary" disabled={isUploading}
              startIcon={isUploading ? <CircularProgress size={18} color="inherit" /> : <IconCrop size={18} />}
              sx={{ borderRadius: '10px', fontWeight: 700 }}
              onClick={handleApplyCrop}
            >
              {isUploading ? 'Uploading...' : 'Apply Crop'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

AddUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingUser: PropTypes.object,
  employees: PropTypes.array.isRequired,
  fetchUsers: PropTypes.func.isRequired
};
