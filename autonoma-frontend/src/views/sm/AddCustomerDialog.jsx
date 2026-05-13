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

  { field: 'deliveryTerms', label: 'Delivery Terms', required: true }
];

// Shared field renderer using Grid for consistent layout - standardized to 4 columns for even spacing
const R = ({ children, lg = 4 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;

export default function AddCustomerDialog({ open, handleClose, initialData, readOnly }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isEdit = !!initialData;
  const { errors, validate, clearErrors } = useBOSValidation();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    customerCode: '',
    gstin: '',
    customerName: '',
    accountsLedger: '',
    groupName: '',
    shortName: '',
    address: '',
    city: '',
    state: '',
    stateCode: '',
    country: 'India',
    pincode: '',
    primeCustomer: 'No',
    panNo: '',
    website: '',
    registerNo: '',
    cinNo: '',
    isoNumber: '',
    isoExpiry: '',
    ndaRequired: 'No',
    currency: 'INR',
    segment: '',
    subSegment: '',
    paymentTerms: 'Immediate',
    deliveryTerms: '-Select-',
    freight: '',
    domainName: '',
    distance: '',
    location: '',
    ldApplicable: 'No',
    negotiateCustomer: 'No',
    status: 'Active',
    fileUpload: ''
  });

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
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
          customerCode: '',
          gstin: '',
          customerName: '',
          accountsLedger: '',
          groupName: '',
          shortName: '',
          address: '',
          city: '',
          state: '',
          stateCode: '',
          country: 'India',
          pincode: '',
          primeCustomer: 'No',
          panNo: '',
          website: '',
          registerNo: '',
          cinNo: '',
          isoNumber: '',
          isoExpiry: '',
          ndaRequired: 'No',
          currency: 'INR',
          segment: '',
          subSegment: '',
          paymentTerms: 'Immediate',
          deliveryTerms: '-Select-',
          freight: '',
          domainName: '',
          distance: '',
          location: '',
          ldApplicable: 'No',
          negotiateCustomer: 'No',
          status: 'Active'
        });
        setAttachments([]);
      }
    }
  }, [open, initialData?.id, clearErrors]);

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
      <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Customer Master Details">
        <Grid container spacing={2.5}>
          <R><BOSTextField name="customerCode" label="Customer Code" value={formData.customerCode} onChange={handleChange} disabled placeholder="Auto-generated" /></R>
          <R><BOSTextField name="gstin" label="GSTIN No" value={formData.gstin} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="customerName" label="Customer Name" value={formData.customerName} onChange={handleChange} disabled={readOnly} required error={!!errors.customerName} helperText={errors.customerName} /></R>
          
          <R><BOSTextField name="accountsLedger" label="Accounts Ledger" value={formData.accountsLedger} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="groupName" label="Group Name" value={formData.groupName} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="shortName" label="Short Name" value={formData.shortName} onChange={handleChange} disabled={readOnly} /></R>
          
          <R lg={8}><BOSTextField name="address" label="Address" value={formData.address} onChange={handleChange} disabled={readOnly} multiline rows={2} /></R>
          <R><BOSTextField name="city" label="City" value={formData.city} onChange={handleChange} disabled={readOnly} /></R>
          
          <R><BOSTextField name="state" label="State" value={formData.state} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="stateCode" label="State Code" value={formData.stateCode} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="country" label="Country" value={formData.country} onChange={handleChange} disabled={readOnly} /></R>
          
          <R><BOSTextField name="pincode" label="Pin Code" value={formData.pincode} onChange={handleChange} disabled={readOnly} /></R>
          <R>
            <BOSTextField name="primeCustomer" label="Prime Customer" value={formData.primeCustomer} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </BOSTextField>
          </R>
          <R><BOSTextField name="panNo" label="PAN No" value={formData.panNo} onChange={handleChange} disabled={readOnly} /></R>
          
          <R><BOSTextField name="website" label="Website" value={formData.website} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="registerNo" label="Register No" value={formData.registerNo} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="cinNo" label="CIN No" value={formData.cinNo} onChange={handleChange} disabled={readOnly} /></R>
          
          <R><BOSTextField name="isoNumber" label="ISO No" value={formData.isoNumber} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="isoExpiry" label="ISO Expiry Date" value={formData.isoExpiry} onChange={handleChange} disabled={readOnly} type="date" InputLabelProps={{ shrink: true }} /></R>
          <R>
            <BOSTextField name="ndaRequired" label="NDA Required" value={formData.ndaRequired} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </BOSTextField>
          </R>
          
          <R>
            <BOSTextField name="currency" label="Currency" value={formData.currency} onChange={handleChange} disabled={readOnly} select required>
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </BOSTextField>
          </R>
          <R><BOSTextField name="segment" label="Segment" value={formData.segment} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="subSegment" label="Sub Segment" value={formData.subSegment} onChange={handleChange} disabled={readOnly} /></R>
          
          <R><BOSTextField name="paymentTerms" label="Payment Terms" value={formData.paymentTerms} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="deliveryTerms" label="Delivery Terms" value={formData.deliveryTerms} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="freight" label="Freight" value={formData.freight} onChange={handleChange} disabled={readOnly} /></R>
          
          <R><BOSTextField name="domainName" label="Domain Name" value={formData.domainName} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="distance" label="Distance" value={formData.distance} onChange={handleChange} disabled={readOnly} type="number" /></R>
          <R><BOSTextField name="location" label="Location" value={formData.location} onChange={handleChange} disabled={readOnly} /></R>
          
          <R>
            <BOSTextField name="ldApplicable" label="LD Applicable" value={formData.ldApplicable} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </BOSTextField>
          </R>
          <R>
            <BOSTextField name="negotiateCustomer" label="Is Negotiate Customer" value={formData.negotiateCustomer} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </BOSTextField>
          </R>
          <R>
            <BOSTextField name="status" label="Status" value={formData.status} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </BOSTextField>
          </R>
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
