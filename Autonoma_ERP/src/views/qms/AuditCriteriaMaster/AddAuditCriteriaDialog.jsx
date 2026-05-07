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
import { useColorScheme } from '@mui/material/styles';
import {
  IconX,
  IconEraser,
  IconTrash,
  IconEdit,
  IconCloudUpload,
  IconPlus,
  IconPaperclip,
  IconEye,
  IconSettings,
  IconCheck
} from '@tabler/icons-react';
import axios from 'utils/axios';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddAuditCriteriaDialog = ({ open, handleClose, initialData, readOnly = false, nextSeq = '' }) => {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
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
      seqNo: '',
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

  const darkStyles = {
    dialog: {
      bgcolor: isDark ? '#161b22' : theme.palette.background.paper,
      color: isDark ? '#c9d1d9' : theme.palette.text.primary
    },
    input: {
      width: '100% !important',
      '& .MuiOutlinedInput-root': {
        width: '100%',
        bgcolor: isDark ? 'background.default' : 'grey.50',
        color: 'text.primary',
        '& fieldset': { borderColor: 'divider' },
        '&:hover fieldset': { borderColor: isDark ? '#8b949e' : theme.palette.primary.main },
        '&.Mui-focused fieldset': { borderColor: isDark ? '#58a6ff' : theme.palette.primary.main },
        '& input': { py: 1.2, fontSize: '0.9rem' },
        '& .MuiSelect-select': { py: 1.2, fontSize: '0.9rem', width: '100%', minWidth: '150px' }
      },
      '& .MuiInputLabel-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
      '& .MuiSvgIcon-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary }
    },
    btnSave: {
      bgcolor: 'success.main',
      color: '#fff',
      '&:hover': { bgcolor: 'success.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
    },
    btnClear: {
      bgcolor: 'secondary.main',
      color: '#fff',
      '&:hover': { bgcolor: 'secondary.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s'
    },
    btnInactive: {
      bgcolor: 'error.main',
      color: '#fff',
      '&:hover': { bgcolor: 'error.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
    },
    btnUpload: {
      bgcolor: isDark ? '#7c4dff' : theme.palette.primary.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#651fff' : theme.palette.primary.dark },
      borderRadius: '8px',
      textTransform: 'none',
      fontSize: '0.85rem'
    }
  };

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => handleClose()}
        maxWidth="lg"
        fullWidth
        slotProps={{
          backdrop: {
            sx: { backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }
          }
        }}
        PaperProps={{
          sx: {
            height: 'auto',
            maxHeight: '95vh',
            bgcolor: darkStyles.dialog.bgcolor,
            backgroundImage: 'none',
            borderRadius: '24px',
            border: isDark ? '1px solid #30363d' : 'none',
            boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.5)' : '0 24px 48px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: isDark ? 'background.default' : 'primary.light',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2.5,
            px: 4
          }}
        >
          <Typography variant="h5" component="span" sx={{ fontWeight: 600, color: isDark ? '#58a6ff' : theme.palette.primary.main, fontSize: '1.25rem' }}>
            {initialData ? 'Edit Audit Criteria' : 'New Audit Criteria'}
          </Typography>
          <IconButton onClick={() => handleClose()} size="small" sx={{ color: isDark ? '#8b949e' : theme.palette.text.secondary }}>
            <IconX size={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 5, bgcolor: darkStyles.dialog.bgcolor, width: '100%', overflowX: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4, width: '100%', alignItems: 'start' }}>
            
            {/* ── LEFT COLUMN: Form Sections ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <IconSettings size={20} color={theme.palette.primary.main} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Criteria Details</Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Stack spacing={2.5} sx={{ width: '100%' }}>
                    <TextField 
                      name="seqNo" 
                      label="Seq No"
                      fullWidth 
                      size="small" 
                      value={formData.seqNo} 
                      disabled={true} 
                      sx={{ ...darkStyles.input, width: '100% !important' }} 
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
                        <TextField {...params} label="Audit Type" size="small" sx={{ ...darkStyles.input, width: '100% !important' }} required />
                      )}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                          {option.auditType}
                        </li>
                      )}
                      sx={{ '& .MuiOutlinedInput-root': { p: 0.5 }, '& .MuiAutocomplete-tag': { bgcolor: isDark ? 'rgba(88, 166, 255, 0.2)' : 'primary.light', color: isDark ? '#58a6ff' : 'primary.main', fontWeight: 600, height: 24 } }}
                    />

                    <TextField
                      name="clause"
                      label="Clause"
                      fullWidth
                      size="small"
                      value={formData.clause}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      sx={{ ...darkStyles.input, width: '100% !important' }}
                    />

                    <TextField
                      name="criteriaText"
                      label="Audit Criteria"
                      fullWidth
                      multiline
                      rows={4}
                      size="small"
                      value={formData.criteriaText}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      required
                      sx={{ ...darkStyles.input, width: '100% !important' }}
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
                        <TextField {...params} label="Department" size="small" sx={{ ...darkStyles.input, width: '100% !important' }} required />
                      )}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                          {option.departmentName}
                        </li>
                      )}
                      sx={{ '& .MuiOutlinedInput-root': { p: 0.5 }, '& .MuiAutocomplete-tag': { bgcolor: isDark ? 'rgba(88, 166, 255, 0.2)' : 'secondary.light', color: isDark ? '#58a6ff' : 'secondary.main', fontWeight: 600, height: 24 } }}
                    />

                    <TextField
                      select
                      name="attachmentRequired"
                      label="Attachment required"
                      fullWidth
                      size="small"
                      value={formData.attachmentRequired}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      sx={{ ...darkStyles.input, width: '100% !important' }}
                    >
                      <MenuItem value="YES">YES</MenuItem>
                      <MenuItem value="NO">NO</MenuItem>
                    </TextField>

                    <TextField
                      select
                      name="status"
                      label="Status"
                      fullWidth
                      size="small"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      sx={{ ...darkStyles.input, width: '100% !important' }}
                    >
                      <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                      <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                    </TextField>
                  </Stack>
                </Box>
              </Box>
            </Box>

            {/* ── RIGHT COLUMN: Attachments ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
              <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconPaperclip size={20} color={theme.palette.secondary.main} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Attachments</Typography>
                  </Box>
                  <Button
                    startIcon={<IconPlus size={18} />}
                    size="small"
                    variant="contained"
                    sx={darkStyles.btnUpload}
                    onClick={handleAddAttachment}
                    disabled={isViewOnly}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1, bgcolor: isDark ? 'transparent' : 'grey.50' }}>
                  
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} />

                  <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: isDark ? 'background.paper' : '#fff' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: isDark ? '#1c2128' : 'grey.50' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>SI.</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>File Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'text.primary' }} align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attachments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                              <IconCloudUpload size={48} opacity={0.5} style={{ marginBottom: 8 }} />
                              <Typography variant="body2">No records found. Click Add to upload.</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          attachments.map((file, idx) => (
                            <TableRow key={file.id}>
                              <TableCell sx={{ color: 'text.primary' }}>{idx + 1}</TableCell>
                              <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.primary' }}>
                                <Tooltip
                                  title={
                                    <Box sx={{ p: 0.5 }}>
                                      {file.file && file.file.type.startsWith('image/') ? (
                                        <img src={URL.createObjectURL(file.file)} alt="preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} />
                                      ) : file.serverFileName && (file.fileType === 'PNG' || file.fileType === 'JPG' || file.fileType === 'JPEG') ? (
                                        <img src={`${axios.defaults.baseURL}api/files/download/${file.serverFileName}`} alt="preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} />
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
                                    onClick={(e) => { e.preventDefault(); handleOpenPreview(file); }}
                                    sx={{ cursor: 'pointer', textDecoration: 'none', color: isDark ? '#58a6ff' : 'primary.main', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                                  >
                                    {file.fileName}
                                  </Link>
                                </Tooltip>
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{file.fileType}</TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  <Tooltip title={file.serverFileName ? 'Preview / Download' : 'Preview Local'}>
                                    <IconButton size="small" sx={{ color: 'primary.main', bgcolor: isDark ? 'rgba(88, 166, 255, 0.1)' : '#e3f2fd', '&:hover': { bgcolor: 'primary.main', color: '#fff' } }} onClick={() => handleOpenPreview(file)}>
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
                </Box>
              </Box>
            </Box>

          </Box>
        </DialogContent>

        <Box sx={{ p: 3, borderTop: isDark ? '1px solid #30363d' : `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: darkStyles.dialog.bgcolor }}>
          {isViewOnly ? (
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
              <Button onClick={() => setIsEditing(true)} variant="contained" sx={{...darkStyles.btnSave, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }}} startIcon={<IconEdit size={20} />}>
                Edit
              </Button>
              <Button onClick={() => handleClose()} variant="outlined" sx={{ ...darkStyles.btnInactive, color: isDark ? '#fff' : 'inherit' }} startIcon={<IconX size={20} />}>
                Close
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {formData.id && (
                  <Button onClick={handleDelete} variant="contained" sx={darkStyles.btnInactive} startIcon={<IconTrash size={20} />}>
                    Delete
                  </Button>
                )}
                <Button onClick={handleClear} variant="contained" sx={darkStyles.btnClear} startIcon={<IconEraser size={20} />}>
                  Clear
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={handleSave} variant="contained" sx={darkStyles.btnSave} startIcon={<IconCheck size={20} />}>
                  Save
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>

      {/* Pop-up Preview Dialog */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2, height: '80vh', bgcolor: darkStyles.dialog.bgcolor } }}>
        <DialogTitle sx={{ bgcolor: isDark ? '#1c2128' : '#eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} component="div">
          <Typography variant="h4" component="span" sx={{ color: darkStyles.dialog.color }}>{previewFile?.fileName}</Typography>
          <IconButton onClick={handleClosePreview} sx={{ color: darkStyles.dialog.color }}><IconX size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', bgcolor: isDark ? 'background.default' : '#fafafa', overflow: 'auto' }}>
          {previewFile && (
            <Box sx={{ p: previewContent ? 3 : 0, width: '100%', height: '100%' }}>
              {previewContent && previewContent !== 'Loading...' ? (
                <Box
                  className="document-preview-container"
                  sx={{
                    bgcolor: isDark ? 'background.paper' : '#fff',
                    p: 4,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    minHeight: '100%',
                    color: 'text.primary',
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
                          <Typography variant="body2">This file format ({ext}) cannot be rendered directly in the browser.<br />Please use the button below to download or open it.</Typography>
                        </Box>
                      );
                    }
                  })()}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: isDark ? '#1c2128' : 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleClosePreview} sx={{ color: 'text.primary' }}>Close</Button>
          <Button
            variant="contained"
            sx={darkStyles.btnUpload}
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
