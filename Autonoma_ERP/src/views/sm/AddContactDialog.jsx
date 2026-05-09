import React, { useState, useEffect, useRef } from 'react';
import { Grid, useTheme, MenuItem, Button, Box, Typography } from '@mui/material';
import { IconUser, IconMail, IconPhone, IconBriefcase, IconFileTypography, IconPlus, IconPaperclip } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import useBOSValidation from 'hooks/useBOSValidation';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSFileGallery } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| SM - ADD/EDIT CONTACT DIALOG ||============================== //

const fieldConfigs = [
  { field: 'contactName', label: 'Contact Name', required: true, maxLength: 200 },
  { field: 'emailId', label: 'Email ID', type: 'email' },
  { field: 'mobileNo', label: 'Mobile No', maxLength: 50 },
  { field: 'groupName', label: 'Group Name', required: true }
];

export default function AddContactDialog({ open, handleClose, initialData, initialGroupName, customerDetails, readOnly }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isEdit = !!initialData;
  const { errors, validate, clearErrors } = useBOSValidation();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    groupName: initialGroupName || '',
    title: 'Mr.',
    contactName: '',
    designation: '',
    department: '',
    emailId: '',
    landlineNo: '',
    mobileNo: '',
    whatsAppNo: '',
    fileUpload: '',
    status: 'Active'
  });

  const [customers, setCustomers] = useState([]);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('/api/sm/customers');
        setCustomers(response.data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      }
    };
    if (open) fetchCustomers();
  }, [open]);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData
      });
    } else {
      setFormData({ 
        groupName: initialGroupName || '',
        title: 'Mr.',
        contactName: '',
        designation: '',
        department: '',
        emailId: '',
        landlineNo: '',
        mobileNo: '',
        whatsAppNo: '',
        fileUpload: '',
        status: 'Active'
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

    // Autofill common details from customer if provided or found
    if (open && !isEdit) {
      const selectedCustomer = customerDetails || customers.find(c => c.customerName === (initialGroupName || formData.groupName));
      if (selectedCustomer) {
        setFormData(prev => ({
          ...prev,
          status: selectedCustomer.status || prev.status
        }));
      }
    }
  }, [initialData, initialGroupName, open, clearErrors, customerDetails, customers, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      
      // If groupName (Customer) changed, autofill common details
      if (name === 'groupName') {
        const customer = customers.find(c => c.customerName === value);
        if (customer) {
          newFormData.status = customer.status || newFormData.status;
        }
      }
      
      return newFormData;
    });
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
        await axios.put(`/api/sm/contacts/${initialData.id}`, finalFormData);
      } else {
        await axios.post('/api/sm/contacts', finalFormData);
      }
      dispatch(openSnackbar({ open: true, message: `Contact ${isEdit ? 'updated' : 'created'} successfully!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to save contact:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save contact.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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
      title={isEdit ? (readOnly ? 'View Contact' : 'Edit Contact') : 'Add New Contact'}
      isViewOnly={readOnly}
      maxWidth="md"
    >
      <BOSFormSection icon={<IconUser size={20} color={theme.palette.primary.main} />} title="Basic Information">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <BOSTextField 
              name="groupName" 
              label="Group Name (Customer)" 
              value={formData.groupName} 
              onChange={handleChange} 
              disabled={readOnly} 
              required 
              select
              error={!!errors.groupName}
              helperText={errors.groupName}
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.customerName}>{c.customerName}</MenuItem>
              ))}
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <BOSTextField name="title" label="Title" value={formData.title} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Mr.">Mr.</MenuItem>
              <MenuItem value="Ms.">Ms.</MenuItem>
              <MenuItem value="Mrs.">Mrs.</MenuItem>
              <MenuItem value="Dr.">Dr.</MenuItem>
              <MenuItem value="Prof.">Prof.</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <BOSTextField name="contactName" label="Contact Name" value={formData.contactName} onChange={handleChange} disabled={readOnly} required error={!!errors.contactName} helperText={errors.contactName} />
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconBriefcase size={20} color={theme.palette.primary.main} />} title="Professional Details">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="designation" label="Designation" value={formData.designation} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="department" label="Department" value={formData.department} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <BOSTextField name="status" label="Status" value={formData.status} onChange={handleChange} disabled={readOnly} select>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </BOSTextField>
          </Grid>
        </Grid>
      </BOSFormSection>

      <BOSFormSection icon={<IconPhone size={20} color={theme.palette.primary.main} />} title="Communication">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="emailId" label="Email ID" value={formData.emailId} onChange={handleChange} disabled={readOnly} error={!!errors.emailId} helperText={errors.emailId} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="landlineNo" label="Landline No" value={formData.landlineNo} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="mobileNo" label="Mobile No" value={formData.mobileNo} onChange={handleChange} disabled={readOnly} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="whatsAppNo" label="WhatsApp No" value={formData.whatsAppNo} onChange={handleChange} disabled={readOnly} />
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
                  Upload visit reports, business cards, or other relevant files.
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
