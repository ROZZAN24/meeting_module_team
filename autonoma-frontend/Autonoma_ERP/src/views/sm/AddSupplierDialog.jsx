import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Stack,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconX, IconDeviceFloppy, IconUserCircle } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { getDialogStyles, getInputStyles, btnSave, btnCancel } from 'ui-component/bos/BOSStyles';

// ==============================|| SM - ADD/EDIT SUPPLIER DIALOG ||============================== //

export default function AddSupplierDialog({ open, handleClose, initialData, readOnly }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isDark = theme.palette.mode === 'dark';
  const styles = getDialogStyles(theme, isDark);
  const inputStyles = getInputStyles(theme, isDark);

  const [formData, setFormData] = useState({
    supplierName: '',
    supplierCode: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstNo: '',
    status: 'Active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        supplierName: '',
        supplierCode: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        gstNo: '',
        status: 'Active'
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (initialData?.id) {
        await axios.put(`/api/sm/suppliers/${initialData.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Supplier updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post('/api/sm/suppliers', formData);
        dispatch(openSnackbar({ open: true, message: 'Supplier created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Error saving supplier:', error);
      dispatch(openSnackbar({ open: true, message: 'Error saving supplier.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => handleClose(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: styles.paper }}
    >
      <Box sx={styles.titleBar}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUserCircle size={24} color={theme.palette.primary.main} />
          <Typography sx={styles.titleText}>
            {readOnly ? 'View Supplier' : initialData ? 'Edit Supplier' : 'Add New Supplier'}
          </Typography>
        </Stack>
        <IconButton onClick={() => handleClose(false)} size="small" sx={styles.closeBtn}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={styles.content}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              disabled={readOnly}
              sx={inputStyles}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Supplier Code"
              name="supplierCode"
              value={formData.supplierCode}
              onChange={handleChange}
              disabled={readOnly}
              sx={inputStyles}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              disabled={readOnly}
              sx={inputStyles}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={readOnly}
              sx={inputStyles}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={readOnly}
              sx={inputStyles}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={readOnly}
              sx={inputStyles}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="GST Number"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleChange}
              disabled={readOnly}
              sx={inputStyles}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={readOnly}
              sx={inputStyles}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />
      
      <DialogActions sx={styles.footer}>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={() => handleClose(false)}
          startIcon={<IconX size={18} />}
          sx={btnCancel}
        >
          Cancel
        </Button>
        {!readOnly && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            startIcon={<IconDeviceFloppy size={18} />}
            sx={btnSave}
          >
            Save Supplier
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

AddSupplierDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};
