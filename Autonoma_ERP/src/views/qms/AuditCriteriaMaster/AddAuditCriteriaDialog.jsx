import React, { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  Slide,
  Divider,
  MenuItem,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Tooltip,
  Link,
  Autocomplete,
  Checkbox
} from '@mui/material';
import {
  IconX,
  IconDeviceFloppy,
  IconEraser,
  IconTrash,
  IconEdit,
  IconCloudUpload,
  IconPlus,
  IconPaperclip,
  IconEye
} from '@tabler/icons-react';
import axios from 'utils/axios';
import AnimateButton from 'ui-component/extended/AnimateButton';
import FormRow from 'ui-component/FormRow';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

const AddAuditCriteriaDialog = ({ open, handleClose, initialData, readOnly = false, nextSeq = '' }) => {
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    seqNo: '',
    auditType: [],
    clause: '',
    criteriaText: '',
    department: [],
    attachmentRequired: 'NO',
    status: 'ACTIVE'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [auditTypes, setAuditTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, deptsRes] = await Promise.all([axios.get('/api/master/qms/audit-type/active'), axios.get('/api/hrm/departments')]);
        setAuditTypes(typesRes.data);
        setDepartments(deptsRes.data);
      } catch (error) {
        setAuditTypes([
          { id: 1, auditType: 'Internal Audit' },
          { id: 2, auditType: 'External Audit' }
        ]);
        setDepartments([
          { id: 1, departmentName: 'Quality' },
          { id: 2, departmentName: 'Production' },
          { id: 3, departmentName: 'HR' }
        ]);
      }
    };
    if (open) fetchData();
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        seqNo: initialData.seqNo || '',
        auditType: initialData.auditType ? initialData.auditType.split(', ') : [],
        clause: initialData.clause || '',
        criteriaText: initialData.criteriaText || '',
        department: initialData.department ? initialData.department.split(', ') : [],
        attachmentRequired: initialData.attachmentRequired || 'NO',
        status: initialData.status || 'ACTIVE'
      });

      if (initialData.attachmentInfo) {
        try {
          const parsed = JSON.parse(initialData.attachmentInfo);
          setAttachments(parsed.map((att) => ({ ...att, isLoaded: true })));
        } catch (error) {
          setAttachments([]);
        }
      } else {
        setAttachments([]);
      }
      setIsEditing(false);
    } else {
      setFormData({
        seqNo: nextSeq,
        auditType: [],
        clause: '',
        criteriaText: '',
        department: [],
        attachmentRequired: 'NO',
        status: 'ACTIVE'
      });
      setAttachments([]);
      setIsEditing(false);
    }
  }, [initialData, open, nextSeq]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle multiple select
    if (name === 'auditType') {
      const selectedNames = typeof value === 'string' ? value.split(',') : value;

      setFormData((prev) => {
        const newState = { ...prev, [name]: selectedNames };

        // Automation: If criteriaText is empty, fill it with descriptions from selected types
        if (!prev.criteriaText || prev.criteriaText.trim() === '') {
          const autoFilledText = auditTypes
            .filter((type) => selectedNames.includes(type.auditType))
            .map((type) => type.description)
            .filter((desc) => desc)
            .join('\n');

          if (autoFilledText) {
            newState.criteriaText = autoFilledText;
          }
        }

        return newState;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClear = () => {
    setFormData({
      seqNo: '',
      auditType: '',
      clause: '',
      criteriaText: '',
      department: '',
      attachmentRequired: 'NO',
      status: 'ACTIVE'
    });
    setAttachments([]);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this audit criteria?')) {
      try {
        await axios.delete(`/api/qms/audit-criteria/${formData.id}`);
        handleClose(true);
      } catch (error) {
        console.error('Failed to delete audit criteria:', error);
      }
    }
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewContent, setPreviewContent] = useState(''); // Store HTML or Text

  const handleOpenPreview = async (file) => {
    setPreviewFile(file);
    setPreviewContent('Loading...');
    setPreviewOpen(true);

    try {
      let arrayBuffer;
      if (file.file) {
        arrayBuffer = await file.file.arrayBuffer();
      } else if (file.serverFileName) {
        const response = await axios.get(`api/files/download/${file.serverFileName}`, {
          responseType: 'arraybuffer'
        });
        arrayBuffer = response.data;
      }

      if (!arrayBuffer) {
        setPreviewContent('Could not load file content.');
        return;
      }

      const extension = file.fileName.split('.').pop()?.toUpperCase();

      if (extension === 'DOCX' || extension === 'DOC') {
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        setPreviewContent(result.value);
      } else if (extension === 'XLSX' || extension === 'XLS') {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const html = XLSX.utils.sheet_to_html(firstSheet);
        setPreviewContent(html);
      } else if (extension === 'TXT' || extension === 'CSV') {
        const text = new TextDecoder().decode(arrayBuffer);
        setPreviewContent(`<pre style="white-space: pre-wrap; font-family: inherit;">${text}</pre>`);
      } else {
        setPreviewContent(''); // Default to iframe/img logic
      }
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewContent('Error rendering preview.');
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
    setPreviewContent('');
  };

  const handleSave = async () => {
    try {
      const updatedAttachments = [...attachments];

      // Upload new files to server first
      for (let i = 0; i < updatedAttachments.length; i++) {
        const att = updatedAttachments[i];
        if (!att.isLoaded && att.file) {
          const fileData = new FormData();
          fileData.append('file', att.file);
          const uploadRes = await axios.post('api/files/upload', fileData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          updatedAttachments[i] = {
            ...att,
            serverFileName: uploadRes.data,
            isLoaded: true
          };
        }
      }

      // Serialize attachment metadata (including server-side filenames)
      const attachmentInfo = JSON.stringify(
        updatedAttachments.map((att) => ({
          id: att.id,
          fileName: att.fileName,
          fileType: att.fileType,
          serverFileName: att.serverFileName
        }))
      );

      const submissionData = {
        ...formData,
        auditType: Array.isArray(formData.auditType) ? formData.auditType.join(', ') : formData.auditType,
        department: Array.isArray(formData.department) ? formData.department.join(', ') : formData.department,
        attachmentInfo: attachmentInfo
      };

      if (formData.id) {
        await axios.put(`/api/master/qms/audit-criteria/${formData.id}`, submissionData);
      } else {
        await axios.post('/api/master/qms/audit-criteria', submissionData);
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save audit criteria:', error);
      alert('Error saving data or uploading files. Please try again.');
    }
  };

  const handleAddAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      id: Date.now() + Math.random(),
      fileName: file.name,
      fileType: file.type.split('/')[1]?.toUpperCase() || 'FILE',
      file: file
    }));
    setAttachments([...attachments, ...newAttachments]);
    // Reset input
    e.target.value = null;
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const isViewOnly = readOnly && !isEditing;

  return (
    <>
      <Dialog
        open={open}
        onClose={() => handleClose()}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            bgcolor: '#546e7a',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5
          }}
          component="div"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconEdit size={24} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
              {initialData ? (isViewOnly ? 'View Audit Criteria' : 'Edit Audit Criteria') : 'Add Audit Criteria'}
            </Typography>
          </Box>
          <IconButton onClick={() => handleClose()} size="small" sx={{ color: 'inherit' }}>
            <IconX size={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, overflowY: 'auto', maxHeight: '80vh' }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Main Form Section */}
            <Box sx={{ flex: 1, border: '1px solid #cfd8dc', p: 3, borderRadius: 2, bgcolor: '#ffffff' }}>
              <FormRow label="Seq No">
                <TextField name="seqNo" fullWidth size="small" value={formData.seqNo} disabled={true} placeholder="Auto-generated" />
              </FormRow>

              <FormRow label="Audit Type" required>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  id="audit-type-select"
                  options={auditTypes}
                  getOptionLabel={(option) => option.auditType || ''}
                  value={auditTypes.filter((t) => (formData.auditType || []).includes(t.auditType))}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      auditType: newValue.map((v) => v.auditType)
                    });
                  }}
                  disabled={isViewOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Search Audit Types"
                      sx={{ bgcolor: isViewOnly ? '#f5f5f5' : '#fff' }}
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                      {option.auditType}
                    </li>
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      p: 0.5,
                      '& .MuiAutocomplete-tag': {
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        fontWeight: 600,
                        height: 24
                      }
                    }
                  }}
                />
              </FormRow>

              <FormRow label="Clause">
                <TextField
                  name="clause"
                  fullWidth
                  size="small"
                  value={formData.clause}
                  onChange={handleChange}
                  disabled={isViewOnly}
                  placeholder="Enter Clause"
                />
              </FormRow>

              <FormRow label="Audit Criteria" required>
                <TextField
                  name="criteriaText"
                  fullWidth
                  multiline
                  rows={4}
                  size="small"
                  value={formData.criteriaText}
                  onChange={handleChange}
                  disabled={isViewOnly}
                  placeholder="Enter Detailed Criteria"
                />
              </FormRow>

              <FormRow label="Department" required>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  id="department-select"
                  options={departments}
                  getOptionLabel={(option) => option.departmentName || ''}
                  value={departments.filter((d) => (formData.department || []).includes(d.departmentName))}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      department: newValue.map((v) => v.departmentName)
                    });
                  }}
                  disabled={isViewOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Search Departments"
                      sx={{ bgcolor: isViewOnly ? '#f5f5f5' : '#fff' }}
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                      {option.departmentName}
                    </li>
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      p: 0.5,
                      '& .MuiAutocomplete-tag': {
                        bgcolor: 'secondary.light',
                        color: 'secondary.main',
                        fontWeight: 600,
                        height: 24
                      }
                    }
                  }}
                />
              </FormRow>

              <FormRow label="Attachment required">
                <TextField
                  select
                  name="attachmentRequired"
                  fullWidth
                  size="small"
                  value={formData.attachmentRequired}
                  onChange={handleChange}
                  disabled={isViewOnly}
                >
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </TextField>
              </FormRow>

              <FormRow label="Status">
                <TextField
                  select
                  name="status"
                  fullWidth
                  size="small"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isViewOnly}
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                </TextField>
              </FormRow>
            </Box>

            {/* Attachment Section */}
            <Box sx={{ width: '400px', border: '1px solid #cfd8dc', p: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconPaperclip size={20} /> Attachments
                </Typography>
                <Button
                  startIcon={<IconPlus size={18} />}
                  size="small"
                  variant="outlined"
                  onClick={handleAddAttachment}
                  disabled={isViewOnly}
                >
                  Choose
                </Button>
              </Stack>

              <Box sx={{ border: '2px dashed #cfd8dc', p: 3, textAlign: 'center', borderRadius: 2, mb: 3, bgcolor: '#fff' }}>
                <IconCloudUpload size={48} color="#90a4ae" />
                <Typography variant="body2" sx={{ mt: 1, color: '#607d8b' }}>
                  Click Choose or drag files here
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Doc Details*
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#eee' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>SI.</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>File Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attachments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 2, color: '#999' }}>
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      attachments.map((file, idx) => (
                        <TableRow key={file.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip
                              title={
                                <Box sx={{ p: 0.5 }}>
                                  {file.file && file.file.type.startsWith('image/') ? (
                                    <img
                                      src={URL.createObjectURL(file.file)}
                                      alt="preview"
                                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                                    />
                                  ) : file.serverFileName &&
                                    (file.fileType === 'PNG' || file.fileType === 'JPG' || file.fileType === 'JPEG') ? (
                                    <img
                                      src={`${axios.defaults.baseURL}api/files/download/${file.serverFileName}`}
                                      alt="preview"
                                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                                    />
                                  ) : (
                                    <Typography variant="caption">
                                      {file.serverFileName ? 'View/Download: ' : 'Local file: '}
                                      {file.fileName}
                                    </Typography>
                                  )}
                                </Box>
                              }
                              placement="top"
                              arrow
                            >
                              <Link
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenPreview(file);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  textDecoration: 'none',
                                  color: 'primary.main',
                                  fontWeight: 500,
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                {file.fileName}
                              </Link>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{file.fileType}</TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title={file.serverFileName ? 'Preview / Download' : 'Preview Local'}>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: 'primary.main',
                                    bgcolor: '#e3f2fd',
                                    '&:hover': { bgcolor: 'primary.main', color: '#fff' }
                                  }}
                                  onClick={() => handleOpenPreview(file)}
                                >
                                  <IconEye size={14} />
                                </IconButton>
                              </Tooltip>
                              <IconButton size="small" color="error" onClick={() => handleRemoveAttachment(file.id)} disabled={isViewOnly}>
                                <IconTrash size={14} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} />

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2, bgcolor: '#546e7a', '&:hover': { bgcolor: '#455a64' } }}
                startIcon={<IconPlus size={18} />}
                onClick={handleAddAttachment}
                disabled={isViewOnly}
              >
                Add
              </Button>
            </Box>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, px: 4, justifyContent: 'space-between', bgcolor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <AnimateButton>
              <Button
                variant="contained"
                sx={{ bgcolor: '#546e7a', '&:hover': { bgcolor: '#455a64' }, minWidth: 120 }}
                onClick={handleClear}
                startIcon={<IconEraser size={20} />}
              >
                Clear
              </Button>
            </AnimateButton>

            {!isViewOnly && formData.id && (
              <AnimateButton>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ minWidth: 120, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                  onClick={handleDelete}
                  startIcon={<IconTrash size={20} />}
                >
                  Delete
                </Button>
              </AnimateButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {isViewOnly ? (
              <AnimateButton>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#546e7a', '&:hover': { bgcolor: '#455a64' }, px: 4, borderRadius: 1.5 }}
                  onClick={() => setIsEditing(true)}
                  startIcon={<IconEdit size={20} />}
                >
                  Edit
                </Button>
              </AnimateButton>
            ) : (
              <AnimateButton>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#546e7a', '&:hover': { bgcolor: '#455a64' }, px: 4, borderRadius: 1.5 }}
                  onClick={handleSave}
                  startIcon={<IconDeviceFloppy size={20} />}
                >
                  Save
                </Button>
              </AnimateButton>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Pop-up Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, height: '80vh' }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} component="div">
          <Typography variant="h4" component="span">
            {previewFile?.fileName}
          </Typography>
          <IconButton onClick={handleClosePreview}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', bgcolor: '#fafafa', overflow: 'auto' }}>
          {previewFile && (
            <Box sx={{ p: previewContent ? 3 : 0, width: '100%', height: '100%' }}>
              {previewContent && previewContent !== 'Loading...' ? (
                <Box
                  className="document-preview-container"
                  sx={{
                    bgcolor: '#fff',
                    p: 4,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    minHeight: '100%',
                    '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 },
                    '& th, & td': { border: '1px solid #ddd', p: 1, textAlign: 'left' },
                    '& img': { maxWidth: '100%' }
                  }}
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              ) : previewContent === 'Loading...' ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 5 }}>
                  <Typography variant="h4" color="textSecondary">
                    Loading preview...
                  </Typography>
                </Box>
              ) : (
                <>
                  {(() => {
                    const ext = previewFile.fileName.split('.').pop()?.toUpperCase();
                    const isImage = previewFile.file?.type.startsWith('image/') || ['PNG', 'JPG', 'JPEG', 'GIF'].includes(ext);
                    const isPdf = previewFile.file?.type === 'application/pdf' || ext === 'PDF';

                    if (isImage) {
                      return (
                        <img
                          src={
                            previewFile.file
                              ? URL.createObjectURL(previewFile.file)
                              : `${axios.defaults.baseURL}api/files/download/${previewFile.serverFileName}`
                          }
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', margin: 'auto' }}
                        />
                      );
                    } else if (isPdf) {
                      return (
                        <iframe
                          title="Document Preview"
                          src={
                            previewFile.file
                              ? URL.createObjectURL(previewFile.file)
                              : `${axios.defaults.baseURL}api/files/download/${previewFile.serverFileName}`
                          }
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                      );
                    } else {
                      return (
                        <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary', mt: 10 }}>
                          <IconPaperclip size={64} opacity={0.2} style={{ marginBottom: 16 }} />
                          <Typography variant="h5" gutterBottom>
                            Preview not available
                          </Typography>
                          <Typography variant="body2">
                            This file format ({ext}) cannot be rendered directly in the browser.
                            <br />
                            Please use the button below to download or open it.
                          </Typography>
                        </Box>
                      );
                    }
                  })()}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              const url = previewFile.file
                ? URL.createObjectURL(previewFile.file)
                : `${axios.defaults.baseURL}api/files/download/${previewFile.serverFileName}`;
              window.open(url, '_blank');
            }}
          >
            Open in New Tab
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

AddAuditCriteriaDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddAuditCriteriaDialog;
