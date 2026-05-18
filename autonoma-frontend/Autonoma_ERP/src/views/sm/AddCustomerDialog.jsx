import React, { useState, useEffect, useRef } from 'react';
import { Grid, useTheme, MenuItem, Button, Box, Typography } from '@mui/material';
import { IconUser, IconMail, IconPhone, IconMapPin, IconFileTypography, IconPlus, IconUserPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import useBOSValidation from 'hooks/useBOSValidation';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSFileGallery } from 'ui-component/bos';
import AddContactDialog from './AddContactDialog';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| SM - ADD/EDIT CUSTOMER DIALOG ||============================== //

const fieldConfigs = [
  { field: 'customerName', label: 'Customer Name', required: true, maxLength: 200 },
  { field: 'gstin', label: 'GSTIN Number', maxLength: 50 },
  { field: 'shortName', label: 'Short Name', maxLength: 50 },
  { field: 'currency', label: 'Currency', required: true },
  { field: 'paymentTerms', label: 'Payment Terms', required: true },
  { field: 'deliveryTerms', label: 'Delivery Terms', required: true }
];

export default function AddCustomerDialog({ open, handleClose, initialData, readOnly }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isEdit = !!initialData;
  const { errors, validate, clearErrors } = useBOSValidation();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    gstin: '',
    customerName: '',
    invoiceName: '',
    shortName: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    dispatchMode: 'Select',
    vendorCode: '',
    isoNumber: '',
    isoExpiry: '',
    ndaRequired: 'No',
    currency: 'INR',
    paymentTerms: 'Immediate',
    segment: '',
    subSegment: '',
    deliveryTerms: '-Select-',
    domainName: '',
    stateCode: '',
    status: 'Active',
    distance: '',
    negotiateCustomer: 'No',
    dailyDispatchMail: 'No',
    fileUpload: ''
  });

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData
      });
    } else {
      setFormData({ 
        gstin: '',
        customerName: '',
        invoiceName: '',
        shortName: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India',
        dispatchMode: 'Select',
        vendorCode: '',
        isoNumber: '',
        isoExpiry: '',
        ndaRequired: 'No',
        currency: 'INR',
        paymentTerms: 'Immediate',
        segment: '',
        subSegment: '',
        deliveryTerms: '-Select-',
        domainName: '',
        stateCode: '',
        status: 'Active',
        distance: '',
        negotiateCustomer: 'No',
        dailyDispatchMail: 'No'
      });
    }

    if (initialData && initialData.fileUpload) {
      const files = initialData.fileUpload.split(',').filter(f => f).map(f => ({
        id: Math.random(),
        fileName: f.split('_').slice(1).join('_') || f,
        serverFileName: f,
        isLoaded: true
      }));
      setAttachments(files);
    } else {
      setAttachments([]);
    }
  }, [initialData, open, clearErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!validate(formData, fieldConfigs)) return;
    try {
      // Handle File Uploads
      const updatedAttachments = [...attachments];
      for (let i = 0; i < updatedAttachments.length; i++) {
        const att = updatedAttachments[i];
        if (!att.isLoaded && att.file) {
          const fileData = new FormData();
          fileData.append('file', att.file);
          const uploadRes = await axios.post(`${API_PATHS.FILES}/upload`, fileData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          updatedAttachments[i] = {
            ...att,
            serverFileName: uploadRes.data,
            isLoaded: true
          };
        }
      }

      const finalFormData = {
        ...formData,
        fileUpload: updatedAttachments.map(att => att.serverFileName).join(',')
      };

      if (isEdit) {
        await axios.put(`/api/sm/customers/${initialData.id}`, finalFormData);
      } else {
        await axios.post('/api/sm/customers', finalFormData);
      }
      dispatch(openSnackbar({ open: true, message: `Customer ${isEdit ? 'updated' : 'created'} successfully!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to save customer:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save customer.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      id: Date.now() + Math.random(),
      fileName: file.name,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      file: file,
      isLoaded: false
    }));
    setAttachments([...attachments, ...newAttachments]);
    e.target.value = null;
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };


  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      onSave={handleSubmit}
      title={isEdit ? (readOnly ? 'View Customer' : 'Edit Customer') : 'Add New Customer'}
      isViewOnly={readOnly}
      maxWidth="lg"
      extraActions={
        isEdit && (
          <Button 
            variant="outlined" 
            color="secondary" 
            startIcon={<IconUserPlus size={18} />} 
            onClick={() => setContactDialogOpen(true)}
            sx={{ borderRadius: '10px' }}
          >
            Add Contact Master
          </Button>
        )
      }
    >
      <AddContactDialog 
        open={contactDialogOpen} 
        handleClose={() => setContactDialogOpen(false)} 
        initialGroupName={formData.customerName}
        customerDetails={formData}
      />
      <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="General Information">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="customerName" label="Customer Name" value={formData.customerName} onChange={handleChange} disabled={readOnly} required error={!!errors.customerName} helperText={errors.customerName} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="invoiceName" label="Customer Invoice Name" value={formData.invoiceName} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="shortName" label="Short Name" value={formData.shortName} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="segment" label="Segment" value={formData.segment} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="subSegment" label="Sub Segment" value={formData.subSegment} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="domainName" label="Domain Name" value={formData.domainName} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="status" label="Status" value={formData.status} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </BOSTextField>
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconMapPin size={20} color={theme.palette.primary.main} />} title="Location Details">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <BOSTextField name="address" label="Address" value={formData.address} onChange={handleChange} disabled={readOnly} multiline rows={2} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="pincode" label="PinCode" value={formData.pincode} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="city" label="City" value={formData.city} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="state" label="State" value={formData.state} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <BOSTextField name="stateCode" label="State Code" value={formData.stateCode} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <BOSTextField name="country" label="Country" value={formData.country} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <BOSTextField name="distance" label="Distance (KM)" value={formData.distance} onChange={handleChange} disabled={readOnly} type="number" />
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconMail size={20} color={theme.palette.primary.main} />} title="Business & Compliance">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="gstin" label="GSTIN Number" value={formData.gstin} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="vendorCode" label="Vendor Code" value={formData.vendorCode} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="isoNumber" label="ISO Number" value={formData.isoNumber} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="isoExpiry" label="ISO Expiry Date" value={formData.isoExpiry} onChange={handleChange} disabled={readOnly} type="date" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="ndaRequired" label="NDA Required" value={formData.ndaRequired} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </BOSTextField>
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconPhone size={20} color={theme.palette.primary.main} />} title="Terms & Logistics">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="dispatchMode" label="Mode of Dispatch" value={formData.dispatchMode} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Select">Select</MenuItem>
              <MenuItem value="By Road">By Road</MenuItem>
              <MenuItem value="By Train">By Train</MenuItem>
              <MenuItem value="By Air">By Air</MenuItem>
              <MenuItem value="By Hand">By Hand</MenuItem>
              <MenuItem value="By Sea">By Sea</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="currency" label="Currency" value={formData.currency} onChange={handleChange} disabled={readOnly} select required error={!!errors.currency} helperText={errors.currency}>
              <MenuItem value="-Select-">-Select-</MenuItem>
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              <MenuItem value="YEN">YEN</MenuItem>
              <MenuItem value="SGD">SGD</MenuItem>
              <MenuItem value="AED">AED</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="paymentTerms" label="Payment Terms" value={formData.paymentTerms} onChange={handleChange} disabled={readOnly} select required error={!!errors.paymentTerms} helperText={errors.paymentTerms}>
              <MenuItem value="-Select-">-Select-</MenuItem>
              <MenuItem value="Immediate">Immediate</MenuItem>
              <MenuItem value="7 Days">7 Days</MenuItem>
              <MenuItem value="10 Days">10 Days</MenuItem>
              <MenuItem value="15 Days">15 Days</MenuItem>
              <MenuItem value="30 Days">30 Days</MenuItem>
              <MenuItem value="40 Days">40 Days</MenuItem>
              <MenuItem value="45 Days">45 Days</MenuItem>
              <MenuItem value="50% Advance">50% Advance</MenuItem>
              <MenuItem value="60 Days">60 Days</MenuItem>
              <MenuItem value="100% Advance">100% Advance</MenuItem>
              <MenuItem value="120 Days">120 Days</MenuItem>
              <MenuItem value="120 Days LC">120 Days LC</MenuItem>
              <MenuItem value="150 Days">150 Days</MenuItem>
              <MenuItem value="5th 3rd Prox">5th 3rd Prox</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="deliveryTerms" label="Delivery Terms" value={formData.deliveryTerms} onChange={handleChange} disabled={readOnly} select required error={!!errors.deliveryTerms} helperText={errors.deliveryTerms}>
              <MenuItem value="-Select-">-Select-</MenuItem>
              <MenuItem value="C&F">C&F</MenuItem>
              <MenuItem value="CFR">CFR</MenuItem>
              <MenuItem value="CIF">CIF</MenuItem>
              <MenuItem value="DDP">DDP</MenuItem>
              <MenuItem value="DDU">DDU</MenuItem>
              <MenuItem value="EXW">EXW</MenuItem>
              <MenuItem value="FAC">FAC</MenuItem>
              <MenuItem value="FCA">FCA</MenuItem>
              <MenuItem value="FOB">FOB</MenuItem>
              <MenuItem value="FOR">FOR</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="negotiateCustomer" label="Negotiate Customer" value={formData.negotiateCustomer} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="dailyDispatchMail" label="Daily Dispatch Mail Req?" value={formData.dailyDispatchMail} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </BOSTextField>
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection 
        icon={<IconFileTypography size={20} color={theme.palette.primary.main} />} 
        title="Documents"
        action={
          <Button 
            startIcon={<IconPlus size={18} />} 
            size="small" 
            variant="contained" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={readOnly}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Add
          </Button>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              multiple 
              onChange={handleFileChange} 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
            <BOSFileGallery 
              files={attachments} 
              onRemove={(idx) => handleRemoveAttachment(attachments[idx].id)} 
              isEditing={!readOnly} 
            />
            {attachments.length === 0 && !readOnly && (
              <Box sx={{ p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: '16px', textAlign: 'center', bgcolor: 'grey.50' }}>
                <IconFileTypography size={48} color={theme.palette.text.disabled} />
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  No documents attached yet.
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                  Upload GST certificates, NDAs, or other compliance files.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<IconPlus size={18} />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ borderRadius: '8px' }}
                >
                  Upload Files
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </BOSFormSection>
    </BOSFormDialog>
  );
}
