import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Grid, useTheme, MenuItem, Button, Box, Typography, Stack, Paper } from '@mui/material';
import { IconUser, IconMail, IconPhone, IconMapPin, IconFileTypography, IconPlus, IconUserPlus, IconInfoCircle, IconAlertCircle, IconTruck, IconCurrencyDollar, IconFileCheck } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSFileGallery, errorStyle } from 'ui-component/bos';
import useBOSForm from 'hooks/useBOSForm';
import AddContactDialog from './AddContactDialog';
import { API_PATHS } from 'utils/api-constants';
import { autoUploadFile } from 'utils/upload-helper';

// ==============================|| SM - CUSTOMER PROFESSIONAL TEMPLATE ||============================== //

export default function AddCustomerDialog({ open, handleClose, initialData, readOnly = false }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const { formData, setFormData, handleFormChange, errors, validate, resetForm } = useBOSForm({
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

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
        setIsEditing(false);
        if (initialData.fileUpload) {
          const files = initialData.fileUpload.split(',').filter(f => f).map(f => ({
            id: Math.random(),
            fileName: f.split('_').slice(1).join('_') || f,
            serverFileName: f,
            isLoaded: true
          }));
          setAttachments(files);
        }
      } else {
        resetForm();
        setAttachments([]);
        setIsEditing(!readOnly);
      }
    }
  }, [initialData, open, readOnly, setFormData, resetForm]);

  const handleSave = async () => {
    const { isValid, firstMissing } = validate([
      { field: 'customerName', label: 'Customer Name' },
      { field: 'currency', label: 'Currency' },
      { field: 'paymentTerms', label: 'Payment Terms' },
      { field: 'deliveryTerms', label: 'Delivery Terms' }
    ]);

    if (!isValid) {
      dispatch(openSnackbar({
        open: true,
        message: `Field ${firstMissing} is mandatory.`,
        variant: 'alert',
        alert: { variant: 'filled', severity: 'error' }
      }));
      return;
    }

    try {
      const updatedAttachments = [...attachments];
      for (let i = 0; i < updatedAttachments.length; i++) {
        const att = updatedAttachments[i];
        if (!att.isLoaded && att.file) {
          const uploadedPath = await autoUploadFile(att.file);
          updatedAttachments[i] = { ...att, serverFileName: uploadedPath, isLoaded: true };
        }
      }

      const finalFormData = {
        ...formData,
        fileUpload: updatedAttachments.map(att => att.serverFileName).join(',')
      };

      if (initialData?.id) {
        await axios.put(`${API_PATHS.SM.CUSTOMERS}/${initialData.id}`, finalFormData);
      } else {
        await axios.post(API_PATHS.SM.CUSTOMERS, finalFormData);
      }
      dispatch(openSnackbar({ open: true, message: `Customer ${initialData ? 'updated' : 'created'} successfully!`, severity: 'success', variant: 'alert' }));
      handleClose(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save customer.', severity: 'error', variant: 'alert' }));
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

  const isViewOnly = readOnly && !isEditing;

  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      onSave={handleSave}
      onClear={isEditing ? resetForm : null}
      onEditClick={() => setIsEditing(true)}
      isViewOnly={isViewOnly}
      title={initialData ? `Customer Profile - ${formData.customerName}` : 'Onboard New Customer'}
      maxWidth="lg"
      sidebar={
        <Stack spacing={3}>
          <Paper sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'primary.light' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <IconInfoCircle size={20} color={theme.palette.primary.main} />
              <Typography variant="subtitle2" color="primary.main" fontWeight={700}>Account Status</Typography>
            </Stack>
            <Typography variant="caption" display="block">Customer ID: {initialData?.id || 'NEW'}</Typography>
            <Typography variant="caption" display="block">Segment: {formData.segment || 'N/A'}</Typography>
          </Paper>

          <BOSFormSection 
            icon={<IconFileCheck size={22} color={theme.palette.secondary.main} />} 
            title="Attachments"
            action={!isViewOnly && (
              <Button size="small" variant="contained" onClick={() => fileInputRef.current?.click()} sx={{ borderRadius: '8px' }}>
                Upload
              </Button>
            )}
          >
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
            <BOSFileGallery files={attachments} onRemove={(idx) => setAttachments(attachments.filter((_, i) => i !== idx))} isEditing={!isViewOnly} />
            {attachments.length === 0 && (
              <Box sx={{ p: 2, border: '2px dashed', borderColor: 'divider', borderRadius: '12px', textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="caption" color="textDisabled">No documents uploaded</Typography>
              </Box>
            )}
          </BOSFormSection>

          <Paper sx={{ p: 2, bgcolor: 'warning.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'warning.light' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <IconAlertCircle size={20} color={theme.palette.warning.main} />
              <Typography variant="subtitle2" color="warning.main" fontWeight={700}>Compliance Note</Typography>
            </Stack>
            <Typography variant="caption" display="block">GST registration must be validated before the first transaction to avoid E-Way Bill issues.</Typography>
          </Paper>
        </Stack>
      }
      secondaryActions={!initialData ? null : (
        <Button variant="outlined" color="secondary" startIcon={<IconUserPlus size={18} />} onClick={() => setContactDialogOpen(true)}>
          Add Contact
        </Button>
      )}
    >
      <AddContactDialog open={contactDialogOpen} handleClose={() => setContactDialogOpen(false)} initialGroupName={formData.customerName} customerDetails={formData} />
      
      <Stack spacing={3}>
        <BOSFormSection icon={<IconUser size={22} color={theme.palette.primary.main} />} title="Identity & Classification">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
            <BOSTextField
              required
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleFormChange}
              disabled={isViewOnly}
              error={errors.customerName}
              sx={errorStyle(errors.customerName)}
            />
            <BOSTextField label="Invoice/Legal Name" name="invoiceName" value={formData.invoiceName} onChange={handleFormChange} disabled={isViewOnly} />
            <BOSTextField label="Short Name" name="shortName" value={formData.shortName} onChange={handleFormChange} disabled={isViewOnly} />
            <BOSTextField label="Segment" name="segment" value={formData.segment} onChange={handleFormChange} disabled={isViewOnly} />
            <BOSTextField label="Sub Segment" name="subSegment" value={formData.subSegment} onChange={handleFormChange} disabled={isViewOnly} />
            <BOSTextField select label="Lifecycle" name="status" value={formData.status} onChange={handleFormChange} disabled={isViewOnly}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </BOSTextField>
          </Box>
        </BOSFormSection>

        <BOSFormSection icon={<IconMapPin size={22} color={theme.palette.secondary.main} />} title="Location Details">
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 3 }}>
            <BOSTextField multiline rows={2} label="Registered Office Address" name="address" value={formData.address} onChange={handleFormChange} disabled={isViewOnly} />
            <BOSTextField label="PinCode" name="pincode" value={formData.pincode} onChange={handleFormChange} disabled={isViewOnly} />
            <BOSTextField label="City" name="city" value={formData.city} onChange={handleFormChange} disabled={isViewOnly} />
            <BOSTextField label="State" name="state" value={formData.state} onChange={handleFormChange} disabled={isViewOnly} />
            <BOSTextField label="State Code" name="stateCode" value={formData.stateCode} onChange={handleFormChange} disabled={isViewOnly} />
            <BOSTextField label="Distance (KM)" name="distance" value={formData.distance} onChange={handleFormChange} disabled={isViewOnly} type="number" />
            <BOSTextField label="Country" name="country" value={formData.country} onChange={handleFormChange} disabled={isViewOnly} />
          </Box>
        </BOSFormSection>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <BOSFormSection icon={<IconCurrencyDollar size={22} color={theme.palette.success.main} />} title="Financial Terms">
            <Stack spacing={2.5}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <BOSTextField required select label="Currency" name="currency" value={formData.currency} onChange={handleFormChange} disabled={isViewOnly} error={errors.currency} sx={errorStyle(errors.currency)}>
                  <MenuItem value="INR">INR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </BOSTextField>
                <BOSTextField required select label="Payment Terms" name="paymentTerms" value={formData.paymentTerms} onChange={handleFormChange} disabled={isViewOnly} error={errors.paymentTerms} sx={errorStyle(errors.paymentTerms)}>
                  <MenuItem value="Immediate">Immediate</MenuItem>
                  <MenuItem value="15 Days">15 Days</MenuItem>
                  <MenuItem value="30 Days">30 Days</MenuItem>
                </BOSTextField>
              </Box>
              <BOSTextField required select label="Delivery Terms" name="deliveryTerms" value={formData.deliveryTerms} onChange={handleFormChange} disabled={isViewOnly} error={errors.deliveryTerms} sx={errorStyle(errors.deliveryTerms)}>
                <MenuItem value="-Select-">-Select-</MenuItem>
                <MenuItem value="EXW">EXW</MenuItem>
                <MenuItem value="CIF">CIF</MenuItem>
                <MenuItem value="FOB">FOB</MenuItem>
              </BOSTextField>
            </Stack>
          </BOSFormSection>

          <BOSFormSection icon={<IconTruck size={22} color={theme.palette.warning.main} />} title="Business Compliance">
            <Stack spacing={2.5}>
              <BOSTextField label="GSTIN Number" name="gstin" value={formData.gstin} onChange={handleFormChange} disabled={isViewOnly} placeholder="Enter 15-digit GSTIN" />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <BOSTextField label="Vendor Code" name="vendorCode" value={formData.vendorCode} onChange={handleFormChange} disabled={isViewOnly} />
                <BOSTextField select label="NDA Required" name="ndaRequired" value={formData.ndaRequired} onChange={handleFormChange} disabled={isViewOnly}>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </BOSTextField>
              </Box>
            </Stack>
          </BOSFormSection>
        </Box>
      </Stack>
    </BOSFormDialog>
  );
}

AddCustomerDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};
