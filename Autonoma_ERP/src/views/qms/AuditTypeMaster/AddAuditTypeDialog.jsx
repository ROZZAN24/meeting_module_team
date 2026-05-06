import React, { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  Slide,
  Divider,
  MenuItem,
  useTheme,
  Select,
  OutlinedInput,
  ListItemText,
  Checkbox,
  Autocomplete
} from '@mui/material';
import { IconX, IconDeviceFloppy, IconEraser, IconTrash, IconEdit } from '@tabler/icons-react';
import axios from 'utils/axios';
import AnimateButton from 'ui-component/extended/AnimateButton';
import FormRow from 'ui-component/FormRow';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddAuditTypeDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
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
        auditArea: '',
        criteriaType: 'Fixed',
        status: 'ACTIVE'
      });
      setIsEditing(false);
    }
  }, [initialData, open]);

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
      auditArea: '',
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
    try {
      if (formData.id) {
        await axios.put(`/api/master/qms/audit-type/${formData.id}`, formData);
      } else {
        await axios.post('/api/master/qms/audit-type', formData);
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save audit type:', error);
    }
  };

  const isViewOnly = readOnly && !isEditing;

  return (
    <Dialog
      open={open}
      onClose={() => handleClose()}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          bgcolor: '#546e7a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5
        }}
        component="div"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconEdit size={24} />
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
            {initialData ? (isViewOnly ? 'View Audit Type' : 'Edit Audit Type') : 'Add Audit Type'}
          </Typography>
        </Box>
        <IconButton onClick={() => handleClose()} size="small" sx={{ color: 'inherit' }}>
          <IconX size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, overflowY: 'auto', maxHeight: '70vh' }}>
        <Box sx={{ border: '1px solid #cfd8dc', p: 4, borderRadius: 2, bgcolor: '#ffffff', boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' }}>
          <FormRow label="Audit Type" required>
            <TextField
              name="auditType"
              fullWidth
              variant="outlined"
              size="small"
              value={formData.auditType}
              onChange={handleChange}
              disabled={isViewOnly}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />
          </FormRow>

          <FormRow label="Standard">
            <TextField
              name="standard"
              fullWidth
              variant="outlined"
              size="small"
              value={formData.standard}
              onChange={handleChange}
              disabled={isViewOnly}
            />
          </FormRow>

          <FormRow label="Description" required>
            <TextField
              name="description"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              size="small"
              value={formData.description}
              onChange={handleChange}
              disabled={isViewOnly}
            />
          </FormRow>

          <FormRow label="Criteria Minimum Count" required>
            <TextField
              name="criteriaMinCount"
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              value={formData.criteriaMinCount}
              onChange={handleChange}
              disabled={isViewOnly}
            />
          </FormRow>

          <FormRow label="Customer Audit Area">
            <TextField
              select
              name="customerAuditArea"
              fullWidth
              size="small"
              value={formData.customerAuditArea}
              onChange={handleChange}
              disabled={isViewOnly}
            >
              <MenuItem value="YES">YES</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </TextField>
          </FormRow>

          <FormRow label="Audit Area">
            <Autocomplete
              multiple
              disableCloseOnSelect
              id="audit-area-select"
              options={auditAreas}
              getOptionLabel={(option) => option.description || ''}
              value={auditAreas.filter((a) => (formData.auditArea || []).includes(a.description))}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  auditArea: newValue.map((v) => v.description)
                });
              }}
              disabled={isViewOnly}
              renderInput={(params) => (
                <TextField {...params} size="small" placeholder="Search & Select Areas" sx={{ bgcolor: isViewOnly ? '#f5f5f5' : '#fff' }} />
              )}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                  {option.description}
                </li>
              )}
              sx={{
                '& .MuiOutlinedInput-root': {
                  p: 0.5,
                  '& .MuiAutocomplete-tag': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 600,
                    height: 24
                  }
                }
              }}
            />
          </FormRow>

          <FormRow label="Audit Criteria Type">
            <TextField
              select
              name="criteriaType"
              fullWidth
              size="small"
              value={formData.criteriaType}
              onChange={handleChange}
              disabled={isViewOnly}
            >
              <MenuItem value="Fixed">Fixed</MenuItem>
              <MenuItem value="Variable">Variable</MenuItem>
            </TextField>
          </FormRow>

          <FormRow label="Status">
            <TextField select name="status" fullWidth size="small" value={formData.status} onChange={handleChange} disabled={isViewOnly}>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            </TextField>
          </FormRow>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, px: 4, justifyContent: 'space-between', bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <AnimateButton>
            <Button
              variant="contained"
              sx={{ bgcolor: '#546e7a', '&:hover': { bgcolor: '#455a64' }, minWidth: 120 }}
              onClick={handleClear}
              startIcon={<IconEraser size={20} />}
            >
              Clear
            </Button>
          </AnimateButton>

          {!isViewOnly && formData.id && (
            <AnimateButton>
              <Button
                variant="outlined"
                color="error"
                sx={{ minWidth: 120, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                onClick={handleDelete}
                startIcon={<IconTrash size={20} />}
              >
                Delete
              </Button>
            </AnimateButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {isViewOnly ? (
            <AnimateButton>
              <Button
                variant="contained"
                sx={{ bgcolor: '#546e7a', '&:hover': { bgcolor: '#455a64' }, px: 4, borderRadius: 1.5 }}
                onClick={() => setIsEditing(true)}
                startIcon={<IconEdit size={20} />}
              >
                Edit
              </Button>
            </AnimateButton>
          ) : (
            <AnimateButton>
              <Button
                variant="contained"
                sx={{ bgcolor: '#546e7a', '&:hover': { bgcolor: '#455a64' }, px: 4, borderRadius: 1.5 }}
                onClick={handleSave}
                startIcon={<IconDeviceFloppy size={20} />}
              >
                Save
              </Button>
            </AnimateButton>
          )}
        </Box>
      </DialogActions>
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
