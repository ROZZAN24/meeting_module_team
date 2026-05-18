import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Grid, Box, Button, Typography, Stack, MenuItem, useTheme, Tooltip, Autocomplete, TextField as MuiTextField, alpha } from '@mui/material';
import { 
  IconUserPlus, IconDeviceFloppy, IconArrowLeft, IconTrash, IconEraser, 
  IconUser, IconMapPin, IconBusinessplan, IconBuildingBank, IconTruckDelivery, 
  IconFiles
} from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { 
  BOSFormSection, 
  BOSTextField, BOSAutocomplete, 
  btnSave, 
  btnDelete, 
  btnCancel, 
  btnClear, 
  BOSDocumentPreviewDialog,
  BOSFileUpload,
  formatBOSFiles
} from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import { autoUploadFile } from 'utils/upload-helper';
import useBOSValidation from 'hooks/useBOSValidation';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { YES_NO_OPTIONS, STATUS_OPTIONS } from 'utils/constants';

const INITIAL = {
  supplierCode: '',
  gstNo: '',
  supplierName: '',
  ledgerName: '',
  shortName: '',
  supplierPrintName: '',
  address: '',
  city: '',
  state: '',
  stateCode: '',
  country: '',
  pincode: '',
  mobileNo: '',
  contactPerson: '',
  emailId: '',
  website: '',
  panNo: '',
  msmeNo: '',
  isoNo: '',
  isoExpiryDate: '',
  approvedSupplier: 'No',
  ndaRequired: 'No',
  deliveryTerms: '',
  typeOfService: '',
  paymentTerms: '',
  primeSupplier: 'No',
  freightRequired: 'No',
  currency: '',
  dueDays: '',
  isAuditorConsultant: 'No',
  accountNo: '',
  accountName: '',
  bankName: '',
  branchName: '',
  ifscCode: '',
  swiftCode: '',
  status: 'Active',
  uploadFiles: '',
  panFileInfo: '',
  msmeFileInfo: '',
  isoFileInfo: '',
  createdBy: '',
  createdDate: '',
  updatedBy: '',
  updatedDate: ''
};

const RULES = [
  { field: 'supplierName', label: 'Supplier Name', required: true, maxLength: 200 }
];

const R = ({ children, lg = 3, md = 4, sm = 6 }) => <Grid item xs={12} sm={sm} md={md} lg={lg}>{children}</Grid>;

