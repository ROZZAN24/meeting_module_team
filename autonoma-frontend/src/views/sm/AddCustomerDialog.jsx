<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Grid, useTheme, MenuItem, Button, Box, Typography, Autocomplete, TextField as MuiTextField, alpha } from '@mui/material';
=======
import React, { useState, useEffect, useRef } from 'react';
import { Grid, useTheme, MenuItem, Button, Box, Typography } from '@mui/material';
>>>>>>> origin/chore/repo-cleanup
import { IconUser, IconMail, IconPhone, IconMapPin, IconFileTypography, IconPlus, IconUserPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import useBOSValidation from 'hooks/useBOSValidation';
<<<<<<< HEAD
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSAutocomplete, BOSFileGallery, BOSFileUpload } from 'ui-component/bos';
import AddContactDialog from './AddContactDialog';
import { API_PATHS } from 'utils/api-constants';

const fieldConfigs = [
  { field: 'customerName', label: 'Customer Name', required: true, maxLength: 200 },
  { field: 'currency', label: 'Currency', required: true },
  { field: 'paymentTerms', label: 'Payment Terms', required: true },
  { field: 'deliveryTerms', label: 'Delivery Terms', required: true }
];

// Shared field renderer using Grid for consistent layout
const R = ({ children, lg = 3, md = 4, sm = 6 }) => <Grid item xs={12} sm={sm} md={md} lg={lg}>{children}</Grid>;
=======
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSFileGallery } from 'ui-component/bos';
import AddContactDialog from './AddContactDialog';
import { API_PATHS } from 'utils/api-constants';

  { field: 'deliveryTerms', label: 'Delivery Terms', required: true }
];

// Shared field renderer using Grid for consistent layout - standardized to 4 columns for even spacing
const R = ({ children, lg = 4 }) => <Grid item xs={12} sm={6} md={4} lg={lg}>{children}</Grid>;
>>>>>>> origin/chore/repo-cleanup

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
<<<<<<< HEAD
    customerPrintName: '',
=======
>>>>>>> origin/chore/repo-cleanup
    accountsLedger: '',
    groupName: '',
    shortName: '',
    address: '',
    city: '',
    state: '',
    stateCode: '',
<<<<<<< HEAD
    country: '',
=======
    country: 'India',
>>>>>>> origin/chore/repo-cleanup
    pincode: '',
    primeCustomer: 'No',
    panNo: '',
    website: '',
    registerNo: '',
    cinNo: '',
    isoNumber: '',
    isoExpiry: '',
    ndaRequired: 'No',
<<<<<<< HEAD
    currency: '',
    segment: '',
    subSegment: '',
    paymentTerms: '',
    deliveryTerms: '',
=======
    currency: 'INR',
    segment: '',
    subSegment: '',
    paymentTerms: 'Immediate',
    deliveryTerms: '-Select-',
>>>>>>> origin/chore/repo-cleanup
    freight: '',
    domainName: '',
    distance: '',
    location: '',
    ldApplicable: 'No',
    negotiateCustomer: 'No',
    status: 'Active',
