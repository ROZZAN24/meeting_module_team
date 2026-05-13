import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Grid, useTheme, MenuItem, Button, Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import { 
  IconUser, IconMail, IconPhone, IconMapPin, IconBusinessplan, 
  IconBuildingBank, IconTruckDelivery, IconPlus, IconCloudUpload, 
  IconFileCheck, IconX 
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import useBOSValidation from 'hooks/useBOSValidation';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';

// ==============================|| SM - ADD/EDIT SUBCONTRACTOR DIALOG ||============================== //

const fieldConfigs = [
  { field: 'subcontractorName', label: 'Sub Contractor Name', required: true, maxLength: 200 }
];

const R = ({ children, lg = 4 }) => <Grid item xs={12} sm={6} md={lg}>{children}</Grid>;

export default function AddSubContractorDialog({ open, handleClose, initialData, readOnly }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isEdit = !!initialData;
  const { errors, validate, clearErrors } = useBOSValidation();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    subcontractorCode: '',
    gstNo: '',
    subcontractorName: '',
    ledgerName: '',
    shortName: '',
    subcontractorPrintName: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    mobileNo: '',
    contactPerson: '',
    emailId: '',
    website: '',
    panNo: '',
    msmeNo: '',
    isoNo: '',
    isoExpiryDate: '',
    approvedSubcontractor: 'No',
    ndaRequired: 'No',
    deliveryTerms: '',
    typeOfService: '',
    paymentTerms: '',
    primeSubcontractor: 'No',
    freightRequired: 'No',
    currency: 'INR',
    dueDays: '',
    isAuditorConsultant: 'No',
    accountNo: '',
    accountName: '',
    bankName: '',
    branchName: '',
    ifscCode: '',
    swiftCode: '',
    accountType: '',
    status: 'Active',
    uploadFiles: ''
  });

  const [uploading, setUploading] = useState(false);

  // Master Data
  const [masterData, setMasterData] = useState({
    deliveryTerms: [],
    paymentTerms: [],
    typesOfService: [],
    currencies: []
  });

  const fetchMasterData = useCallback(async () => {
    try {
      const [dt, pt, ts, cur] = await Promise.all([
        axios.get('/api/delivery-terms'),
        axios.get('/api/payment-terms'),
        axios.get('/api/type-of-service'),
        axios.get('/api/currency')
      ]);
      setMasterData({
        deliveryTerms: dt.data,
        paymentTerms: pt.data,
        typesOfService: ts.data,
        currencies: cur.data
      });
    } catch (e) { console.error('Error fetching master data:', e); }
  }, []);

  useEffect(() => {
    if (open) {
      clearErrors();
      fetchMasterData();
      if (initialData) {
        const d = { ...formData };
        Object.keys(d).forEach(k => { if (initialData[k] !== undefined) d[k] = initialData[k]; });
        if (d.isoExpiryDate) d.isoExpiryDate = d.isoExpiryDate.split('T')[0];
        setFormData(d);
      } else {
        setFormData(p => ({ ...p, subcontractorCode: '' })); // In real app, fetch next code
      }
    }
  }, [open, initialData, clearErrors, fetchMasterData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    try {
      const res = await axios.post('/api/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(p => ({ ...p, uploadFiles: res.data }));
      dispatch(openSnackbar({ open: true, message: 'File uploaded!', severity: 'success' }));
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Upload failed.', severity: 'error' }));
    } finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!validate(formData, fieldConfigs)) return;
    try {
      if (isEdit) {
        await axios.put(`/api/sm/sub-contractors/${initialData.id}`, formData);
      } else {
        await axios.post('/api/sm/sub-contractors', formData);
      }
      dispatch(openSnackbar({ open: true, message: `Sub Contractor ${isEdit ? 'updated' : 'created'} successfully!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to save sub contractor:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save sub contractor.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      onSave={handleSubmit}
      title={isEdit ? (readOnly ? 'View Sub Contractor' : 'Edit Sub Contractor') : 'Add New Sub Contractor'}
      isViewOnly={readOnly}
      maxWidth="lg"
    >
      <Stack spacing={3} sx={{ mt: 1 }}>
        <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Identity & Contact">
          <Grid container spacing={2}>
            <R><BOSTextField name="subcontractorCode" label="Code" value={formData.subcontractorCode} onChange={handleChange} disabled inputProps={{ readOnly: true }} /></R>
            <R><BOSTextField name="gstNo" label="GST No" value={formData.gstNo} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="subcontractorName" label="Name" value={formData.subcontractorName} onChange={handleChange} disabled={readOnly} required error={!!errors.subcontractorName} helperText={errors.subcontractorName} /></R>
            <R><BOSTextField name="subcontractorPrintName" label="Print Name" value={formData.subcontractorPrintName} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="contactPerson" label="Contact Person" value={formData.contactPerson} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="mobileNo" label="Mobile No" value={formData.mobileNo} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="emailId" label="Email Id" value={formData.emailId} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="status" label="Status" value={formData.status} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </BOSTextField></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconMapPin size={20} color={theme.palette.primary.main} />} title="Location Details">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}><BOSTextField name="address" label="Address" value={formData.address} onChange={handleChange} disabled={readOnly} multiline rows={2} /></Grid>
            <R><BOSTextField name="pincode" label="PinCode" value={formData.pincode} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="city" label="City" value={formData.city} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="state" label="State" value={formData.state} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="country" label="Country" value={formData.country} onChange={handleChange} disabled={readOnly} /></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconBusinessplan size={20} color={theme.palette.primary.main} />} title="Compliance & Banking">
          <Grid container spacing={2}>
            <R><BOSTextField name="panNo" label="PAN No" value={formData.panNo} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="isoNo" label="ISO No" value={formData.isoNo} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="bankName" label="Bank Name" value={formData.bankName} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="accountNo" label="Account No" value={formData.accountNo} onChange={handleChange} disabled={readOnly} /></R>
            <R><BOSTextField name="ifscCode" label="IFSC Code" value={formData.ifscCode} onChange={handleChange} disabled={readOnly} /></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconTruckDelivery size={20} color={theme.palette.primary.main} />} title="Terms">
          <Grid container spacing={2}>
            <R><BOSTextField name="currency" label="Currency" value={formData.currency} onChange={handleChange} disabled={readOnly} select>
                {masterData.currencies.map(c => <MenuItem key={c.id} value={c.currencyCode}>{c.currencyCode}</MenuItem>)}
            </BOSTextField></R>
            <R><BOSTextField name="paymentTerms" label="Payment Terms" value={formData.paymentTerms} onChange={handleChange} disabled={readOnly} select>
                {masterData.paymentTerms.map(t => <MenuItem key={t.id} value={t.termName}>{t.termName}</MenuItem>)}
            </BOSTextField></R>
            <R><BOSTextField name="deliveryTerms" label="Delivery Terms" value={formData.deliveryTerms} onChange={handleChange} disabled={readOnly} select>
                {masterData.deliveryTerms.map(t => <MenuItem key={t.id} value={t.termName}>{t.termName}</MenuItem>)}
            </BOSTextField></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconCloudUpload size={20} color={theme.palette.primary.main} />} title="Uploads">
          <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: '8px' }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                <Button variant="outlined" startIcon={<IconCloudUpload size={18} />} onClick={() => fileInputRef.current?.click()} disabled={readOnly || uploading}>
                    {uploading ? 'Uploading...' : 'Upload Document'}
                </Button>
                {formData.uploadFiles && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconFileCheck size={20} color={theme.palette.success.main} />
                        <Typography variant="body2">{formData.uploadFiles}</Typography>
                        {!readOnly && <IconButton size="small" color="error" onClick={() => setFormData(p => ({ ...p, uploadFiles: '' }))}><IconX size={16} /></IconButton>}
                    </Stack>
                )}
            </Stack>
          </Box>
        </BOSFormSection>
      </Stack>
    </BOSFormDialog>
  );
}
