import React, { useState, useEffect, useRef } from 'react';
import { Grid, useTheme, MenuItem, Button, Box, Typography } from '@mui/material';
import { IconUser, IconMail, IconPhone, IconMapPin, IconFileTypography, IconPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import useBOSValidation from 'hooks/useBOSValidation';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSFileGallery } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import { autoUploadFile } from 'utils/upload-helper';

// ==============================|| SM - ADD/EDIT SUPPLIER DIALOG ||============================== //

const fieldConfigs = [
  { field: 'supplierName', label: 'Supplier Name', required: true, maxLength: 200 },
  { field: 'gstin', label: 'GSTIN Number', maxLength: 50 },
  { field: 'shortName', label: 'Short Name', maxLength: 50 },
  { field: 'currency', label: 'Currency', required: true },
  { field: 'paymentTerms', label: 'Payment Terms', required: true },
  { field: 'deliveryTerms', label: 'Delivery Terms', required: true }
];

export default function AddSupplierDialog({ open, handleClose, initialData, readOnly }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const { formData, setFormData, handleFormChange, errors, validate, resetForm } = useBOSForm({
    gstin: '',
    supplierName: '',
    invoiceName: '',
    shortName: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    dispatchMode: 'Select',
    supplierCode: '',
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
    negotiateSupplier: 'No',
    dailyMailReq: 'No',
    fileUpload: ''
  });

  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (open) {
      clearErrors();
      if (initialData) {
        setFormData((prev) => ({
          ...prev,
          ...initialData
        }));
        
        if (initialData.fileUpload) {
          const files = initialData.fileUpload.split(',').filter(f => f).map(f => ({
            id: `server-${f}`,
            fileName: f.split('_').slice(1).join('_') || f,
            serverFileName: f,
            isLoaded: true
          }));
          setAttachments(files);
        } else {
          setAttachments([]);
        }
      } else {
        setFormData({ 
          gstin: '',
          supplierName: '',
          invoiceName: '',
          shortName: '',
          address: '',
          pincode: '',
          city: '',
          state: '',
          country: 'India',
          dispatchMode: 'Select',
          supplierCode: '',
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
          negotiateSupplier: 'No',
          dailyMailReq: 'No'
        });
        setAttachments([]);
      }
    }
  }, [open, initialData?.id, clearErrors]);

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

      if (isEdit) {
        await axios.put(`/api/sm/suppliers/${initialData.id}`, finalFormData);
      } else {
        await axios.post('/api/sm/suppliers', finalFormData);
      }
      dispatch(openSnackbar({ open: true, message: `Supplier ${isEdit ? 'updated' : 'created'} successfully!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Failed to save supplier.';
      dispatch(openSnackbar({ 
        open: true, 
        message: typeof msg === 'string' ? msg : 'Failed to save supplier.', 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'error', 
        close: false 
      }));
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
      onSave={handleSubmit}
      title={isEdit ? (readOnly ? 'View Supplier' : 'Edit Supplier') : 'Add New Supplier'}
      isViewOnly={readOnly}
      maxWidth="lg"
    >
      <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="General Information">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="supplierName" label="Supplier Name" value={formData.supplierName} onChange={handleChange} disabled={readOnly} required error={!!errors.supplierName} helperText={errors.supplierName} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="invoiceName" label="Supplier Invoice Name" value={formData.invoiceName} onChange={handleChange} disabled={readOnly} />
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

      <BOSFormSection icon={<IconMail size={20} color={theme.palette.primary.main} />} title="Business & Compliance">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="gstin" label="GSTIN Number" value={formData.gstin} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="supplierCode" label="Supplier Code" value={formData.supplierCode} onChange={handleChange} disabled={readOnly} />
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
            <BOSTextField name="negotiateSupplier" label="Negotiate Supplier" value={formData.negotiateSupplier} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="dailyMailReq" label="Daily Mail Req?" value={formData.dailyMailReq} onChange={handleChange} disabled={readOnly} select>
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