export default function SupplierMaster() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { id: pathId } = useParams();
  const supplierId = pathId || searchParams.get('id');
  const { errors, validate, clearErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ url: '', name: '', type: 'pdf' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [panFile, setPanFile] = useState([]);
  const [msmeFile, setMsmeFile] = useState([]);
  const [isoFile, setIsoFile] = useState([]);

  // Master Data
  const [deliveryTerms, setDeliveryTerms] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [typesOfService, setTypesOfService] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [dt, pt, ts, cur, countryRes, stateRes] = await Promise.all([
        axios.get('/api/delivery-terms'),
        axios.get('/api/payment-terms'),
        axios.get('/api/type-of-service'),
        axios.get('/api/currency'),
        axios.get('/api/master/countries'),
        axios.get('/api/master/states')
      ]);
      setDeliveryTerms(dt.data.filter(t => t.status === 'Active'));
      setPaymentTerms(pt.data.filter(p => p.status === 'Active'));
      setTypesOfService(ts.data.filter(s => s.status === 'Active'));
      setCurrencies(cur.data.filter(c => c.status === 'Active'));
      setCountries(countryRes.data.filter(c => c.status === 'Active'));
      setAllStates(stateRes.data.filter(s => s.status === 'Active'));
    } catch (e) { console.error('Error fetching master data:', e); }
  }, []);

  const fetchSupplier = useCallback(async () => {
    if (!supplierId) return;
    try {
      const { data } = await axios.get(`/api/sm/suppliers/${supplierId}`);
      const d = { ...INITIAL };
      Object.keys(d).forEach((k) => { if (data[k] !== undefined && data[k] !== null) d[k] = data[k]; });
      if (d.isoExpiryDate && typeof d.isoExpiryDate === 'string') d.isoExpiryDate = d.isoExpiryDate.split('T')[0];
      setForm(d);
      setUploadedFiles(formatBOSFiles(data.uploadFiles));
      setPanFile(formatBOSFiles(data.panFileInfo));
      setMsmeFile(formatBOSFiles(data.msmeFileInfo));
      setIsoFile(formatBOSFiles(data.isoFileInfo));
    } catch (e) { console.error(e); }
  }, [supplierId]);

  const fetchNextCode = useCallback(async () => {
    if (supplierId) return;
    try {
      const { data } = await axios.get('/api/sm/suppliers/next-code');
      setForm(p => ({ ...p, supplierCode: data }));
    } catch (e) { 
      console.error(e);
      const year = new Date().getFullYear().toString().slice(-2);
      setForm(p => ({ ...p, supplierCode: `S-${year}-00001` }));
    }
  }, [supplierId]);

  useEffect(() => { 
    if (!supplierId) {
      setPanFile([]);
      setMsmeFile([]);
      setIsoFile([]);
      setUploadedFiles([]);
    }
  }, [supplierId]);

  useEffect(() => { 
    fetchMasterData();
    if (supplierId) fetchSupplier(); 
    else fetchNextCode();
  }, [supplierId, fetchSupplier, fetchNextCode, fetchMasterData]);

  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Autocomplete Handlers
  const handleAC = (field) => (event, newValue) => {
    setForm(p => ({ ...p, [field]: newValue || '' }));
  };

  const handleCountryChange = (event, newValue) => {
    setForm(p => ({ ...p, country: newValue || '', state: '', stateCode: '' }));
  };

  const handleStateChange = (event, newValue) => {
    if (newValue) {
      const s = allStates.find(x => x.stateName === newValue);
      setForm(p => ({ 
        ...p, 
        state: newValue, 
        stateCode: s?.stateCode || '', 
        country: s?.countryName || p.country 
      }));
    } else {
      setForm(p => ({ ...p, state: '', stateCode: '' }));
    }
  };

  const handleSave = async () => {
    if (!validate(form, RULES)) return;

    if (form.ndaRequired === 'Yes' && uploadedFiles.length === 0) {
      dispatch(openSnackbar({ 
        open: true, 
        message: 'NDA document is required when "NDA Required" is set to Yes. Please upload the document in the Attachments section.', 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'error', 
        close: false 
      }));
      return;
    }

    setLoading(true);
    try {
      const uploadFile = async (f) => f.isServer ? f.name : await autoUploadFile(f.file, 'SALES_SUPPLIER');
      const finalFiles = await Promise.all(uploadedFiles.map(uploadFile));
      
      const pFiles = await Promise.all(panFile.map(uploadFile));
      const mFiles = await Promise.all(msmeFile.map(uploadFile));
      const sFiles = await Promise.all(isoFile.map(uploadFile));

      const updatedForm = { 
        ...form, 
        uploadFiles: finalFiles.join(','),
        panFileInfo: pFiles.join(','),
        msmeFileInfo: mFiles.join(','),
        isoFileInfo: sFiles.join(',')
      };

      if (supplierId) {
        await axios.put(`/api/sm/suppliers/${supplierId}`, updatedForm);
        dispatch(openSnackbar({ open: true, message: 'Supplier updated!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        const { data } = await axios.post('/api/sm/suppliers', updatedForm);
        dispatch(openSnackbar({ open: true, message: 'Supplier created!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
        navigate(`/sm/suppliers/create?id=${data.id}`, { replace: true });
      }
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save supplier.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/sm/suppliers/${supplierId}`);
      dispatch(openSnackbar({ open: true, message: 'Supplier deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      navigate('/sm/suppliers');
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleClear = () => { setForm(INITIAL); clearErrors(); };

  useKeyboardShortcuts({ 'ctrl+s': handleSave, 'escape': () => navigate('/sm/suppliers') });

  const filteredStates = useMemo(() => {
    return form.country 
      ? allStates.filter(s => s.countryName === form.country)
      : [];
  }, [form.country, allStates]);

  const acSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.grey[50],
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[700] : theme.palette.grey[100]
      }
    }
  };

  return (
    <MainCard
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconUserPlus size={24} /><Typography variant="h3">{supplierId ? 'Edit Supplier' : 'New Supplier'}</Typography></Stack>}
      secondary={
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Back to List"><Button variant="contained" startIcon={<IconArrowLeft size={18} />} onClick={() => navigate('/sm/suppliers')} sx={btnCancel}>Back</Button></Tooltip>
          {supplierId && <Tooltip title={shortcutTooltip('Delete', 'Ctrl + D')}><Button variant="contained" startIcon={<IconTrash size={18} />} onClick={() => setDeleteOpen(true)} sx={btnDelete}>Delete</Button></Tooltip>}
          <Tooltip title="Clear"><Button variant="contained" startIcon={<IconEraser size={18} />} onClick={handleClear} sx={btnClear}>Clear</Button></Tooltip>
          <Tooltip title={shortcutTooltip('Save', 'Ctrl + S')}><span><Button variant="contained" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} disabled={loading} sx={btnSave}>{loading ? 'Saving...' : 'Save'}</Button></span></Tooltip>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Identity & Contact">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="supplierCode" label="Supplier Code" value={form.supplierCode} onChange={h} disabled inputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { fontWeight: 700, color: 'primary.main' } }} /></R>
            <R><BOSTextField name="gstNo" label="GST No" value={form.gstNo} onChange={h} /></R>
            <R><BOSTextField name="supplierName" label="Supplier Name" value={form.supplierName} onChange={h} required error={!!errors.supplierName} helperText={errors.supplierName} /></R>
            <R><BOSTextField name="ledgerName" label="Ledger Name" value={form.ledgerName} onChange={h} /></R>
            <R><BOSTextField name="shortName" label="Short Name" value={form.shortName} onChange={h} /></R>
            <R><BOSTextField name="supplierPrintName" label="Supplier Print Name" value={form.supplierPrintName} onChange={h} /></R>
            <R><BOSTextField name="mobileNo" label="Mobile No" value={form.mobileNo} onChange={h} /></R>
            <R><BOSTextField name="contactPerson" label="Contact Person" value={form.contactPerson} onChange={h} /></R>
            <R><BOSTextField name="emailId" label="Email Id" value={form.emailId} onChange={h} /></R>
            <R lg={6}><BOSTextField name="website" label="Website" value={form.website} onChange={h} /></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconMapPin size={20} color={theme.palette.primary.main} />} title="Location Details">
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <BOSTextField fullWidth name="address" label="Address" value={form.address} onChange={h} multiline rows={5} placeholder="Enter supplier address..." />
            </Grid>
            <Grid item xs={12} lg={6}>
              <Grid container spacing={2}>
                <R lg={6} md={6}><BOSTextField fullWidth name="city" label="City" value={form.city} onChange={h} /></R>
                <R lg={6} md={6}><Autocomplete fullWidth value={form.country || null} onChange={handleCountryChange} options={countries.map(c => c.country)} renderInput={(params) => <BOSTextField {...params} label="Country" sx={acSx} InputLabelProps={{ shrink: true, ...params.InputLabelProps }} />} /></R>
                <R lg={6} md={6}><Autocomplete fullWidth value={form.state || null} onChange={handleStateChange} options={filteredStates.map(s => s.stateName)} renderInput={(params) => <BOSTextField {...params} label="State Name" sx={acSx} InputLabelProps={{ shrink: true, ...params.InputLabelProps }} />} noOptionsText={form.country ? 'No states found' : 'Select country first'} disabled={!form.country} /></R>
                <R lg={6} md={6}><BOSTextField fullWidth name="stateCode" label="State Code" value={form.stateCode} onChange={h} disabled placeholder="Auto-filled" InputLabelProps={{ shrink: true }} /></R>
                <R lg={12} md={12}><BOSTextField fullWidth name="pincode" label="Pin Code" value={form.pincode} onChange={h} /></R>
              </Grid>
            </Grid>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconBusinessplan size={20} color={theme.palette.primary.main} />} title="Business & Compliance">
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BOSTextField name="panNo" label="PAN No" value={form.panNo} onChange={h} fullWidth />
                <BOSFileUpload files={panFile} onChange={setPanFile} module="SALES_SUPPLIER" label="PAN" compact multiple={false} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BOSTextField name="msmeNo" label="MSME No" value={form.msmeNo} onChange={h} fullWidth />
                <BOSFileUpload files={msmeFile} onChange={setMsmeFile} module="SALES_SUPPLIER" label="MSME" compact multiple={false} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BOSTextField name="isoNo" label="ISO No" value={form.isoNo} onChange={h} fullWidth />
                <BOSFileUpload files={isoFile} onChange={setIsoFile} module="SALES_SUPPLIER" label="ISO" compact multiple={false} />
              </Stack>
            </Grid>
            <R><BOSTextField name="isoExpiryDate" label="ISO Expiry Date" value={form.isoExpiryDate} onChange={h} type="date" InputLabelProps={{ shrink: true }} /></R>
            <R>
              <BOSTextField name="approvedSupplier" label="Approved Supplier" value={form.approvedSupplier} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="ndaRequired" label="NDA Required" value={form.ndaRequired} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
            <Grid item xs={12} lg={6}>
              <Box sx={{ border: '1px dashed', borderColor: form.ndaRequired === 'Yes' ? 'primary.main' : 'divider', borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <BOSFileUpload
                  files={uploadedFiles}
                  onChange={setUploadedFiles}
                  module="SALES_SUPPLIER"
                  label="Upload NDA Document"
                  compact
                  multiple={true}
                  disabled={form.ndaRequired === 'No'}
                  helperText="Upload signed NDA agreement."
                />
              </Box>
            </Grid>
            <R>
              <BOSTextField name="primeSupplier" label="Prime Supplier" value={form.primeSupplier} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
            <R>
              <BOSTextField name="isAuditorConsultant" label="Is Auditor/Consultant" value={form.isAuditorConsultant} onChange={h} select>
                {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </BOSTextField>
            </R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconBuildingBank size={20} color={theme.palette.primary.main} />} title="Banking Details">
          <Grid container spacing={2.5}>
            <R><BOSTextField name="accountNo" label="Account No" value={form.accountNo} onChange={h} /></R>
            <R><BOSTextField name="accountName" label="Account Name" value={form.accountName} onChange={h} /></R>
            <R><BOSTextField name="bankName" label="Bank Name" value={form.bankName} onChange={h} /></R>
            <R><BOSTextField name="branchName" label="Branch Name" value={form.branchName} onChange={h} /></R>
            <R><BOSTextField name="ifscCode" label="IFSC Code" value={form.ifscCode} onChange={h} /></R>
            <R><BOSTextField name="swiftCode" label="Swift Code" value={form.swiftCode} onChange={h} /></R>
            <R><BOSTextField name="accountType" label="Account Type" value={form.accountType} onChange={h} /></R>
          </Grid>
        </BOSFormSection>

        <BOSFormSection icon={<IconTruckDelivery size={20} color={theme.palette.primary.main} />} title="Terms & Status">
          <Grid container spacing={3}>
            <R lg={4} md={6}>
              <Autocomplete fullWidth value={form.currency || null} onChange={handleAC('currency')} options={currencies.map(c => c.currencyCode)} renderOption={(props, option) => { const { key, ...optionProps } = props; const c = currencies.find(x => x.currencyCode === option); return (<li key={key} {...optionProps}><Typography variant="body2"><b>{option}</b> - {c?.currencyName}</Typography></li>); }} renderInput={(params) => <BOSTextField {...params} label="Currency" sx={acSx} required />} />
            </R>
            <R lg={4} md={6}><Autocomplete fullWidth value={form.typeOfService || null} onChange={handleAC('typeOfService')} options={typesOfService.map(s => s.serviceName)} renderInput={(params) => <BOSTextField {...params} label="Type Of Service" sx={acSx} />} /></R>
            <R lg={4} md={6}><Autocomplete fullWidth value={form.paymentTerms || null} onChange={handleAC('paymentTerms')} options={paymentTerms.map(p => p.termName)} renderInput={(params) => <BOSTextField {...params} label="Payment Terms" sx={acSx} />} /></R>
            <R lg={4} md={6}><Autocomplete fullWidth value={form.deliveryTerms || null} onChange={handleAC('deliveryTerms')} options={deliveryTerms.map(t => t.termName)} renderInput={(params) => <BOSTextField {...params} label="Delivery Terms" sx={acSx} />} /></R>
            <R lg={4} md={4}><BOSTextField fullWidth name="freightRequired" label="Freight Required" value={form.freightRequired} onChange={h} select><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></BOSTextField></R>
            <R lg={4} md={4}><BOSTextField fullWidth name="dueDays" label="Due Days" value={form.dueDays} onChange={h} type="number" /></R>
            <R lg={12} md={12}>
              <Autocomplete
                fullWidth
                value={form.status || null}
                onChange={handleAC('status')}
                options={['Active', 'Inactive']}
                renderInput={(params) => <BOSTextField {...params} label="Status" sx={acSx} InputLabelProps={{ shrink: true, ...params.InputLabelProps }} />}
              />
            </R>
          </Grid>
        </BOSFormSection>

        {supplierId && (
          <BOSFormSection icon={<IconFiles size={20} color={theme.palette.primary.main} />} title="Audit Information">
            <Grid container spacing={2.5}>
              <R><BOSTextField label="Created By" value={form.createdBy} disabled /></R>
              <R><BOSTextField label="Created Date" value={form.createdDate} disabled /></R>
              <R><BOSTextField label="Updated By" value={form.updatedBy} disabled /></R>
              <R><BOSTextField label="Updated Date" value={form.updatedDate} disabled /></R>
            </Grid>
          </BOSFormSection>
        )}

        <BOSFormSection icon={<IconFiles size={22} color={theme.palette.primary.main} />} title="Standard Attachments">
          <BOSFileUpload 
            files={uploadedFiles} 
            onChange={setUploadedFiles} 
            module="SALES_SUPPLIER"
            label="Upload Supplier Documents"
            helperText="PDFs, Images, or Excel sheets"
          />
        </BOSFormSection>
      </Stack>

      <ConfirmDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Supplier" message="Are you sure you want to delete this supplier?" itemName={form.supplierName} />

      <BOSDocumentPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={previewData.url}
        fileName={previewData.name}
        type={previewData.type}
        onDownload={() => window.open(previewData.url.replace('/view/', '/download/'), '_blank')}
      />
    </MainCard>
  );
}
