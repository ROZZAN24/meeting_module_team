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
  Stack
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

const AddAuditAreaDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [formData, setFormData] = useState({
    type: 'AREA',
    description: '',
    status: 'ACTIVE'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        type: initialData.type || 'AREA',
        description: initialData.description || '',
        status: initialData.status || 'ACTIVE'
      });
      setIsEditing(false);
    } else {
      setFormData({
        type: 'AREA',
        description: '',
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
      type: 'AREA',
      description: '',
      status: 'ACTIVE'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this audit area?')) {
      try {
        await axios.delete(`/api/master/qms/audit-area/${formData.id}`);
        handleClose(true);
      } catch (error) {
        console.error('Failed to delete audit area:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.description?.trim()) {
      alert('Description is required');
      return;
    }

    try {
      if (formData.id) {
        await axios.put(`/api/master/qms/audit-area/${formData.id}`, formData);
      } else {
        await axios.post('/api/master/qms/audit-area', formData);
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save audit area:', error);
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
          {initialData ? 'Edit Audit Area' : 'New Audit Area'}
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Area Details</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Stack spacing={2.5} sx={{ width: '100%' }}>
                  <TextField
                    select
                    name="type"
                    label="Type"
                    fullWidth
                    size="small"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    sx={{ ...darkStyles.input, width: '100% !important' }}
                    required
                  >
                    <MenuItem value="AREA">AREA</MenuItem>
                    <MenuItem value="ZONE">ZONE</MenuItem>
                  </TextField>

                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    sx={{ ...darkStyles.input, width: '100% !important' }}
                    required
                  />

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

AddAuditAreaDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddAuditAreaDialog;
