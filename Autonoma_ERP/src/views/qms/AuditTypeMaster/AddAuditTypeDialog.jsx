import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Slide,
  useTheme,
  Stack,
  Autocomplete,
  Checkbox
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  IconX,
  IconEdit,
  IconSettings,
  IconTrash,
  IconEraser,
  IconCheck
} from '@tabler/icons-react';
import axios from 'utils/axios';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddAuditTypeDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [formData, setFormData] = useState({
    auditType: '',
    standard: '',
    description: '',
    criteriaMinCount: 0,
    customerAuditArea: 'NO',
    auditArea: [],
    criteriaType: 'Fixed',
    status: 'ACTIVE'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [auditAreas, setAuditAreas] = useState([]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await axios.get('/api/master/qms/audit-area');
        setAuditAreas(res.data);
      } catch (error) {
        console.error('Failed to fetch areas:', error);
        setAuditAreas([]);
      }
    };
    if (open) fetchAreas();
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        auditType: initialData.auditType || '',
        standard: initialData.standard || '',
        description: initialData.description || '',
        criteriaMinCount: initialData.criteriaMinCount || 0,
        customerAuditArea: initialData.customerAuditArea || 'NO',
        auditArea: initialData.auditArea ? initialData.auditArea.split(', ') : [],
        criteriaType: initialData.criteriaType || 'Fixed',
        status: initialData.status || 'ACTIVE'
      });
      setIsEditing(false);
    } else {
      setFormData({
        auditType: '',
        standard: '',
        description: '',
        criteriaMinCount: 0,
        customerAuditArea: 'NO',
        auditArea: [],
        criteriaType: 'Fixed',
        status: 'ACTIVE'
      });
      setIsEditing(!readOnly);
    }
  }, [initialData, open, readOnly]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      auditType: '',
      standard: '',
      description: '',
      criteriaMinCount: 0,
      customerAuditArea: 'NO',
      auditArea: [],
      criteriaType: 'Fixed',
      status: 'ACTIVE'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this audit type?')) {
      try {
        await axios.delete(`/api/master/qms/audit-type/${formData.id}`);
        handleClose(true);
      } catch (error) {
        console.error('Failed to delete audit type:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.auditType?.trim()) {
      alert('Audit Type is required');
      return;
    }
    if (!formData.description?.trim()) {
      alert('Description is required');
      return;
    }

    try {
      const payload = {
        ...formData,
        auditArea: Array.isArray(formData.auditArea) ? formData.auditArea.join(', ') : formData.auditArea
      };

      if (formData.id) {
        await axios.put(`/api/master/qms/audit-type/${formData.id}`, payload);
      } else {
        await axios.post('/api/master/qms/audit-type', payload);
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save audit type:', error);
    }
  };

  const isViewOnly = readOnly && !isEditing;

  const darkStyles = {
    dialog: {
      bgcolor: isDark ? '#161b22' : theme.palette.background.paper,
      color: isDark ? '#c9d1d9' : theme.palette.text.primary
    },
    input: {
      width: '100% !important',
      '& .MuiOutlinedInput-root': {
        width: '100%',
        bgcolor: isDark ? 'background.default' : 'grey.50',
        color: 'text.primary',
        '& fieldset': { borderColor: 'divider' },
        '&:hover fieldset': { borderColor: isDark ? '#8b949e' : theme.palette.primary.main },
        '&.Mui-focused fieldset': { borderColor: isDark ? '#58a6ff' : theme.palette.primary.main },
        '& input': { py: 1.2, fontSize: '0.9rem' },
        '& .MuiSelect-select': { py: 1.2, fontSize: '0.9rem', width: '100%', minWidth: '150px' }
      },
      '& .MuiInputLabel-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
      '& .MuiSvgIcon-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary }
    },
    btnSave: {
      bgcolor: 'success.main',
      color: '#fff',
      '&:hover': { bgcolor: 'success.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
    },
    btnClear: {
      bgcolor: 'secondary.main',
      color: '#fff',
      '&:hover': { bgcolor: 'secondary.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s'
    },
    btnInactive: {
      bgcolor: 'error.main',
      color: '#fff',
      '&:hover': { bgcolor: 'error.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => handleClose()}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }
        }
      }}
      PaperProps={{
        sx: {
          height: 'auto',
          maxHeight: '95vh',
          bgcolor: darkStyles.dialog.bgcolor,
          backgroundImage: 'none',
          borderRadius: '24px',
          border: isDark ? '1px solid #30363d' : 'none',
          boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.5)' : '0 24px 48px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: isDark ? 'background.default' : 'primary.light',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2.5,
          px: 4
        }}
      >
        <Typography variant="h5" component="span" sx={{ fontWeight: 600, color: isDark ? '#58a6ff' : theme.palette.primary.main, fontSize: '1.25rem' }}>
          {initialData ? 'Edit Audit Type' : 'New Audit Type'}
        </Typography>
        <IconButton onClick={() => handleClose()} size="small" sx={{ color: isDark ? '#8b949e' : theme.palette.text.secondary }}>
          <IconX size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 5, bgcolor: darkStyles.dialog.bgcolor, width: '100%', overflowX: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4, width: '100%', alignItems: 'start' }}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconSettings size={20} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Type Details</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Stack spacing={2.5} sx={{ width: '100%' }}>
                  <TextField
                    name="auditType"
                    label="Audit Type"
                    fullWidth
                    size="small"
                    value={formData.auditType}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    sx={{ ...darkStyles.input, width: '100% !important' }}
                    required
                  />

                  <TextField
                    name="standard"
                    label="Standard"
                    fullWidth
                    size="small"
                    value={formData.standard}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    sx={{ ...darkStyles.input, width: '100% !important' }}
                  />

                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    sx={{ ...darkStyles.input, width: '100% !important' }}
                    required
                  />

                  <TextField
                    name="criteriaMinCount"
                    label="Criteria Minimum Count"
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.criteriaMinCount}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    sx={{ ...darkStyles.input, width: '100% !important' }}
                    required
                  />

                  <TextField
                    select
                    name="customerAuditArea"
                    label="Customer Audit Area"
                    fullWidth
                    size="small"
                    value={formData.customerAuditArea}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    sx={{ ...darkStyles.input, width: '100% !important' }}
                  >
                    <MenuItem value="YES">YES</MenuItem>
                    <MenuItem value="NO">NO</MenuItem>
                  </TextField>

                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={auditAreas}
                    getOptionLabel={(option) => option.description || ''}
                    value={auditAreas.filter((a) => (formData.auditArea || []).includes(a.description))}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, auditArea: newValue.map((v) => v.description) });
                    }}
                    disabled={isViewOnly}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Audit Area" 
                        size="small" 
                        sx={{ ...darkStyles.input, width: '100% !important' }} 
                      />
                    )}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                        {option.description}
                      </li>
                    )}
                    sx={{
                      '& .MuiOutlinedInput-root': { p: 0.5 },
                      '& .MuiAutocomplete-tag': {
                        bgcolor: isDark ? 'rgba(88, 166, 255, 0.2)' : 'primary.light',
                        color: isDark ? '#58a6ff' : 'primary.main',
                        fontWeight: 600,
                        height: 24
                      }
                    }}
                  />

                  <TextField
                    select
                    name="criteriaType"
                    label="Audit Criteria Type"
                    fullWidth
                    size="small"
                    value={formData.criteriaType}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    sx={{ ...darkStyles.input, width: '100% !important' }}
                  >
                    <MenuItem value="Fixed">Fixed</MenuItem>
                    <MenuItem value="Variable">Variable</MenuItem>
                  </TextField>

                  <TextField
                    select
                    name="status"
                    label="Status"
                    fullWidth
                    size="small"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    sx={{ ...darkStyles.input, width: '100% !important' }}
                  >
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  </TextField>
                </Stack>
              </Box>
            </Box>
          </Box>

        </Box>
      </DialogContent>

      <Box sx={{ p: 3, borderTop: isDark ? '1px solid #30363d' : `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: darkStyles.dialog.bgcolor }}>
        {isViewOnly ? (
          <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
            <Button onClick={() => setIsEditing(true)} variant="contained" sx={{...darkStyles.btnSave, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }}} startIcon={<IconEdit size={20} />}>
              Edit
            </Button>
            <Button onClick={() => handleClose()} variant="outlined" sx={{ ...darkStyles.btnInactive, color: isDark ? '#fff' : 'inherit' }} startIcon={<IconX size={20} />}>
              Close
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {formData.id && (
                <Button onClick={handleDelete} variant="contained" sx={darkStyles.btnInactive} startIcon={<IconTrash size={20} />}>
                  Delete
                </Button>
              )}
              <Button onClick={handleClear} variant="contained" sx={darkStyles.btnClear} startIcon={<IconEraser size={20} />}>
                Clear
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={handleSave} variant="contained" sx={darkStyles.btnSave} startIcon={<IconCheck size={20} />}>
                Save
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
};

AddAuditTypeDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddAuditTypeDialog;
