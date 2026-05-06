import { useState, useEffect, forwardRef } from 'react';
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
  MenuItem,
  Slide,
  Divider,
  useTheme
} from '@mui/material';
import { IconX, IconDeviceFloppy, IconEraser, IconEdit, IconTrash } from '@tabler/icons-react';
import axios from 'utils/axios';
import AnimateButton from 'ui-component/extended/AnimateButton';

import FormRow from 'ui-component/FormRow';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddDepartmentDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentNo: 0,
    ndaCertificate: 'No',
    sequenceNo: 0,
    status: 'Active'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        departmentName: initialData.departmentName || '',
        departmentNo: initialData.departmentNo || 0,
        ndaCertificate: initialData.ndaCertificate || 'No',
        sequenceNo: initialData.sequenceNo || 0,
        status: initialData.status || 'Active'
      });
      setIsEditing(false);
    } else {
      setFormData({
        departmentName: '',
        departmentNo: 0,
        ndaCertificate: 'No',
        sequenceNo: 0,
        status: 'Active'
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
      departmentName: '',
      departmentNo: 0,
      ndaCertificate: 'No',
      sequenceNo: 0,
      status: 'Active'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`/api/hrm/departments/${formData.id}`);
        handleClose(true);
      } catch (error) {
        console.error('Failed to delete department:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/hrm/departments', formData);
      handleClose(true);
    } catch (error) {
      console.error('Failed to save department:', error);
    }
  };

  const isViewOnly = readOnly && !isEditing;

  return (
    <Dialog
      open={open}
      onClose={() => handleClose()}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
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
            {initialData ? (isViewOnly ? 'View Department' : 'Edit Department') : 'Add Department'}
          </Typography>
        </Box>
        <IconButton onClick={() => handleClose()} size="small" sx={{ color: 'inherit' }}>
          <IconX size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, overflowY: 'auto', maxHeight: '70vh' }}>
        <Box sx={{ border: '1px solid #cfd8dc', p: 4, borderRadius: 2, bgcolor: '#ffffff', boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' }}>
          <FormRow label="Dept. Name" required>
            <TextField
              name="departmentName"
              fullWidth
              variant="outlined"
              size="small"
              value={formData.departmentName}
              onChange={handleChange}
              disabled={isViewOnly}
              placeholder="Enter Department Name"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />
          </FormRow>

          <FormRow label="Dept. No" required>
            <TextField
              name="departmentNo"
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              value={formData.departmentNo}
              onChange={handleChange}
              disabled={isViewOnly}
              placeholder="Enter Dept No"
            />
          </FormRow>

          <FormRow label="NDA Certificate">
            <TextField
              select
              name="ndaCertificate"
              fullWidth
              size="small"
              value={formData.ndaCertificate}
              onChange={handleChange}
              disabled={isViewOnly}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </FormRow>

          <FormRow label="Seq. No">
            <TextField
              name="sequenceNo"
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              value={formData.sequenceNo}
              onChange={handleChange}
              disabled={isViewOnly}
            />
          </FormRow>

          <FormRow label="Status">
            <TextField select name="status" fullWidth size="small" value={formData.status} onChange={handleChange} disabled={isViewOnly}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="In Active">In Active</MenuItem>
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

AddDepartmentDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddDepartmentDialog;
