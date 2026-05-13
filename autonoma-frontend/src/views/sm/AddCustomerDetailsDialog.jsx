import React, { useState, useEffect } from 'react';
import {
  Grid,
  useTheme,
  MenuItem,
  Button,
  Box,
  Stack,
  Typography
} from '@mui/material';
import {
  IconClearAll,
  IconPlus,
  IconMapPin
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import useBOSValidation from 'hooks/useBOSValidation';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSDataTable } from 'ui-component/bos';
import { btnSave, btnClear } from 'ui-component/bos/BOSStyles';

// ==============================|| SM - CUSTOMER DETAILS DIALOG ||============================== //

const fieldConfigs = [
  { field: 'customerName', label: 'Cust Name', required: true },
  { field: 'invoiceName', label: 'Cust.Name (Invoice)', required: true },
  { field: 'address', label: 'Address', required: true },
  { field: 'pincode', label: 'Pin Code', required: true },
  { field: 'city', label: 'City', required: true },
  { field: 'state', label: 'State', required: true },
  { field: 'country', label: 'Country', required: true },
  { field: 'distance', label: 'Distance (Km)', required: true }
];

export default function AddCustomerDetailsDialog({ open, handleClose, initialData }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState({
    customerName: '',
    invoiceName: '',
    address: '',
    pincode: '',
    city: '',
    district: '',
    state: 'N/A',
    country: 'Select',
    distance: 0,
    contactName: '',
    contactNo: '',
    status: 'Active'
  });

  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (open && initialData) {
      clearErrors();
      setFormData({
        customerName: initialData.customerName || '',
        invoiceName: initialData.invoiceName || '',
        address: '',
        pincode: '',
        city: '',
        district: '',
        state: 'N/A',
        country: 'Select',
        distance: 0,
        contactName: '',
        contactNo: '',
        status: 'Active'
      });
      fetchDetails(initialData.id);
    }
  }, [open, initialData, clearErrors]);

  const fetchDetails = async (cid) => {
    if (!cid) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/sm/customer-details?customerId=${cid}`);
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch customer address details:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to fetch address details.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    clearErrors();
    setEditingId(null);
    setFormData({
      customerName: initialData?.customerName || '',
      invoiceName: initialData?.invoiceName || '',
      address: '',
      pincode: '',
      city: '',
      district: '',
      state: 'N/A',
      country: 'Select',
      distance: 0,
      contactName: '',
      contactNo: '',
      status: 'Active'
    });
  };

  const handleSaveDetail = async () => {
    if (!validate(formData, fieldConfigs)) return;

    try {
      const payload = {
        ...formData,
        customerId: initialData.id,
        shipment: formData.shipment || `SHP-${Math.floor(Math.random() * 1000)}`
      };

      if (editingId) {
        await axios.put(`/api/sm/customer-details/${editingId}`, payload);
      } else {
        await axios.post('/api/sm/customer-details', payload);
      }

      dispatch(openSnackbar({
        open: true,
        message: `Detail ${editingId ? 'updated' : 'added'} successfully!`,
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'success',
        close: false
      }));

      fetchDetails(initialData.id);
      handleClear();
    } catch (error) {
      console.error('Failed to save detail:', error);
      dispatch(openSnackbar({
        open: true,
        message: 'Failed to save detail.',
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'error',
        close: false
      }));
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({ ...row });
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(`/api/sm/customer-details/${row.id}`);
      dispatch(openSnackbar({
        open: true,
        message: 'Detail deleted successfully!',
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'success',
        close: false
      }));
      fetchDetails(initialData.id);
    } catch (error) {
      console.error('Failed to delete detail:', error);
    }
  };

  const columns = [
    { id: 'index', label: '#', minWidth: 50 },
    { id: 'invoiceName', label: 'Customer Name (I)', minWidth: 150 },
    { id: 'shipment', label: 'Shipment', minWidth: 100 },
    { id: 'address', label: 'Address', minWidth: 250 },
    { id: 'city', label: 'City', minWidth: 100 },
    { id: 'district', label: 'District', minWidth: 100 },
    { id: 'state', label: 'State', minWidth: 100 },
    { id: 'country', label: 'Country', minWidth: 100 },
    { id: 'pincode', label: 'Pincode', minWidth: 100 },
    { id: 'contactName', label: 'Contact Name', minWidth: 120 },
    { id: 'contactNo', label: 'Contact No', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100 }
  ];

  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      title="Customer Details"
      maxWidth="xl"
      hideFooter={true} // Hide default footer to match reference design
    >
      <Box sx={{ p: 2, pt: 1 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="customerName"
              label="Cust Name"
              value={formData.customerName}
              onChange={handleChange}
              required
              error={!!errors.customerName}
              helperText={errors.customerName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="invoiceName"
              label="Cust.Name (Invoice)"
              value={formData.invoiceName}
              onChange={handleChange}
              required
              error={!!errors.invoiceName}
              helperText={errors.invoiceName}
            />
          </Grid>
          <Grid item xs={12}>
            <BOSTextField
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              required
              error={!!errors.address}
              helperText={errors.address}
              placeholder="Please enter Customer Address..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="pincode"
              label="Pin Code"
              value={formData.pincode}
              onChange={handleChange}
              required
              error={!!errors.pincode}
              helperText={errors.pincode}
              placeholder="Please enter Customer Pin/Zip Code..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="city"
              label="City"
              value={formData.city}
              onChange={handleChange}
              required
              error={!!errors.city}
              helperText={errors.city}
              placeholder="Please enter Customer City..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="district"
              label="District"
              value={formData.district}
              onChange={handleChange}
              placeholder="Please enter Customer District..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="state"
              label="State"
              value={formData.state}
              onChange={handleChange}
              select
              required
              error={!!errors.state}
              helperText={errors.state}
            >
              <MenuItem value="N/A">N/A</MenuItem>
              <MenuItem value="Karnataka">Karnataka</MenuItem>
              <MenuItem value="Maharashtra">Maharashtra</MenuItem>
              <MenuItem value="Tamil Nadu">Tamil Nadu</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="country"
              label="Country"
              value={formData.country}
              onChange={handleChange}
              select
              required
              error={!!errors.country}
              helperText={errors.country}
            >
              <MenuItem value="Select">-Select-</MenuItem>
              <MenuItem value="India">India</MenuItem>
              <MenuItem value="USA">USA</MenuItem>
              <MenuItem value="UK">UK</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="distance"
              label="Distance (Km)"
              type="number"
              value={formData.distance}
              onChange={handleChange}
              required
              error={!!errors.distance}
              helperText={errors.distance}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="contactName"
              label="Contact Name"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="Please Enter Contact Person Name..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="contactNo"
              label="Contact No"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="Please Enter Contact No..."
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ my: 3 }}>
          <Button
            variant="contained"
            sx={{ ...btnClear, borderRadius: '4px', px: 3 }}
            startIcon={<IconClearAll size={18} />}
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ ...btnSave, borderRadius: '4px', px: 3, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            startIcon={<IconPlus size={18} />}
            onClick={handleSaveDetail}
          >
            New
          </Button>
        </Stack>

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
          <BOSDataTable
            columns={columns}
            rows={records}
            page={0}
            size={10}
            onPageChange={() => {}}
            onSizeChange={() => {}}
            onEditRow={handleEdit}
            onDeleteRow={handleDelete}
            showActions={true}
            sx={{ height: '300px' }}
          />
        </Box>
      </Box>
    </BOSFormDialog>
  );
}
