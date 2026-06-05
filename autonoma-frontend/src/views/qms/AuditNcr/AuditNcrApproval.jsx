import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Box, Chip, MenuItem, useTheme } from '@mui/material';
import { IconFileDownload, IconCircleCheck, IconRefresh, IconUser, IconChecks, IconX, IconEye, IconExternalLink } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { format, differenceInDays } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import {
  BOSDataTable, BOSFormDialog, BOSFormSection, BOSTextField, BOSPersonnelCard, useBOSForm, getStatusChipSx, btnNew, BOSTableToolbar, getCommonDateFilters, matchCommonDateFilters, errorStyle } from 'ui-component/bos';
import { getFileDownloadUrl, getFileViewUrl } from 'utils/upload-helper';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import useAuth from 'hooks/useAuth';

// ==============================|| AUDIT NCR / OFI APPROVAL (REDESIGNED) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'ncrNo', label: 'NC No', minWidth: 130, bold: true },
  { id: 'departmentName', label: 'Department', minWidth: 130 },
  { id: 'remarks', label: 'Comment', minWidth: 200 },
  { id: 'rootCause', label: 'Root Cause', minWidth: 200 },
  { id: 'correctiveAction', label: 'Corrective Action', minWidth: 200 },
  { id: 'preventiveAction', label: 'Preventive Action', minWidth: 200 },
  { id: 'observationNo', label: 'Observation No', minWidth: 250 },
  { id: 'criteriaDetails', label: 'Criteria Details', minWidth: 250 },
  { id: 'createdDate', label: 'Created Date', minWidth: 130 },
  { id: 'ncrStatus', label: 'Status', minWidth: 130 }
];