<<<<<<< HEAD
    fileUpload: '',
    panFileInfo: ''
  });

  const [countries, setCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [segments, setSegments] = useState([]);
  const [subSegments, setSubSegments] = useState([]);
  const [paymentTermsList, setPaymentTermsList] = useState([]);
  const [deliveryTermsList, setDeliveryTermsList] = useState([]);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [countriesRes, statesRes, currenciesRes, segmentsRes, subSegmentsRes, paymentRes, deliveryRes] = await Promise.allSettled([
        axios.get('/api/master/countries'),
        axios.get('/api/master/states'),
        axios.get('/api/currency'),
        axios.get('/api/sm/segments'),
        axios.get('/api/sm/sub-segments'),
        axios.get('/api/payment-terms'),
        axios.get('/api/delivery-terms')
      ]);

      if (countriesRes.status === 'fulfilled') setCountries(countriesRes.value.data.filter(c => c.status === 'Active'));
      if (statesRes.status === 'fulfilled') setAllStates(statesRes.value.data.filter(s => s.status === 'Active'));
      if (currenciesRes.status === 'fulfilled') setCurrencies(currenciesRes.value.data.filter(c => c.status === 'Active'));
      if (segmentsRes.status === 'fulfilled') setSegments(segmentsRes.value.data.filter(s => s.status === 'Active'));
      if (subSegmentsRes.status === 'fulfilled') setSubSegments(subSegmentsRes.value.data.filter(s => s.status === 'Active'));
      if (paymentRes.status === 'fulfilled') setPaymentTermsList(paymentRes.value.data.filter(p => p.status === 'Active'));
      if (deliveryRes.status === 'fulfilled') setDeliveryTermsList(deliveryRes.value.data.filter(d => d.status === 'Active'));
    } catch (e) {
      console.error('Failed to fetch master data:', e);
    }
  }, []);

  useEffect(() => { if (open) fetchMasterData(); }, [open, fetchMasterData]);

  const filteredStates = useMemo(() => {
    return formData.country ? allStates.filter(s => s.countryName === formData.country) : allStates;
  }, [formData.country, allStates]);

=======
    fileUpload: ''
  });

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

