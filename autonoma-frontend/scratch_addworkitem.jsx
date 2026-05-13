import { useState, useEffect } from 'react';
import { Grid, useTheme, MenuItem, Typography, Stack, TextField, Select, Box } from '@mui/material';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import useBOSValidation from 'hooks/useBOSValidation';
import { BOSFormDialog } from 'ui-component/bos';
import { format } from 'date-fns';

const fieldConfigs = [
  { field: 'emailSubject', label: 'Subject', required: true, maxLength: 500 },
  { field: 'customerName', label: 'Customer Name', required: true }
];

export default function AddWorkItemDialog({ open, handleClose, initialData, readOnly }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isEdit = !!initialData;
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState({
    customerName: '',
    emailFrom: '',
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    enquiryNo: '',
    refDate: '',
    id: '',
    emailReceivedAt: ''
  });

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        emailBody: initialData.emailBodyPreview || initialData.emailBody || '',
        enquiryNo: initialData.enquiryNo || initialData.quotationNo || initialData.invoiceNo || '',
        refDate: initialData.refDate || '',
        id: initialData.id || '',
        emailReceivedAt: initialData.emailReceivedAt || ''
      });
    } else {
      setFormData({
        customerName: '',
        emailFrom: '',
        emailTo: '',
        emailSubject: '',
        emailBody: '',
        enquiryNo: '',
        refDate: '',
        id: '',
        emailReceivedAt: ''
      });
    }
  }, [initialData, open, clearErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!validate(formData, fieldConfigs)) return;
    const payload = { ...formData, emailBodyPreview: formData.emailBody };
    try {
      if (isEdit) {
        await axios.put(`http://localhost:9090/api/processing-requests/${initialData.id}`, payload);
      } else {
        await axios.post('http://localhost:9090/api/processing-requests', payload);
      }
      dispatch(openSnackbar({ open: true, message: `Work Item ${isEdit ? 'updated' : 'created'} successfully!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to save work item:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save work item.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const formattedDateTime = formData.emailReceivedAt 
    ? format(new Date(formData.emailReceivedAt), 'dd/MM/yyyy HH:mm') 
    : '';

  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      onSave={handleSubmit}
      title={isEdit ? (readOnly ? 'View Work Item' : 'Edit Work Item') : 'Add New Work Item'}
      isViewOnly={readOnly}
      maxWidth="lg"
    >
      <Box sx={{ p: 2, bgcolor: '#f8f9fb', borderBottom: '1px solid #e0e0e0', mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 110, color: 'text.secondary' }}>Customer Name</Typography>
              <Select 
                size="small" 
                fullWidth 
                name="customerName"
                value={formData.customerName || ''} 
                onChange={handleChange}
                disabled={readOnly}
                displayEmpty
                sx={{ bgcolor: 'background.paper' }}
              >
                <MenuItem value="" disabled>Select Customer</MenuItem>
                {formData.customerName && <MenuItem value={formData.customerName}>{formData.customerName}</MenuItem>}
                <MenuItem value="C001627 / RENOM ENERGY SERVICES PVT LTD - TN IV">C001627 / RENOM ENERGY SERVICES PVT LTD - TN IV</MenuItem>
              </Select>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 90, textAlign: 'right', color: 'text.secondary' }}>Work Item No</Typography>
              <TextField 
                size="small" 
                fullWidth 
                disabled 
                value={formData.id || ''} 
                sx={{ bgcolor: 'background.paper' }}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 140, textAlign: 'right', color: 'text.secondary' }}>Work Item Date & Time</Typography>
              <TextField 
                size="small" 
                fullWidth 
                disabled 
                value={formattedDateTime} 
                sx={{ bgcolor: 'background.paper' }}
              />
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}></Grid>
          <Grid item xs={12} sm={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 90, textAlign: 'right', color: 'text.secondary' }}>Ref No*</Typography>
              <TextField 
                size="small" 
                fullWidth 
                name="enquiryNo"
                value={formData.enquiryNo} 
                onChange={handleChange}
                disabled={readOnly}
                error={!!errors.enquiryNo}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 140, textAlign: 'right', color: 'text.secondary' }}>Ref Date</Typography>
              <TextField 
                size="small" 
                fullWidth 
                type="date"
                name="refDate"
                value={formData.refDate}
                onChange={handleChange}
                disabled={readOnly}
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
             <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right', color: 'text.secondary' }}>From</Typography>
                <TextField size="small" fullWidth name="emailFrom" value={formData.emailFrom} onChange={handleChange} disabled={readOnly} />
             </Stack>
          </Grid>
          <Grid item xs={12}>
             <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right', color: 'text.secondary' }}>To</Typography>
                <TextField size="small" fullWidth name="emailTo" value={formData.emailTo} onChange={handleChange} disabled={readOnly} />
             </Stack>
          </Grid>
          <Grid item xs={12}>
             <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right', color: 'text.secondary' }}>Subject</Typography>
                <TextField size="small" fullWidth name="emailSubject" value={formData.emailSubject} onChange={handleChange} disabled={readOnly} />
             </Stack>
          </Grid>
          <Grid item xs={12}>
             <Stack direction="row" spacing={2} alignItems="flex-start">
                <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right', mt: 1, color: 'text.secondary' }}>Content</Typography>
                <TextField size="small" fullWidth multiline rows={12} name="emailBody" value={formData.emailBody} onChange={handleChange} disabled={readOnly} />
             </Stack>
          </Grid>
        </Grid>
      </Box>
    </BOSFormDialog>
  );
}
