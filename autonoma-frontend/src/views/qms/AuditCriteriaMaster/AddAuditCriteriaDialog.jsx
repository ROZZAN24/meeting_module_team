import React, { useState, useEffect, useRef } from 'react';
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
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  IconTrash,
  IconPlus,
  IconPaperclip,
  IconSettings,
  IconMicrophone,
  IconMicrophoneOff
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSFileUpload } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import useLookups from 'hooks/useLookups';
import useAuth from 'hooks/useAuth';

// ==============================|| AUDIT CRITERIA - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const AddAuditCriteriaDialog = ({ open, handleClose, initialData, readOnly = false, nextSeq = '' }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    seqNo: '',
    auditType: [],
    clause: '',
    criteriaText: '',
    department: [],
    attachmentRequired: 'NO',
    status: 'ACTIVE'
  });
  const { user } = useAuth();
  const { auditTypes = [], departments: deptLookups = [] } = useLookups(['AUDIT_TYPE', 'DEPARTMENTS']);
  const [attachments, setAttachments] = useState([]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = 'en-US';

    recog.onstart = () => {
      setIsListening(true);
    };

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        const cleaned = transcript
          .replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"']+|[.,\/#!$%\^&\*;:{}=\-_`~()?"']+$/g, '')
          .trim()
          .toUpperCase();
        setFormData((prev) => ({
          ...prev,
          criteriaText: prev.criteriaText ? `${prev.criteriaText} ${cleaned}` : cleaned
        }));
      }
      setIsListening(false);
    };

    recog.onerror = (event) => {
      console.error('Speech recognition error in dialog', event.error);
      setIsListening(false);

      let errorMsg = 'Error during voice recognition. Please try again.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission denied. Please allow microphone access in your browser address bar/settings.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech detected. Please speak clearly into the microphone.';
      } else if (event.error === 'network') {
        errorMsg = 'Network error. Speech recognition requires an active internet connection.';
      } else if (event.error === 'audio-capture') {
        errorMsg = 'No microphone detected. Please connect a mic and try again.';
      }

      dispatch(
        openSnackbar({
          open: true,
          message: errorMsg,
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: event.error === 'no-speech' ? 'info' : 'error',
          close: false
        })
      );
    };

    recog.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recog;

    return () => {
      recog.onstart = null;
      recog.onresult = null;
      recog.onerror = null;
      recog.onend = null;
      try { recog.abort(); } catch (_) {}
      recognitionRef.current = null;
    };
  }, [dispatch]);

  const handleMicClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const recog = recognitionRef.current;
    if (isListening) {
      if (recog) recog.stop();
    } else {
      if (recog) {
        try { recog.start(); } catch (err) { console.warn('Mic start error:', err); }
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Speech Recognition is not supported by your browser.',
            variant: 'alert',
            alert: { variant: 'filled' },
            severity: 'warning',
            close: false
          })
        );
      }
    }
  };

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
        status: initialData.status || 'ACTIVE',
        createdUser: initialData.createdUser
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
    } else if (name === 'criteriaText') {
      // SOP: Audit Criteria field should automatically convert to uppercase
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
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
    // SOP: Validation Rules & Messages
    if (!formData.seqNo) {
      alert('Sequence No should be mandatory (Auto generated).');
      return;
    }
    if (!formData.auditType || formData.auditType.length === 0) {
      alert('At least one Audit Type should be selected.');
      return;
    }
    if (!formData.criteriaText?.trim()) {
      alert('Audit Criteria field should not be empty.');
      return;
    }
    if (!formData.department || formData.department.length === 0) {
      alert('At least one Department should be selected.');
      return;
    }

    try {
      const updatedAttachments = [...attachments];

      const submissionData = {
        ...formData,
        auditType: Array.isArray(formData.auditType) ? formData.auditType.join(', ') : formData.auditType,
        department: Array.isArray(formData.department) ? formData.department.join(', ') : formData.department,
        attachmentInfo: JSON.stringify(updatedAttachments.map(att => ({
          id: att.id,
          fileName: att.fileName,
          fileType: att.fileType || 'FILE',
          serverFileName: att.serverFileName,
          docDetails: att.docDetails || ''
        }))),
        createdUser: formData.id ? formData.createdUser : (user?.empId || '1001'),
        updatedUser: user?.empId || '1001'
      };

      if (formData.id) {
        await axios.put(`${API_PATHS.QMS.AUDIT_CRITERIA}/${formData.id}`, submissionData);
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_CRITERIA, submissionData);
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save audit criteria:', error);
      if (error.response?.data && typeof error.response.data === 'string') {
        alert(error.response.data);
      } else {
        alert('Error saving data. Please try again.');
      }
    }
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
      title={initialData ? 'Edit Audit Criteria' : 'Audit Criteria'}
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
              // SOP: Sequence No should be displayed in highlighted format.
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)',
                  fontWeight: 'bold',
                  color: 'primary.main'
                } 
              }}
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
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                    {option.auditType}
                  </li>
                );
              }}
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
              InputProps={{
                endAdornment: !isViewOnly && (
                  <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                     <IconButton
                      color={isListening ? 'error' : 'primary'}
                      onClick={(e) => handleMicClick(e)}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      sx={{
                        animation: isListening ? 'pulse 1.5s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.2)' },
                          '100%': { transform: 'scale(1)' }
                        }
                      }}
                    >
                      {isListening ? <IconMicrophoneOff size={20} /> : <IconMicrophone size={20} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
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
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                    {option.departmentName}
                  </li>
                );
              }}
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
          <BOSFormSection title="Attachments" icon={<IconPaperclip size={20} color={theme.palette.secondary.main} />}>
            <BOSFileUpload
              files={attachments}
              onChange={setAttachments}
              module="QMS"
              multiple={true}
              disabled={isViewOnly}
            />
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
