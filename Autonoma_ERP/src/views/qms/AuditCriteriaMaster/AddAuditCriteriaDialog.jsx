import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
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
  IconTrash,
  IconEdit,
  IconCloudUpload,
  IconPlus,
  IconPaperclip,
  IconEye,
  IconSettings
} from '@tabler/icons-react';
import axios from 'utils/axios';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';

// ==============================|| AUDIT CRITERIA - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const AddAuditCriteriaDialog = ({ open, handleClose, initialData, readOnly = false, nextSeq = '' }) => {
  const theme = useTheme();
  
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
        console.error('Failed to fetch data:', error);
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
          console.error('Failed to parse attachments:', error);
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
      setIsEditing(!readOnly);
    }
  }, [initialData, open, nextSeq, readOnly]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'auditType') {
      const selectedNames = typeof value === 'string' ? value.split(',') : value;

      setFormData((prev) => {
        const newState = { ...prev, [name]: selectedNames };

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
      seqNo: formData.seqNo,
      auditType: [],
      clause: '',
      criteriaText: '',
      department: [],
      attachmentRequired: 'NO',
      status: 'ACTIVE'
    });
    setAttachments([]);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/qms/audit-criteria/${formData.id}`);
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete audit criteria:', error);
    }
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewContent, setPreviewContent] = useState('');

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
        setPreviewContent('');
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
    if (!formData.auditType || formData.auditType.length === 0) {
      alert('Audit Type is required');
      return;
    }
    if (!formData.criteriaText?.trim()) {
      alert('Criteria Text is required');
      return;
    }
    if (!formData.department || formData.department.length === 0) {
      alert('Department is required');
      return;
    }

    try {
      const updatedAttachments = [...attachments];

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
    e.target.value = null;
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const isViewOnly = readOnly && !isEditing;

  return (
    <>
      <BOSFormDialog
        open={open}
        onClose={() => handleClose()}
        onSave={handleSave}
        onDelete={handleDelete}
        onClear={handleClear}
        onEditClick={() => setIsEditing(true)}
        title={initialData ? 'Edit Audit Criteria' : 'New Audit Criteria'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="lg"
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4, width: '100%', alignItems: 'start' }}>
          
          {/* ── LEFT COLUMN: Form Sections ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Criteria Details">
              <BOSTextField 
                name="seqNo" 
                label="Seq No"
                value={formData.seqNo} 
                inputProps={{ readOnly: true }} 
              />

              <Autocomplete
                multiple
                disableCloseOnSelect
                options={auditTypes}
                getOptionLabel={(option) => option.auditType || ''}
                value={auditTypes.filter((t) => (formData.auditType || []).includes(t.auditType))}
                onChange={(event, newValue) => {
                  handleChange({ target: { name: 'auditType', value: newValue.map((v) => v.auditType) } });
                }}
                disabled={isViewOnly}
                renderInput={(params) => (
                  <BOSTextField {...params} label="Audit Type" required />
                )}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                    {option.auditType}
                  </li>
                )}
                sx={{ '& .MuiAutocomplete-tag': { bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, height: 24 } }}
              />

              <BOSTextField
                name="clause"
                label="Clause"
                value={formData.clause}
                onChange={handleChange}
                disabled={isViewOnly}
              />

              <BOSTextField
                name="criteriaText"
                label="Audit Criteria"
                multiline
                rows={4}
                value={formData.criteriaText}
                onChange={handleChange}
                disabled={isViewOnly}
                required
              />

              <Autocomplete
                multiple
                disableCloseOnSelect
                options={departments}
                getOptionLabel={(option) => option.departmentName || ''}
                value={departments.filter((d) => (formData.department || []).includes(d.departmentName))}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, department: newValue.map((v) => v.departmentName) });
                }}
                disabled={isViewOnly}
                renderInput={(params) => (
                  <BOSTextField {...params} label="Department" required />
                )}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                    {option.departmentName}
                  </li>
                )}
                sx={{ '& .MuiAutocomplete-tag': { bgcolor: 'secondary.light', color: 'secondary.main', fontWeight: 600, height: 24 } }}
              />

              <BOSTextField
                select
                name="attachmentRequired"
                label="Attachment required"
                value={formData.attachmentRequired}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <MenuItem value="YES">YES</MenuItem>
                <MenuItem value="NO">NO</MenuItem>
              </BOSTextField>

              <BOSTextField
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </BOSTextField>
            </BOSFormSection>
          </Box>

          {/* ── RIGHT COLUMN: Attachments ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            <BOSFormSection 
              title="Attachments" 
              icon={<IconPaperclip size={20} color={theme.palette.secondary.main} />}
              action={
                <Button
                  startIcon={<IconPlus size={18} />}
                  size="small"
                  variant="contained"
                  onClick={handleAddAttachment}
                  disabled={isViewOnly}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Add
                </Button>
              }
            >
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} />

              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>SI.</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>File Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attachments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          <IconCloudUpload size={48} opacity={0.5} style={{ marginBottom: 8 }} />
                          <Typography variant="body2">No records found.</Typography>
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
                                    <img src={URL.createObjectURL(file.file)} alt="preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} />
                                  ) : file.serverFileName && (file.fileType === 'PNG' || file.fileType === 'JPG' || file.fileType === 'JPEG') ? (
                                    <img src={`${axios.defaults.baseURL}api/files/download/${file.serverFileName}`} alt="preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} />
                                  ) : (
                                    <Typography variant="caption">{file.fileName}</Typography>
                                  )}
                                </Box>
                              }
                              placement="top"
                              arrow
                            >
                              <Link
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleOpenPreview(file); }}
                                sx={{ cursor: 'pointer', textDecoration: 'none', color: 'primary.main', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                              >
                                {file.fileName}
                              </Link>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.7rem' }}>{file.fileType}</TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton size="small" sx={{ color: 'primary.main', bgcolor: '#e3f2fd', '&:hover': { bgcolor: 'primary.main', color: '#fff' } }} onClick={() => handleOpenPreview(file)}>
                                <IconEye size={14} />
                              </IconButton>
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
            </BOSFormSection>
          </Box>
        </Box>
      </BOSFormDialog>

      {/* Pop-up Preview Dialog */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, height: '80vh' } }}>
        <DialogTitle sx={{ bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">{previewFile?.fileName}</Typography>
          <IconButton onClick={handleClosePreview}><IconX size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', bgcolor: '#fafafa', overflow: 'auto' }}>
          {previewFile && (
            <Box sx={{ p: previewContent ? 3 : 0, width: '100%', height: '100%' }}>
              {previewContent && previewContent !== 'Loading...' ? (
                <Box
                  sx={{
                    bgcolor: '#fff',
                    p: 4,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    minHeight: '100%',
                    '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 },
                    '& th, & td': { border: `1px solid ${theme.palette.divider}`, p: 1, textAlign: 'left' },
                    '& img': { maxWidth: '100%' }
                  }}
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              ) : previewContent === 'Loading...' ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 5 }}>
                  <Typography variant="h4" color="text.secondary">Loading preview...</Typography>
                </Box>
              ) : (
                <>
                  {(() => {
                    const ext = previewFile.fileName.split('.').pop()?.toUpperCase();
                    const isImage = previewFile.file?.type.startsWith('image/') || ['PNG', 'JPG', 'JPEG', 'GIF'].includes(ext);
                    const isPdf = previewFile.file?.type === 'application/pdf' || ext === 'PDF';

                    if (isImage) {
                      return <img src={previewFile.file ? URL.createObjectURL(previewFile.file) : `${axios.defaults.baseURL}api/files/download/${previewFile.serverFileName}`} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', margin: 'auto' }} />;
                    } else if (isPdf) {
                      return <iframe title="Document Preview" src={previewFile.file ? URL.createObjectURL(previewFile.file) : `${axios.defaults.baseURL}api/files/download/${previewFile.serverFileName}`} style={{ width: '100%', height: '100%', border: 'none' }} />;
                    } else {
                      return (
                        <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary', mt: 10 }}>
                          <IconPaperclip size={64} opacity={0.2} style={{ marginBottom: 16 }} />
                          <Typography variant="h5" gutterBottom>Preview not available</Typography>
                          <Typography variant="body2">This file format ({ext}) cannot be rendered directly in the browser.</Typography>
                        </Box>
                      );
                    }
                  })()}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleClosePreview} sx={{ color: 'text.primary' }}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              const url = previewFile.file ? URL.createObjectURL(previewFile.file) : `${axios.defaults.baseURL}api/files/download/${previewFile.serverFileName}`;
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
  readOnly: PropTypes.bool,
  nextSeq: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default AddAuditCriteriaDialog;
