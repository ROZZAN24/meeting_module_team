import { useState, useEffect } from 'react';
import { Grid, useTheme, MenuItem } from '@mui/material';
import { IconMail, IconUser, IconFileDescription, IconSettings, IconPaperclip } from '@tabler/icons-react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import useBOSValidation from 'hooks/useBOSValidation';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';

// ==============================|| SM - ADD/EDIT WORK ITEM DIALOG ||============================== //

const fieldConfigs = [
  { field: 'emailSubject', label: 'Subject', required: true, maxLength: 500 },
  { field: 'customerName', label: 'Customer Name', required: true },
  { field: 'intent', label: 'Category', required: true }
];

export default function AddWorkItemDialog({ open, handleClose, initialData, readOnly }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isEdit = !!initialData;
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState({
    intent: 'GENERAL_INQUIRY',
    customerCode: '',
    customerName: '',
    emailFrom: '',
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    status: 'Workitem Pending',
    quotationNo: '',
    invoiceNo: '',
    saleOrderNo: '',
    noOfItems: '',
    mode: 'MANUAL',
    attachmentCount: 0,
    enquiryNo: '',
    enqEntry: '',
    quoteEntry: '',
    saleOrderEntr: ''
  });

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        emailBody: initialData.emailBodyPreview || initialData.emailBody || '',
        customerCode: initialData.customerCode || '',
        attachmentCount: initialData.attachmentCount || 0,
        saleOrderNo: initialData.saleOrderNo || '',
        noOfItems: initialData.noOfItems || '',
        enquiryNo: initialData.enquiryNo || initialData.quotationNo || initialData.invoiceNo || ''
      });
    } else {
      setFormData({
        intent: 'GENERAL_INQUIRY',
        customerCode: '',
        customerName: '',
        emailFrom: '',
        emailTo: '',
        emailSubject: '',
        emailBody: '',
        status: 'Workitem Pending',
        quotationNo: '',
        invoiceNo: '',
        saleOrderNo: '',
        noOfItems: '',
        mode: 'MANUAL',
        attachmentCount: 0,
        enquiryNo: '',
        enqEntry: '',
        quoteEntry: '',
        saleOrderEntr: ''
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
        await axios.put(API_PATHS.OCR.PROCESSING_BY_ID(initialData.id), payload);
      } else {
        await axios.post(API_PATHS.OCR.PROCESSING, payload);
      }
      dispatch(openSnackbar({ open: true, message: `Work Item ${isEdit ? 'updated' : 'created'} successfully!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to save work item:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save work item.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      onSave={handleSubmit}
      title={isEdit ? (readOnly ? 'View Work Item' : 'Edit Work Item') : 'Add New Work Item'}
      isViewOnly={readOnly}
      maxWidth="lg"
    >
      <BOSFormSection icon={<IconFileDescription size={20} color={theme.palette.primary.main} />} title="Request Details">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <BOSTextField
              select
              name="intent"
              label="Category"
              value={formData.intent}
              onChange={handleChange}
              disabled={readOnly}
              required
              error={!!errors.intent}
              helperText={errors.intent}
            >
              <MenuItem value="QUOTATION_REQUEST">Quotation Request</MenuItem>
              <MenuItem value="INVOICE_REQUEST">Invoice Request</MenuItem>
              <MenuItem value="GENERAL_INQUIRY">General Inquiry</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="customerCode" label="Customer Code" value={formData.customerCode} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField
              name="customerName"
              label="Customer Name"
              value={formData.customerName}
              onChange={handleChange}
              disabled={readOnly}
              required
              error={!!errors.customerName}
              helperText={errors.customerName}
            />
          </Grid>
          <Grid item xs={12}>
            <BOSTextField
              name="emailSubject"
              label="Subject"
              value={formData.emailSubject}
              onChange={handleChange}
              disabled={readOnly}
              required
              error={!!errors.emailSubject}
              helperText={errors.emailSubject}
              multiline
              rows={1}
            />
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconMail size={20} color={theme.palette.secondary.main} />} title="Email & Source">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="emailFrom" label="From Email" value={formData.emailFrom} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="emailTo" label="To Email" value={formData.emailTo} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField select name="mode" label="Mode" value={formData.mode} onChange={handleChange} disabled={readOnly}>
              <MenuItem value="EMAIL">EMAIL</MenuItem>
              <MenuItem value="MANUAL">MANUAL</MenuItem>
              <MenuItem value="PORTAL">PORTAL</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12}>
            <BOSTextField name="emailBody" label="Email Content" value={formData.emailBody} onChange={handleChange} disabled={readOnly} multiline rows={3} />
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconSettings size={20} color={theme.palette.warning.main} />} title="Business References">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="noOfItems" label="No of Items" value={formData.noOfItems} onChange={handleChange} disabled={readOnly} type="number" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="enquiryNo" label="Enquiry No" value={formData.enquiryNo} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="enqEntry" label="Enq Entry" value={formData.enqEntry} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField select name="status" label="Status" value={formData.status} onChange={handleChange} disabled={readOnly}>
              <MenuItem value="Workitem Pending">Workitem Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="quotationNo" label="Quote No" value={formData.quotationNo} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="quoteEntry" label="Quote Entry" value={formData.quoteEntry} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="saleOrderNo" label="Sale Order No" value={formData.saleOrderNo} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <BOSTextField name="saleOrderEntr" label="Sale Order Entr" value={formData.saleOrderEntr} onChange={handleChange} disabled={readOnly} />
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconPaperclip size={20} color={theme.palette.info.main} />} title="Compliance & Tracking">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="attachmentCount" label="Attachment Count" value={formData.attachmentCount} onChange={handleChange} disabled={readOnly} type="number" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="updatedUserId" label="Updated User Id" value={formData.updatedUserId} onChange={handleChange} disabled={readOnly} inputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="updatedDateTime" label="Updated Date Time" value={formData.updatedDateTime} onChange={handleChange} disabled={readOnly} inputProps={{ readOnly: true }} />
          </Grid>
        </Grid>
      </BOSFormSection>
    </BOSFormDialog>
  );
}
