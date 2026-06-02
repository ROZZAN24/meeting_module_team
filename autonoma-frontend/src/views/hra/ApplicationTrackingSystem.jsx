import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Button, Stack, Checkbox, Box, FormControlLabel, Chip
} from '@mui/material';
import axios from 'utils/axios';
import {
  IconMail, IconCalendar, IconUserCheck, IconUserPlus, IconEdit, IconTrash, IconFileText
} from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import {
  BOSDataTable,
  BOSTableToolbar,
  getCommonDateFilters
} from 'ui-component/bos';
import { useLookups } from 'hooks/useLookups';
import { setFilterConfig } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';

export default function ApplicationTrackingSystem() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const perms = usePagePermissions(PAGE_CODES.HRA_ATS);

  // Lookups mapping
  const { departments = [], designations = [] } = useLookups(['DEPARTMENTS', 'DESIGNATIONS']);

  // Table and view states
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hra/applicants');
      setRows(data || []);
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to load applicant records.', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Initial data load
  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Update default filters
  useEffect(() => {
    const config = [{
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'APPLIED', label: 'APPLIED' },
          { value: 'INTERVIEWING', label: 'INTERVIEWING' },
          { value: 'OFFERED', label: 'OFFERED' },
          { value: 'ON-ROLL', label: 'ON-ROLL' },
          { value: 'REJECTED', label: 'REJECTED' }
        ],
        defaultValue: 'ALL',
        isStarred: true
      },
      ...getCommonDateFilters('createdAt', 'updatedAt')];
    dispatch(setFilterConfig(config));
    return () => {
      dispatch(setFilterConfig(null));
    };
  }, [dispatch]);

  // Navigation handlers
  const handleOpenAdd = () => {
    navigate('/master/hr/ats/create');
  };

  const handleOpenEdit = (row) => {
    navigate(`/master/hr/ats/create?id=${row.id}`);
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => navigate('/dashboard/default')
  });

  // Checkbox selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(rows.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Status updates via bottom action buttons
  const handleBulkAction = async (action, successMsg) => {
    if (selectedIds.length === 0) {
      dispatch(openSnackbar({ open: true, message: 'Select at least one applicant.', variant: 'alert', severity: 'warning' }));
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/hra/applicants/bulk-action', {
        ids: selectedIds,
        action: action
      });
      dispatch(openSnackbar({ open: true, message: successMsg, variant: 'alert', severity: 'success' }));
      setSelectedIds([]);
      fetchApplicants();
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Bulk action failed. Please try again.', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCallLetter = () => handleBulkAction('CALL', 'Call letters successfully processed for selected candidates!');
  const handleAssignInterview = () => handleBulkAction('INTERVIEW', 'Interviews assigned successfully.');
  const handleIssueOffer = () => handleBulkAction('OFFER', 'Offer letters generated and sent successfully.');
  const handlePushOnRoll = () => handleBulkAction('PUSH-ON-ROLL', 'Selected candidates successfully integrated and pushed ON-ROLL!');

  const handleCancelSelection = () => {
    setSelectedIds([]);
  };

  const handleEditSelected = () => {
    if (selectedIds.length !== 1) {
      dispatch(openSnackbar({ open: true, message: 'Select exactly one applicant to edit.', variant: 'alert', severity: 'warning' }));
      return;
    }
    const target = rows.find(r => r.id === selectedIds[0]);
    if (target) handleOpenEdit(target);
  };

  // Delete candidate from grid
  const handleDeleteRow = (row) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/hra/applicants/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Applicant deleted successfully.', variant: 'alert', severity: 'success' }));
      setDeleteDialogOpen(false);
      setSelectedIds([]);
      fetchApplicants();
    } catch (e) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete applicant.', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Setup grid columns
  const tableColumns = useMemo(() => [
    {
      id: 'select',
      label: '',
      minWidth: 50,
      render: (row) => (
        <Checkbox
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectRow(row.id)}
          size="small"
        />
      )
    },
    { id: 'index', label: 'Sl.no', minWidth: 60 },
    { id: 'enRolledNo', label: 'Enrolled No', minWidth: 120, bold: true, color: 'primary.main' },
    { id: 'firstName', label: 'First Name', minWidth: 120 },
    { id: 'lastName', label: 'Last Name', minWidth: 120 },
    {
      id: 'department',
      label: 'Dept Name',
      minWidth: 150,
      render: (row) => {
        const dept = departments.find(d => d.id.toString() === row.department || d.departmentName === row.department);
        return dept ? dept.departmentName : row.department || '-';
      }
    },
    {
      id: 'positionLookFor',
      label: 'Position Look for',
      minWidth: 150,
      render: (row) => {
        const desig = designations.find(d => d.id.toString() === row.positionLookFor || d.designationName === row.positionLookFor);
        return desig ? desig.designationName : row.positionLookFor || '-';
      }
    },
    { id: 'applicantDate', label: 'App Date', minWidth: 120 },
    {
      id: 'call',
      label: 'Call',
      minWidth: 100,
      render: (row) => (
        <Chip
          label={row.call || 'PENDING'}
          size="small"
          color={row.call === 'SENT' ? 'success' : 'default'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      id: 'interview',
      label: 'Interview',
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.interview || 'PENDING'}
          size="small"
          color={row.interview === 'SCHEDULED' ? 'warning' : row.interview === 'COMPLETED' ? 'success' : 'default'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      id: 'offer',
      label: 'Offer',
      minWidth: 100,
      render: (row) => (
        <Chip
          label={row.offer || 'PENDING'}
          size="small"
          color={row.offer === 'ISSUED' ? 'success' : 'default'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      id: 'verification',
      label: 'Verification',
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.verification || 'PENDING'}
          size="small"
          color={row.verification === 'VERIFIED' ? 'success' : 'default'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.status || 'APPLIED'}
          size="small"
          color={row.status === 'ON-ROLL' ? 'success' : row.status === 'REJECTED' ? 'error' : 'primary'}
          sx={{ fontWeight: 'bold' }}
        />
      )
    }
  ], [selectedIds, departments, designations]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUserPlus size={24} />
          <Typography variant="h3">Application Tracking System</Typography>
        </Stack>
      }
      secondary={
        <BOSTableToolbar
          onRefresh={fetchApplicants}
          onNew={handleOpenAdd}
          newLabel="New"
          newTooltip={shortcutTooltip('Register Candidate', 'Ctrl + N')}
          hasWritePermission={perms.write}
        >
          <Button variant="outlined" color="primary" onClick={handleSendCallLetter} startIcon={<IconMail size={18} />} sx={{ borderRadius: '24px', textTransform: 'none' }}>
            Call Letter
          </Button>
          <Button
            variant="outlined"
            onClick={handleAssignInterview}
            startIcon={<IconCalendar size={18} />}
            sx={{
              borderRadius: '24px',
              textTransform: 'none',
              color: 'orange.dark',
              borderColor: 'orange.main',
              '&:hover': {
                borderColor: 'orange.dark',
                bgcolor: 'orange.light'
              }
            }}
          >
            Assign Interview
          </Button>
          <Button variant="outlined" color="success" onClick={handleIssueOffer} startIcon={<IconFileText size={18} />} sx={{ borderRadius: '24px', textTransform: 'none' }}>
            Offer Letter
          </Button>
          <Button variant="contained" color="success" onClick={handlePushOnRoll} startIcon={<IconUserCheck size={18} />} sx={{ borderRadius: '24px', textTransform: 'none', fontWeight: 600 }}>
            Push To On-Roll
          </Button>
          <Button variant="outlined" color="error" onClick={handleCancelSelection} sx={{ borderRadius: '24px', textTransform: 'none' }}>
            Cancel Selection
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleEditSelected} disabled={selectedIds.length !== 1} startIcon={<IconEdit size={18} />} sx={{ borderRadius: '24px', textTransform: 'none' }}>
            Edit Candidate
          </Button>
        </BOSTableToolbar>
      }
    >
      <Box sx={{ mb: 2 }}>
        {/* Bulk select checkbox info */}
        <FormControlLabel
          control={
            <Checkbox
              indeterminate={selectedIds.length > 0 && selectedIds.length < rows.length}
              checked={selectedIds.length === rows.length && rows.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              size="small"
            />
          }
          label={`Select All Candidates (${selectedIds.length} selected)`}
          sx={{ ml: 1 }}
        />
      </Box>

      {/* Main Grid Table */}
      <BOSDataTable
        columns={tableColumns}
        rows={rows}
        page={page}
        size={size}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteRow}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Applicant"
        message="Are you sure you want to completely remove this candidate application?"
        itemName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''}
      />
    </MainCard>
  );
}