>>>>>>> origin/chore/repo-cleanup
  useEffect(() => {
    if (open) {
      clearErrors();
      if (initialData) {
<<<<<<< HEAD
        setFormData((prev) => ({ ...prev, ...initialData }));
=======
        setFormData((prev) => ({
          ...prev,
          ...initialData
        }));
        
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD
        if (initialData.panFileInfo) {
          setPanFile([{ id: 'server-pan', fileName: initialData.panFileInfo.split('_').slice(1).join('_') || initialData.panFileInfo, serverFileName: initialData.panFileInfo, isLoaded: true }]);
        } else {
          setPanFile([]);
        }
      } else {
        setFormData({ 
          customerCode: '', gstin: '', customerName: '', accountsLedger: '', groupName: '', shortName: '', address: '', city: '', state: '', stateCode: '', country: '', pincode: '', primeCustomer: 'No', panNo: '', website: '', registerNo: '', cinNo: '', isoNumber: '', isoExpiry: '', ndaRequired: 'No', currency: '', segment: '', subSegment: '', paymentTerms: '', deliveryTerms: '', freight: '', domainName: '', distance: '', location: '', ldApplicable: 'No', negotiateCustomer: 'No', status: 'Active'
=======
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
>>>>>>> origin/chore/repo-cleanup
        });
        setAttachments([]);
      }
    }
<<<<<<< HEAD
  }, [open, initialData, clearErrors]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCountryChange = (event, newValue) => setFormData((prev) => ({ ...prev, country: newValue || '', state: '', stateCode: '' }));

  const handleStateChange = (event, newValue) => {
    if (newValue) {
      const stateRecord = allStates.find(s => s.stateName === newValue);
      setFormData((prev) => ({ ...prev, state: newValue, stateCode: stateRecord?.stateCode || '', country: stateRecord?.countryName || prev.country }));
    } else {
      setFormData((prev) => ({ ...prev, state: '', stateCode: '' }));
    }
  };

  const handleAutocomplete = (fieldName) => (event, newValue) => setFormData((prev) => ({ ...prev, [fieldName]: newValue || '' }));

  const handleSubmit = async () => {
    if (!validate(formData, fieldConfigs)) return;

    if (formData.ndaRequired === 'Yes' && attachments.length === 0) {
      dispatch(openSnackbar({ 
        open: true, 
        message: 'NDA document is required when "NDA Required" is set to Yes. Please upload the document in the Documents section.', 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'error', 
        close: false 
      }));
      return;
    }
    try {
=======
  }, [open, initialData?.id, clearErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!validate(formData, fieldConfigs)) return;
    try {
      // Handle File Uploads
>>>>>>> origin/chore/repo-cleanup
      const updatedAttachments = [...attachments];
      for (let i = 0; i < updatedAttachments.length; i++) {
        const att = updatedAttachments[i];
        if (!att.isLoaded && att.file) {
          const fileData = new FormData();
          fileData.append('file', att.file);
<<<<<<< HEAD
          const uploadRes = await axios.post(`${API_PATHS.FILES}/upload`, fileData, { headers: { 'Content-Type': 'multipart/form-data' } });
          updatedAttachments[i] = { ...att, serverFileName: uploadRes.data, isLoaded: true };
        }
      }

      let finalPanFileInfo = formData.panFileInfo;
      if (panFile.length > 0 && !panFile[0].isLoaded) {
        const fileData = new FormData();
        fileData.append('file', panFile[0].file);
        const uploadRes = await axios.post(`${API_PATHS.FILES}/upload`, fileData, { headers: { 'Content-Type': 'multipart/form-data' } });
        finalPanFileInfo = uploadRes.data;
      } else if (panFile.length === 0) {
        finalPanFileInfo = '';
      }

      const finalFormData = { 
        ...formData, 
        fileUpload: updatedAttachments.map(att => att.serverFileName).join(','),
        panFileInfo: finalPanFileInfo
      };
      if (isEdit) await axios.put(`/api/sm/customers/${initialData.id}`, finalFormData);
      else await axios.post('/api/sm/customers', finalFormData);
      dispatch(openSnackbar({ open: true, message: `Customer ${isEdit ? 'updated' : 'created'} successfully!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
=======
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
>>>>>>> origin/chore/repo-cleanup
      dispatch(openSnackbar({ open: true, message: 'Failed to save customer.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
<<<<<<< HEAD
    const newAttachments = files.map((file) => ({ id: Date.now() + Math.random(), fileName: file.name, fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE', file: file, isLoaded: false }));
=======
    const newAttachments = files.map((file) => ({
      id: Date.now() + Math.random(),
      fileName: file.name,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      file: file,
      isLoaded: false
    }));
>>>>>>> origin/chore/repo-cleanup
    setAttachments([...attachments, ...newAttachments]);
    e.target.value = null;
  };

<<<<<<< HEAD
  const acSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.grey[50]
    }
  };

=======
  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };


>>>>>>> origin/chore/repo-cleanup
  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      onSave={handleSubmit}
      title={isEdit ? (readOnly ? 'View Customer' : 'Edit Customer') : 'Add New Customer'}
      isViewOnly={readOnly}
      maxWidth="lg"
<<<<<<< HEAD
      extraActions={isEdit && (
        <Button variant="outlined" color="secondary" startIcon={<IconUserPlus size={18} />} onClick={() => setContactDialogOpen(true)} sx={{ borderRadius: '10px' }}>Add Contact Master</Button>
      )}
    >
      <AddContactDialog open={contactDialogOpen} handleClose={() => setContactDialogOpen(false)} initialGroupName={formData.customerName} customerDetails={formData} />
      
      <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Identity & Contact">
        <Grid container spacing={2.5}>
          <R><BOSTextField name="customerCode" label="Customer Code" value={formData.customerCode} onChange={handleChange} disabled placeholder="Auto-generated" /></R>
          <R><BOSTextField name="gstin" label="GSTIN No" value={formData.gstin} onChange={handleChange} disabled={readOnly} /></R>
          <R lg={6} md={6}><BOSTextField name="customerName" label="Customer Name" value={formData.customerName} onChange={handleChange} disabled={readOnly} required error={!!errors.customerName} helperText={errors.customerName} /></R>
          <R lg={6} md={6}><BOSTextField name="customerPrintName" label="Customer Print Name" value={formData.customerPrintName} onChange={handleChange} disabled={readOnly} /></R>
=======
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
>>>>>>> origin/chore/repo-cleanup
          
          <R><BOSTextField name="accountsLedger" label="Accounts Ledger" value={formData.accountsLedger} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="groupName" label="Group Name" value={formData.groupName} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="shortName" label="Short Name" value={formData.shortName} onChange={handleChange} disabled={readOnly} /></R>
          
<<<<<<< HEAD
          <Grid item xs={12} lg={6}>
            <BOSTextField fullWidth name="address" label="Address" value={formData.address} onChange={handleChange} disabled={readOnly} multiline rows={5} placeholder="Enter full address..." />
          </Grid>
          <Grid item xs={12} lg={6}>
            <Grid container spacing={2}>
              <R lg={6} md={6}><BOSTextField fullWidth name="city" label="City" value={formData.city} onChange={handleChange} disabled={readOnly} /></R>
              <R lg={6} md={6}><Autocomplete fullWidth value={formData.country || null} onChange={handleCountryChange} options={countries.map(c => c.country)} disabled={readOnly} renderInput={(params) => <BOSTextField {...params} label="Country" sx={acSx} />} /></R>
              <R lg={6} md={6}><Autocomplete fullWidth value={formData.state || null} onChange={handleStateChange} options={filteredStates.map(s => s.stateName)} disabled={readOnly} renderInput={(params) => <BOSTextField {...params} label="State Name" sx={acSx} />} noOptionsText={formData.country ? 'No states found' : 'Select country first'} /></R>
              <R lg={6} md={6}><BOSTextField fullWidth name="stateCode" label="State Code" value={formData.stateCode} disabled placeholder="Auto-filled" /></R>
              <R lg={6} md={6}><BOSTextField fullWidth name="pincode" label="Pin Code" value={formData.pincode} onChange={handleChange} disabled={readOnly} /></R>
              <R lg={6} md={6}><BOSTextField fullWidth name="distance" label="Distance" value={formData.distance} onChange={handleChange} disabled={readOnly} type="number" /></R>
            </Grid>
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconMail size={20} color={theme.palette.primary.main} />} title="Business & Compliance">
        <Grid container spacing={2.5}>
          <R><BOSTextField name="primeCustomer" label="Prime Customer" value={formData.primeCustomer} onChange={handleChange} disabled={readOnly} select><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BOSTextField name="panNo" label="PAN No" value={formData.panNo} onChange={handleChange} disabled={readOnly} fullWidth />
              <BOSFileUpload
                files={panFile}
                onChange={setPanFile}
                module="SALES_CUSTOMER"
                label="PAN"
                compact
                multiple={false}
                disabled={readOnly}
              />
            </Stack>
          </Grid>
          <R><BOSTextField name="registerNo" label="Register No" value={formData.registerNo} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="cinNo" label="CIN No" value={formData.cinNo} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="isoNumber" label="ISO No" value={formData.isoNumber} onChange={handleChange} disabled={readOnly} /></R>
          <R><BOSTextField name="isoExpiry" label="ISO Expiry Date" value={formData.isoExpiry} onChange={handleChange} disabled={readOnly} type="date" InputLabelProps={{ shrink: true }} /></R>
          <R><BOSTextField name="ndaRequired" label="NDA Required" value={formData.ndaRequired} onChange={handleChange} disabled={readOnly} select><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
          <Grid item xs={12} lg={6}>
            <Box sx={{ border: '1px dashed', borderColor: formData.ndaRequired === 'Yes' ? 'primary.main' : 'divider', borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <BOSFileUpload
                files={attachments}
                onChange={setAttachments}
                module="SALES_CUSTOMER"
                label="Upload NDA Document"
                compact
                multiple={true}
                disabled={readOnly || formData.ndaRequired === 'No'}
                helperText="Upload signed NDA agreement."
              />
            </Box>
          </Grid>
          <R lg={6} md={6}><BOSTextField name="website" label="Website" value={formData.website} onChange={handleChange} disabled={readOnly} /></R>
          <R lg={6} md={6}><BOSTextField name="domainName" label="Domain Name" value={formData.domainName} onChange={handleChange} disabled={readOnly} /></R>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconPhone size={20} color={theme.palette.primary.main} />} title="Terms & Logistics">
        <Grid container spacing={3}>
          <R lg={4} md={6}>
            <Autocomplete fullWidth value={formData.currency || null} onChange={handleAutocomplete('currency')} options={currencies.map(c => c.currencyCode)} disabled={readOnly}
              renderOption={(props, option) => { const { key, ...optionProps } = props; const cur = currencies.find(c => c.currencyCode === option); return (<li key={key} {...optionProps}><Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{option}</Typography><Typography variant="caption" color="text.secondary">{cur?.currencyName || ''}</Typography></Box></li>); }}
              renderInput={(params) => <BOSTextField {...params} label="Currency" sx={acSx} required error={!!errors.currency} helperText={errors.currency} />} />
          </R>
          <R lg={4} md={6}><Autocomplete fullWidth value={formData.segment || null} onChange={handleAutocomplete('segment')} options={segments.map(s => s.segmentName)} disabled={readOnly} renderInput={(params) => <BOSTextField {...params} label="Segment" sx={acSx} />} /></R>
          <R lg={4} md={6}><Autocomplete fullWidth value={formData.subSegment || null} onChange={handleAutocomplete('subSegment')} options={subSegments.map(s => s.subSegmentName)} disabled={readOnly} renderInput={(params) => <BOSTextField {...params} label="Sub Segment" sx={acSx} />} /></R>
          <R lg={4} md={6}><BOSTextField fullWidth name="freight" label="Freight" value={formData.freight} onChange={handleChange} disabled={readOnly} /></R>

          <R lg={4} md={6}><Autocomplete fullWidth value={formData.paymentTerms || null} onChange={handleAutocomplete('paymentTerms')} options={paymentTermsList.map(p => p.termName)} disabled={readOnly} renderInput={(params) => <BOSTextField {...params} label="Payment Terms" sx={acSx} required error={!!errors.paymentTerms} helperText={errors.paymentTerms} />} /></R>
          <R lg={4} md={6}><Autocomplete fullWidth value={formData.deliveryTerms || null} onChange={handleAutocomplete('deliveryTerms')} options={deliveryTermsList.map(d => d.termName)} disabled={readOnly} renderInput={(params) => <BOSTextField {...params} label="Delivery Terms" sx={acSx} required error={!!errors.deliveryTerms} helperText={errors.deliveryTerms} />} /></R>
          
          <R lg={4} md={6}><BOSTextField fullWidth name="ldApplicable" label="LD Applicable" value={formData.ldApplicable} onChange={handleChange} disabled={readOnly} select><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
          <R lg={4} md={6}><BOSTextField fullWidth name="negotiateCustomer" label="Is Negotiate Customer" value={formData.negotiateCustomer} onChange={handleChange} disabled={readOnly} select><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
          <R lg={4} md={6}><BOSAutocomplete
  label="Status"
  name="status"
  value={formData.status}
  options={['Active', 'Inactive']}
  onChange={(val) => setFormData(p => ({ ...p, status: val || 'Active' }))}
  disabled={readOnly}
/></R>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconFileTypography size={20} color={theme.palette.primary.main} />} title="Documents" action={<Button startIcon={<IconPlus size={18} />} size="small" variant="contained" onClick={() => fileInputRef.current?.click()} disabled={readOnly} sx={{ borderRadius: '8px', textTransform: 'none' }}>Add</Button>}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
            <BOSFileGallery files={attachments} onRemove={(idx) => setAttachments(attachments.filter((_, i) => i !== idx))} isEditing={!readOnly} />
=======
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
>>>>>>> origin/chore/repo-cleanup
          </Grid>
        </Grid>
      </BOSFormSection>
    </BOSFormDialog>
  );
}
