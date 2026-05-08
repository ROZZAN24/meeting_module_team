import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  Autocomplete,
  Checkbox,
  Box,
  Button,
  Typography,
  IconButton,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  IconTrash,
  IconPlus,
  IconPaperclip,
  IconSettings
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSFileGallery } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import useLookups from 'hooks/useLookups';

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
  const { auditTypes = [], departments: deptLookups = [] } = useLookups(['AUDIT_TYPE', 'DEPARTMENTS']);
  const [attachments, setAttachments] = useState([]);

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
      setFormData((prev) => ({ ...prev, [name]: selectedNames }));
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
      await axios.delete(`${API_PATHS.QMS.AUDIT_CRITERIA}/${formData.id}`);
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete audit criteria:', error);
    }
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
        await axios.put(`${API_PATHS.QMS.AUDIT_CRITERIA}/${formData.id}`, submissionData);
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_CRITERIA, submissionData);
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
              options={deptLookups}
              getOptionLabel={(option) => option.departmentName || ''}
              value={deptLookups.filter((d) => (formData.department || []).includes(d.departmentName))}
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

            <BOSTextField select name="attachmentRequired" label="Attachment required" value={formData.attachmentRequired} onChange={handleChange} disabled={isViewOnly}>
              <MenuItem value="YES">YES</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </BOSTextField>

            <BOSTextField select name="status" label="Status" value={formData.status} onChange={handleChange} disabled={isViewOnly}>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            </BOSTextField>
          </BOSFormSection>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
          <BOSFormSection title="Attachments" icon={<IconPaperclip size={20} color={theme.palette.secondary.main} />}
            action={
              <Button startIcon={<IconPlus size={18} />} size="small" variant="contained" onClick={handleAddAttachment} disabled={isViewOnly} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                Add
              </Button>
            }
          >
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} />
            <BOSFileGallery files={attachments} onRemove={(idx) => handleRemoveAttachment(attachments[idx].id)} isEditing={!isViewOnly} />
          </BOSFormSection>
        </Box>
      </Box>
    </BOSFormDialog>
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