export default function AuditNcrApproval() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_NCR_APPROVAL);

  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [criteriaList, setCriteriaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [ncrAttachments, setNcrAttachments] = useState([]);

  const { formData, handleFormChange, updateForm, resetForm } = useBOSForm({ remarks: '' });
  const [errors, setErrors] = useState({});

  // Match criteria by seqNo or clause+auditType fallback
  const matchingCriteria = useMemo(() => {
    if (!selectedFinding || !criteriaList.length) return null;
    let match = criteriaList.find(c => String(c.seqNo) === String(selectedFinding.seqNo));
    if (!match && selectedFinding.clause) {
      match = criteriaList.find(c => 
        String(c.clause).toLowerCase() === String(selectedFinding.clause).toLowerCase() &&
        (!selectedFinding.auditType || !c.auditType || 
          String(c.auditType).toLowerCase().includes(String(selectedFinding.auditType).toLowerCase()))
      );
    }
    return match;
  }, [selectedFinding, criteriaList]);

  // Parse criteria attachments from JSON
  const criteriaAttachments = useMemo(() => {
    if (!matchingCriteria?.attachmentInfo) return [];
    try {
      const parsed = JSON.parse(matchingCriteria.attachmentInfo);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [matchingCriteria]);

  // Parse observation detail attachments robustly
  const observationAttachments = useMemo(() => {
    const path = selectedFinding?.attachmentPath;
    if (!path || !path.trim()) return [];
    try {
      const parsed = JSON.parse(path);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          fileName: item.fileName || item.serverFileName?.split('/').pop() || 'Document',
          serverFileName: item.serverFileName || item.filePath || ''
        }));
      }
    } catch (e) { /* Not JSON */ }
    return path.split(',').filter(Boolean).map(p => ({
      fileName: p.trim().split('/').pop(),
      serverFileName: p.trim()
    }));
  }, [selectedFinding]);

  // Filter NCR attachments by category
  const rootCauseAttachments = useMemo(() => ncrAttachments.filter(a => a.fileType === 'ROOT_CAUSE'), [ncrAttachments]);
  const correctiveAttachments = useMemo(() => ncrAttachments.filter(a => a.fileType === 'CORRECTIVE'), [ncrAttachments]);
  const preventiveAttachments = useMemo(() => ncrAttachments.filter(a => a.fileType === 'PREVENTIVE'), [ncrAttachments]);

  const getEmployeeDetails = (input) => {
    if (!input) return {};
    const parts = input.split(' - ');
    const emp = employees.find(e => e.employeeName === parts[0]?.trim() || e.empCode === input);
    if (!emp) return { empCode: parts[1]?.trim() || '-', departmentName: '-', level: '-' };
    return {
      ...emp,
      departmentName: emp.department?.departmentName || '-',
      level: emp.empLevelId ? `L${emp.empLevelId}` : '-'
    };
  };

  const filteredRows = useMemo(() => {
    const activeType = globalFilters.type || 'mine';
    return rows.filter((row) => {
      if (activeType === 'mine') {
        if (!user) return false;
        const username = String(user.id || '').toLowerCase().trim();
        const empCode = String(user.empCode || user.employeeCode || '').toLowerCase().trim();
        const fullName = String(user.name || '').toLowerCase().trim();
        const auditor = String(row.auditor || '').toLowerCase();
        const approver = String(row.ncrApprovedBy || '').toLowerCase();
        return (
          (username && (approver.includes(username) || auditor.includes(username))) ||
          (empCode && (approver.includes(empCode) || auditor.includes(empCode))) ||
          (fullName && (approver.includes(fullName) || auditor.includes(fullName)))
        );
      }
      if (activeType === 'team') {
        if (!user || !user.departmentName) return false;
        const userDept = String(user.departmentName).toLowerCase().trim();
        const rowDept = String(row.departmentName || '').toLowerCase().trim();
        return userDept && rowDept && (userDept === rowDept || rowDept.includes(userDept) || userDept.includes(rowDept));
      }
      return true; // company
    });
  }, [rows, globalFilters.type, user]);

  useEffect(() => {
    setPage(0);
  }, [globalFilters.type]);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'type', label: 'Type', type: 'select', options: [{ value: 'mine', label: 'Mine' }, { value: 'team', label: 'Team' }, { value: 'company', label: 'Company' }], defaultValue: 'mine', isStarred: true },
      { id: 'observationStatus', label: 'Obr Status', type: 'select', options: [{ value: 'All', label: 'ALL' }, { value: 'NC', label: 'NC' }, { value: 'OFI', label: 'OFI' }], defaultValue: 'All' },
      { id: 'ncrStatus', label: 'Status', type: 'select', options: [{ value: 'All', label: 'ALL' }, { value: 'WAITING_APPROVAL', label: 'PENDING FOR APPROVAL' }, { value: 'CLOSED', label: 'APPROVED' }, { value: 'UNRESOLVED', label: 'UNRESOLVED' }], defaultValue: 'WAITING_APPROVAL', isStarred: true },
      { id: 'searchBy', label: 'Search By', type: 'select', options: [{ value: 'ncrNo', label: 'NC No' }, { value: 'observationNo', label: 'Observation No' }], defaultValue: 'ncrNo' },
      ...getCommonDateFilters('createdDate', 'updatedAt')
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setSelectedRecord(null);
    try {
      const fromDate = globalFilters.createdDateStart || undefined;
      const toDate = globalFilters.createdDateEnd || undefined;
      const considerDate = globalFilters.createdDateConsider || 'No';

      const [fRes, eRes, cRes] = await Promise.all([
        axios.get('/api/qms/audit/observation/ncr/findings', {
          params: {
            ...globalFilters,
            fromDate,
            toDate,
            considerDate,
            query: globalQuery
          }
        }),
        axios.get('/api/master/hr/employees'),
        axios.get('/api/master/qms/audit-criteria')
      ]);
      setRows(fRes.data || []);
      setEmployees(eRes.data || []);
      setCriteriaList(cRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [globalFilters, globalQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchNcrAttachments = async (detailId) => {
    try {
      const res = await axios.get(`/api/qms/ncr-ofi/attachments/${detailId}`);
      setNcrAttachments(res.data || []);
    } catch (e) {
      setNcrAttachments([]);
    }
  };

  const [isNewMode, setIsNewMode] = useState(false);

  const handleOpenReview = async (row) => {
    setIsNewMode(false);
    setSelectedFinding(row);
    updateForm({ remarks: '' });
    setErrors({});
    setNcrAttachments([]);
    fetchNcrAttachments(row.id);
    setDialogOpen(true);
  };

  const handleOpenNew = () => {
    setIsNewMode(true);
    setSelectedFinding(null);
    resetForm();
    setErrors({});
    setNcrAttachments([]);
    setDialogOpen(true);
  };

  const handleFindingSelectChange = async (e) => {
    const findingId = e.target.value;
    const row = rows.find(r => r.id === findingId);
    if (row) {
      setSelectedFinding(row);
      updateForm({ remarks: '' });
      setErrors({});
      setNcrAttachments([]);
      fetchNcrAttachments(row.id);
    } else {
      setSelectedFinding(null);
      resetForm();
      setNcrAttachments([]);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setIsNewMode(false);
    setSelectedFinding(null);
    setSelectedRecord(null);
    resetForm();
    setNcrAttachments([]);
  };

  const handleProcessApproval = async (status) => {
    if (!selectedFinding) return;
    if (!formData.remarks || !formData.remarks.trim()) {
      setErrors({ remarks: 'Comments are required *' });
      dispatch(
        openSnackbar({
          open: true,
          message: 'Comments are mandatory for approval or rejection',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'error',
          close: false
        })
      );
      return;
    }
    
    try {
      const endpoint = status === 'APPROVED' ? 'approve' : 'reject';
      await axios.put(`/api/qms/audit/observation/ncr/${endpoint}/${selectedFinding.id}`, null, {
        params: { remarks: formData.remarks }
      });
      // Issue 4: Use filled alert variant for proper in-app popup on approve/reject
      dispatch(openSnackbar({ 
        open: true, 
        message: `NC / OFI ${status === 'APPROVED' ? 'APPROVED' : 'REJECTED'} successfully!`, 
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: status === 'APPROVED' ? 'success' : 'error',
        close: false
      }));
      
      // Broadcast status update for reactive reload in other views
      try {
        const channel = new BroadcastChannel('ncr_status_channel');
        channel.postMessage({
          type: 'NCR_STATUS_UPDATED',
          id: selectedFinding.id,
          ncrStatus: status === 'APPROVED' ? 'CLOSED' : 'REJECTED'
        });
        channel.close();
      } catch (err) {
        console.error('Broadcast failed:', err);
      }

      handleCloseDialog();
      setRows((prevRows) => prevRows.filter((r) => r.id !== selectedFinding.id));
      fetchData();
    } catch (e) {
      let errorMsg = 'Process failed';
      if (typeof e === 'string') {
        errorMsg = e;
      } else if (e.response?.data) {
        errorMsg = e.response.data.message || (typeof e.response.data === 'string' ? e.response.data : errorMsg);
      } else if (e.message) {
        errorMsg = e.message;
      }
      dispatch(openSnackbar({ open: true, message: errorMsg, severity: 'error' }));
    }
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'ncrStatus') {
        const status = row.ncrStatus || 'OPEN';
        let displayLabel = status === 'WAITING_APPROVAL' ? 'PENDING FOR APPROVAL' : status.replace('_', ' ');
        if (status === 'CLOSED') {
            displayLabel = 'APPROVED';
        }
        if (status === 'OPEN') {
            displayLabel = 'PENDING';
        }
        return <Chip label={displayLabel} size="small" sx={getStatusChipSx(status === 'CLOSED' ? 'ACTIVE' : (status === 'OPEN' || status === 'WAITING_APPROVAL' ? 'PENDING' : 'INACTIVE'))} />;
    }
    const val = row[col.id];
    if (['observationDate', 'targetDate'].includes(col.id)) return val ? format(new Date(val), 'dd/MM/yyyy') : '-';
    if (col.id === 'createdDate') return val ? format(new Date(val), 'dd/MM/yyyy HH:mm') : '-';
    return String(val || '-');
  };

  const getDelayDays = () => {
    if (!selectedFinding?.targetDate) return 0;
    const d = differenceInDays(new Date(), new Date(selectedFinding.targetDate));
    return d > 0 ? d : 0;
  };

  // Render a document panel
  const renderDocumentPanel = (title, attachmentsList, bgColor = '#e3f2fd') => (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
      <Box sx={{ bgcolor: bgColor, color: 'rgba(0, 0, 0, 0.87)', py: 1, px: 2, textAlign: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
        {title}
      </Box>
      <Box sx={{ p: 1.5, minHeight: '160px', bgcolor: 'background.paper' }}>
        {attachmentsList.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {attachmentsList.map((att, idx) => {
              const path = att.filePath || att.serverFileName || '';
              const name = att.fileName || path.split('/').pop() || 'Document';
              const downloadUrl = getFileDownloadUrl(path);
              const viewUrl = getFileViewUrl(path);
              const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name);
              
              return (
                <Box key={idx}>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center"
                    onClick={() => window.open(downloadUrl, '_blank')}
                    sx={{ 
                      cursor: 'pointer', 
                      p: 0.5,
                      borderRadius: '6px',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {idx + 1}.
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'primary.main', 
                        textDecoration: 'underline',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {name}
                    </Typography>
                    <IconButton size="small" color="primary" sx={{ p: 0.5 }}>
                      <IconFileDownload size={16} />
                    </IconButton>
                  </Stack>
                  {isImage && (
                    <Box 
                      sx={{ 
                        mt: 0.5, 
                        borderRadius: '6px', 
                        overflow: 'hidden', 
                        border: '1px solid', 
                        borderColor: 'divider',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.85 }
                      }}
                      onClick={() => window.open(viewUrl, '_blank')}
                    >
                      <Box 
                        component="img" 
                        src={viewUrl} 
                        alt={name}
                        sx={{ width: '100%', maxHeight: '180px', objectFit: 'contain', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '120px' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No documents attached.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <MainCard fullWidth
      title={<Stack direction="row" alignItems="center" spacing={1.5}><IconChecks size={24} /><Typography variant="h3">NC / OFI Approval & CAPA Management</Typography></Stack>}
      secondary={
        <BOSTableToolbar
          onRefresh={fetchData}
          onCloseNcr={perms.write ? () => selectedRecord && handleOpenReview(selectedRecord) : null}
          closeNcrDisabled={!selectedRecord}
          closeNcrTooltip={selectedRecord ? "Close Selected NC / OFI" : "Select a record first to close"}
          closeNcrLabel="Close NC / OFI"
          hasWritePermission={perms.write}
          exportData={filteredRows}
          exportFilename="NC_Approval_Report"
          hasExportPermission={perms.export}
          columns={columns}
        />
      }
    >
      <BOSDataTable 
        columns={columns} 
        rows={filteredRows.slice(page * size, page * size + size)} 
        page={page} 
        size={size} 
        totalCount={filteredRows.length} 
        loading={loading} 
        onPageChange={setPage} 
        onSizeChange={setSize} 
        onDoubleClickRow={handleOpenReview} 
        renderCell={renderCell} 
        selectedRowId={selectedRecord?.id}
        onClickRow={(row) => setSelectedRecord(row)}
        customActions={(row) => (
          <Tooltip title="Review & Approve">
            <IconButton 
              size="small" 
              color="success" 
              onClick={() => handleOpenReview(row)} 
              disabled={row.ncrStatus === 'CLOSED' || row.ncrStatus === 'REJECTED'} 
              sx={{ bgcolor: 'success.light', color: 'success.dark', '&:hover': { bgcolor: 'success.main', color: 'white' } }}
            >
              <IconEye size={18} />
            </IconButton>
          </Tooltip>
        )} 
      />

      <BOSFormDialog open={dialogOpen} onClose={handleCloseDialog} title="NC / OFI Approval" maxWidth="lg" hideFooter={true}>
        <Stack spacing={3} sx={{ width: '100%' }}>
          
          {/* ═══════════════ PREMIUM HEADER BAR ═══════════════ */}
          <Box sx={{ 
            bgcolor: '#1565C0', 
            borderRadius: '12px', 
            p: 2, 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 2,
            boxShadow: '0 4px 20px rgba(21, 101, 192, 0.25)',
            width: '100%'
          }}>
            <Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center">
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                NC No : <Box component="span" sx={{ color: '#ffffff', fontWeight: 800 }}>{selectedFinding?.ncrNo || selectedFinding?.ncrOfiNo || '-'}</Box>
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                Date : <Box component="span" sx={{ color: '#ffffff', fontWeight: 800 }}>{selectedFinding?.observationDate ? format(new Date(selectedFinding.observationDate), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}</Box>
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                Observation No : <Box component="span" sx={{ color: '#ffffff', fontWeight: 800 }}>{selectedFinding?.observationNo || '-'}</Box>
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                Schedule No : <Box component="span" sx={{ color: '#ffffff', fontWeight: 800 }}>{selectedFinding?.auditScheduleNo || '-'}</Box>
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                Delay Days : <Box component="span" sx={{ color: '#ff8a80', fontWeight: 800 }}>{getDelayDays()}</Box>
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="contained" 
                startIcon={<IconX size={18} />} 
                onClick={() => handleProcessApproval('REJECTED')}
                disabled={!selectedFinding}
                sx={{ 
                  borderRadius: '8px', 
                  bgcolor: '#d32f2f', 
                  color: 'white', 
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#b71c1c' }
                }}
              >
                Rejected
              </Button>
              <Button 
                variant="contained" 
                startIcon={<IconCircleCheck size={18} />} 
                onClick={() => handleProcessApproval('APPROVED')}
                disabled={!selectedFinding}
                sx={{ 
                  borderRadius: '8px', 
                  bgcolor: '#2e7d32', 
                  color: 'white', 
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#1b5e20' }
                }}
              >
                Approved
              </Button>
            </Stack>
          </Box>

          {/* ═══════════════ MAIN CONTENT: LEFT FIELDS + RIGHT PERSONNEL ═══════════════ */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.8fr 1.2fr' }, gap: 4, width: '100%' }}>
            
            {/* LEFT COLUMN — Read-only / Select fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {isNewMode && (
                <BOSTextField
                  select
                  label="Observation No *"
                  name="observationNoSelect"
                  value={selectedFinding?.id || ''}
                  onChange={handleFindingSelectChange}
                  error={!!errors.observationNo}
                  helperText={errors.observationNo}
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value=""><em>— Select Observation —</em></MenuItem>
                  {rows
                    .filter(r => r.ncrStatus === 'WAITING_APPROVAL')
                    .map(r => (
                      <MenuItem key={r.id} value={r.id}>
                        {`${r.observationNo} (${r.observationStatus}) - ${r.criteriaDetails || ''}`.substring(0, 100)}
                      </MenuItem>
                    ))}
                </BOSTextField>
              )}
              <BOSTextField label="Audit Type" value={selectedFinding?.auditType || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
              <BOSTextField label="Audit Area" value={selectedFinding?.auditAreaDetail || selectedFinding?.departmentName || ''} inputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} />
              
              <Box sx={{ position: 'relative' }}>
                <BOSTextField 
                  label="Audit Criteria Details" 
                  value={selectedFinding?.criteriaDetails || ''} 
                  multiline 
                  rows={2} 
                  inputProps={{ readOnly: true }} 
                  InputLabelProps={{ shrink: true }} 
                />
                {criteriaAttachments.length > 0 && (
                  <Tooltip title="View criteria attachment">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => {
                        const att = criteriaAttachments[0];
                        const url = getFileViewUrl(att.serverFileName || att.filePath || '');
                        window.open(url, '_blank');
                      }}
                      sx={{ position: 'absolute', top: 8, right: 8, border: '1px solid', borderColor: 'divider', p: 0.5 }}
                    >
                      <IconEye size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Box sx={{ position: 'relative' }}>
                <BOSTextField 
                  label="Comments" 
                  value={selectedFinding?.remarks || selectedFinding?.clause || ''} 
                  multiline 
                  rows={2} 
                  inputProps={{ readOnly: true }} 
                  InputLabelProps={{ shrink: true }} 
                />
                {observationAttachments.length > 0 && (
                  <Tooltip title="View observation attachment">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => {
                        const att = observationAttachments[0];
                        const url = getFileViewUrl(att.serverFileName || '');
                        window.open(url, '_blank');
                      }}
                      sx={{ position: 'absolute', top: 8, right: 8, border: '1px solid', borderColor: 'divider', p: 0.5 }}
                    >
                      <IconEye size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <BOSTextField 
                label="Comments *" 
                value={formData.remarks || ''} 
                name="remarks"
                onChange={handleFormChange}
                multiline 
                rows={2} 
                InputLabelProps={{ shrink: true }}
                error={!!errors.remarks}
                helperText={errors.remarks}
                placeholder="Enter approval / rejection remarks..."
                sx={errorStyle(!!errors.remarks)}
              />
            </Box>

            {/* RIGHT COLUMN — Personnel Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <BOSFormSection title="Personnel Information" icon={<IconUser size={20} color={theme.palette.primary.main} />}>
                <Stack spacing={3}>
                  <BOSPersonnelCard 
                    title="AUDITEE" 
                    name={selectedFinding?.auditee && selectedFinding.auditee.includes(' - ') ? selectedFinding.auditee.split(' - ')[0].trim() : selectedFinding?.auditee} 
                    empCode={getEmployeeDetails(selectedFinding?.auditee).empCode}
                    department={getEmployeeDetails(selectedFinding?.auditee).departmentName}
                    photo={getEmployeeDetails(selectedFinding?.auditee).employeePhotoUpload}
                    level={getEmployeeDetails(selectedFinding?.auditee).level}
                    color="primary.main"
                  />
                  <BOSPersonnelCard 
                    title="AUDITOR" 
                    name={selectedFinding?.auditor && selectedFinding.auditor.includes(' - ') ? selectedFinding.auditor.split(' - ')[0].trim() : selectedFinding?.auditor} 
                    empCode={getEmployeeDetails(selectedFinding?.auditor).empCode}
                    department={getEmployeeDetails(selectedFinding?.auditor).departmentName}
                    photo={getEmployeeDetails(selectedFinding?.auditor).employeePhotoUpload}
                    level={getEmployeeDetails(selectedFinding?.auditor).level}
                    color="secondary.main"
                  />
                </Stack>
              </BOSFormSection>
            </Box>
          </Box>

          {/* ═══════════════ ACTION ROW: Root Cause | Corrective | Preventive ═══════════════ */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5, width: '100%' }}>
            {[
              { label: 'Root Cause', value: selectedFinding?.rootCause },
              { label: 'Corrective Action', value: selectedFinding?.correctiveAction },
              { label: 'Preventive Action', value: selectedFinding?.preventiveAction }
            ].map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5 }}>
                <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap', width: '110px' }}>
                  {item.label}
                </Typography>
                <Box sx={{ 
                  flex: 1, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: '4px',
                  p: 1,
                  minHeight: '38px',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.primary', wordBreak: 'break-word' }}>
                    {item.value || '-'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* ═══════════════ DOCUMENT PANELS: 3 Columns ═══════════════ */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5, width: '100%' }}>
            {renderDocumentPanel('Root Cause Document', rootCauseAttachments, '#ffe082')}
            {renderDocumentPanel('Corrective Action Document', correctiveAttachments, '#ffe082')}
            {renderDocumentPanel('Preventive Action Document', preventiveAttachments, '#ffe082')}
          </Box>

        </Stack>
      </BOSFormDialog>
    </MainCard>
  );
}
