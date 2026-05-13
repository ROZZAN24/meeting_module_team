import { useState, useEffect } from 'react';
import { Grid, useTheme, MenuItem, Typography, Stack, TextField, Select, Box, Button, CircularProgress, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'utils/axios';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import useBOSValidation from 'hooks/useBOSValidation';
import { BOSFormDialog, btnDelete, btnEdit } from 'ui-component/bos';
import { format } from 'date-fns';
import { IconTrash, IconUpload, IconMailForward } from '@tabler/icons-react';
import UploadFileDialog from './UploadFileDialog';
import ForwardMailDialog from './ForwardMailDialog';

const fieldConfigs = [
  { field: 'emailSubject', label: 'Subject', required: true, maxLength: 500 },
  { field: 'customerName', label: 'Customer Name', required: true }
];

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export default function WorkItemMasterDialog({ open, handleClose, initialData, readOnly }) {
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
    emailReceivedAt: '',
    category: 'Others',
    status: 'Abandoned',
    emailMessageId: ''
  });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ url: '', name: '', type: '', content: '' });
  const [previewLoading, setPreviewLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  const handlePreview = async (emailId, attachmentId, fileName) => {
    const url = `http://localhost:9090/api/inbox/${emailId}/attachments/${attachmentId}`;
    const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
    
    setPreviewLoading(true);
    setPreviewOpen(true);
    setPreviewData({ url, name: fileName, type: ext, content: '' });

    try {
      if (['docx', 'doc', 'xlsx', 'xls'].includes(ext)) {
        // Fetch as arraybuffer for conversion
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const arrayBuffer = response.data;

        let content = '';
        if (ext === 'docx' || ext === 'doc') {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          content = result.value;
        } else if (ext === 'xlsx' || ext === 'xls') {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          content = XLSX.utils.sheet_to_html(firstSheet);
        }
        setPreviewData(prev => ({ ...prev, content }));
      }
    } catch (err) {
      console.error('Preview failed:', err);
      setPreviewData(prev => ({ ...prev, content: '<div style="padding: 20px; color: red;">Failed to load preview. Please download the file to view.</div>' }));
    } finally {
      setPreviewLoading(false);
    }
  };

  const fetchAttachments = async (emailId) => {
    if (!emailId) return;
    console.debug(`[AddWorkItemDialog] Fetching attachments for emailId: ${emailId}`);
    setLoadingAttachments(true);
    try {
      const res = await axios.get(`http://localhost:9090/api/inbox/${emailId}/attachments`);
      console.debug(`[AddWorkItemDialog] Attachments fetched:`, res.data);
      setAttachments(res.data || []);
    } catch (err) {
      console.error('[AddWorkItemDialog] Failed to fetch attachments', err);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/sm/customers');
      setCustomers(res.data || []);
    } catch (err) {
      console.error('[WorkItemMasterDialog] Failed to fetch customers', err);
    }
  };

  const handleDownload = (emailId, attachmentId) => {
    const url = `http://localhost:9090/api/inbox/${emailId}/attachments/${attachmentId}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    clearErrors();
    if (open) fetchCustomers();
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        emailBody: stripHtml(initialData.emailBodyPreview || initialData.emailBody || initialData.combinedText || ''),
        enquiryNo: initialData.enquiryNo || initialData.quotationNo || initialData.invoiceNo || '',
        refDate: initialData.refDate || '',
        category: initialData.intent === 'GENERAL_INQUIRY' ? 'Enquiry' : 
                  initialData.intent === 'QUOTATION_REQUEST' ? 'Order' : 
                  initialData.intent === 'UNCLASSIFIED' ? 'Others' : (initialData.intent || 'Others'),
        emailReceivedAt: initialData.emailReceivedAt || '',
        emailMessageId: initialData.emailMessageId || ''
      });
      if (initialData.emailMessageId) {
        fetchAttachments(initialData.emailMessageId);
      }
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
        emailReceivedAt: '',
        category: 'Others',
        status: 'Abandoned',
        emailMessageId: ''
      });
      setAttachments([]);
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

  const secondaryActions = (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mr: 'auto' }}>
      <Button
        variant="contained"
        sx={btnDelete}
        startIcon={<IconTrash size={18} />}
      >
        Delete
      </Button>
      <Button
        variant="contained"
        sx={{ ...btnEdit(theme), bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
        startIcon={<IconUpload size={18} />}
        onClick={() => setUploadDialogOpen(true)}
      >
        Upload File
      </Button>
      <Button
        variant="contained"
        sx={{ ...btnEdit(theme), bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
        startIcon={<IconMailForward size={18} />}
        onClick={() => setForwardDialogOpen(true)}
      >
        Forward To
      </Button>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ display: 'flex', fontWeight: 600 }}>
          Category<span style={{ color: 'red' }}>*</span>
        </Typography>
        <Select
          size="small"
          value={formData.category || 'Others'}
          onChange={handleChange}
          name="category"
          sx={{ 
            minWidth: 140, 
            bgcolor: 'grey.50', 
            height: 38, 
            borderRadius: '24px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' }
          }}
        >
          <MenuItem value="-Select-">-Select-</MenuItem>
          <MenuItem value="Order">Order</MenuItem>
          <MenuItem value="Enquiry">Enquiry</MenuItem>
          <MenuItem value="Ledger">Ledger</MenuItem>
          <MenuItem value="Others">Others</MenuItem>
        </Select>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ display: 'flex', fontWeight: 600 }}>
          Status<span style={{ color: 'red' }}>*</span>
        </Typography>
        <Select
          size="small"
          value={formData.status || 'Abandoned'}
          onChange={handleChange}
          name="status"
          sx={{ 
            minWidth: 160, 
            bgcolor: 'grey.50', 
            height: 38, 
            borderRadius: '24px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' }
          }}
        >
          <MenuItem value="Open">Open</MenuItem>
          <MenuItem value="Hold">Hold</MenuItem>
          <MenuItem value="Ledger Request Mail with CC">Ledger Request Mail with CC</MenuItem>
          <MenuItem value="Ledger Request Mail">Ledger Request Mail</MenuItem>
          <MenuItem value="Abandoned">Abandoned</MenuItem>
          <MenuItem value="Not Relevant">Not Relevant</MenuItem>
        </Select>
      </Box>
    </Box>
  );

  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      onSave={handleSubmit}
      title={isEdit ? (readOnly ? 'View Work Item Master' : 'Edit Work Item Master') : 'Add New Work Item Master'}
      isViewOnly={readOnly}
      maxWidth="lg"
      secondaryActions={secondaryActions}
    >
      <Box sx={{ p: 2.5, bgcolor: '#f4f6f8', borderBottom: '1px solid #e0e0e0', mb: 2 }}>
        <Grid container spacing={2.5}>
          {/* Row 1: Customer Name, WI No, WI Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container alignItems="center" spacing={1}>
              <Grid size={{ xs: 3 }}>
                <Typography variant="body2" color="text.secondary">Customer Name</Typography>
              </Grid>
              <Grid size={{ xs: 9 }}>
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
                  {customers.map((cust) => {
                    const displayValue = `${cust.customerCode} / ${cust.customerName}`;
                    return (
                      <MenuItem key={cust.id} value={displayValue}>
                        {displayValue}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Grid container alignItems="center" spacing={1}>
              <Grid size={{ xs: 5 }}>
                <Typography variant="body2" color="text.secondary" align="right">Work Item No</Typography>
              </Grid>
              <Grid size={{ xs: 7 }}>
                <TextField 
                  size="small" 
                  fullWidth 
                  disabled 
                  value={formData.id || ''} 
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Grid container alignItems="center" spacing={1}>
              <Grid size={{ xs: 5 }}>
                <Typography variant="body2" color="text.secondary" align="right">Date & Time</Typography>
              </Grid>
              <Grid size={{ xs: 7 }}>
                <TextField 
                  size="small" 
                  fullWidth 
                  disabled 
                  value={formattedDateTime} 
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Row 2: Ref No, Ref Date (offset by 6) */}
          <Grid size={{ xs: 0, md: 6 }}></Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Grid container alignItems="center" spacing={1}>
              <Grid size={{ xs: 5 }}>
                <Typography variant="body2" color="text.secondary" align="right">Ref No*</Typography>
              </Grid>
              <Grid size={{ xs: 7 }}>
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
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Grid container alignItems="center" spacing={1}>
              <Grid size={{ xs: 5 }}>
                <Typography variant="body2" color="text.secondary" align="right">Ref Date</Typography>
              </Grid>
              <Grid size={{ xs: 7 }}>
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
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 3, pb: 3 }}>
        <Grid container spacing={2}>
          {/* Stacked Full Width Fields */}
          <Grid size={{ xs: 12 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 1.5, md: 0.8 }}>
                <Typography variant="body2" color="text.secondary" align="right">From</Typography>
              </Grid>
              <Grid size={{ xs: 10.5, md: 11.2 }}>
                <TextField size="small" fullWidth name="emailFrom" value={formData.emailFrom} onChange={handleChange} disabled={readOnly} />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 1.5, md: 0.8 }}>
                <Typography variant="body2" color="text.secondary" align="right">To</Typography>
              </Grid>
              <Grid size={{ xs: 10.5, md: 11.2 }}>
                <TextField size="small" fullWidth name="emailTo" value={formData.emailTo} onChange={handleChange} disabled={readOnly} />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 1.5, md: 0.8 }}>
                <Typography variant="body2" color="text.secondary" align="right">Subject</Typography>
              </Grid>
              <Grid size={{ xs: 10.5, md: 11.2 }}>
                <TextField size="small" fullWidth name="emailSubject" value={formData.emailSubject} onChange={handleChange} disabled={readOnly} />
              </Grid>
            </Grid>
          </Grid>

          {/* Attachments Section */}
          {(formData.emailMessageId || attachments.length > 0 || loadingAttachments) && (
            <Grid size={{ xs: 12 }}>
              <Grid container alignItems="center" spacing={2} sx={{ minHeight: 40 }}>
                <Grid size={{ xs: 1.5, md: 0.8 }}>
                  <Typography variant="body2" color="text.secondary" align="right">Attachments</Typography>
                </Grid>
                <Grid size={{ xs: 10.5, md: 11.2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {loadingAttachments ? (
                      <CircularProgress size={16} sx={{ ml: 1 }} />
                    ) : attachments.length > 0 ? (
                      attachments.map((att) => (
                        <Box key={att.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            label={att.name}
                            icon={<AttachFileRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => handlePreview(formData.emailMessageId, att.id, att.name)}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              cursor: 'pointer', 
                              borderRadius: '24px', 
                              bgcolor: '#e3f2fd',
                              borderColor: '#2196f3',
                              px: 0.5,
                              '&:hover': { bgcolor: '#bbdefb', color: '#1976d2', borderColor: '#1976d2' }
                            }}
                          />
                          <IconButton 
                            size="small" 
                            onClick={() => handlePreview(formData.emailMessageId, att.id, att.name)}
                            sx={{ color: 'primary.main', p: 0.5 }}
                          >
                            <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', ml: 1 }}>
                        No attachments found
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Grid container alignItems="flex-start" spacing={2}>
              <Grid size={{ xs: 1.5, md: 0.8 }}>
                <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 1 }}>Content</Typography>
              </Grid>
              <Grid size={{ xs: 10.5, md: 11.2 }}>
                <TextField 
                  size="small" 
                  fullWidth 
                  multiline 
                  rows={20} 
                  name="emailBody" 
                  value={formData.emailBody} 
                  onChange={handleChange} 
                  disabled={readOnly} 
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper',
                      p: 1.5
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <UploadFileDialog 
        open={uploadDialogOpen} 
        handleClose={() => setUploadDialogOpen(false)} 
        workItemData={formData}
      />
      <ForwardMailDialog open={forwardDialogOpen} handleClose={() => setForwardDialogOpen(false)} />

      {/* File Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{previewData.name}</Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small"><CloseIcon size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', bgcolor: '#fafafa', p: 4, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewLoading ? (
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">Generating preview...</Typography>
            </Stack>
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
              {previewData.content ? (
                <Box 
                  dangerouslySetInnerHTML={{ __html: previewData.content }} 
                  sx={{ 
                    width: '100%', 
                    maxHeight: '70vh', 
                    overflow: 'auto', 
                    textAlign: 'left', 
                    bgcolor: 'white', 
                    p: 3, 
                    borderRadius: 1, 
                    boxShadow: 1,
                    '& table': { borderCollapse: 'collapse', width: '100%' },
                    '& th, & td': { border: '1px solid #ddd', p: 1 }
                  }} 
                />
              ) : (
                <>
                  {previewData.name.toLowerCase().endsWith('.pdf') ? (
                    <iframe title="PDF Preview" src={previewData.url} style={{ width: '100%', height: '70vh', border: 'none' }} />
                  ) : (previewData.type.startsWith('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(previewData.name)) ? (
                    <Box 
                      component="img" 
                      src={previewData.url} 
                      sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', objectFit: 'contain' }} 
                    />
                  ) : (
                    <Box sx={{ p: 4 }}>
                      <Typography variant="h5" color="text.secondary" gutterBottom>Preview not available for this format</Typography>
                      <Typography variant="body2" color="text.disabled">Please download the file to view its content.</Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" onClick={() => handleDownload(formData.emailMessageId, previewData.id || attachments.find(a => a.name === previewData.name)?.id)}>
            Download
          </Button>
          <Button variant="contained" onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </BOSFormDialog>
  );
}
