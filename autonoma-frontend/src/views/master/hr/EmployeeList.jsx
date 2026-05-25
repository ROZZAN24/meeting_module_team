import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Button, Stack, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Autocomplete, TextField, Box, Avatar
} from '@mui/material';
import { IconFileDownload, IconRefresh, IconUsers, IconUser, IconUserCheck, IconShieldCheck } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, BOSFormSection, btnExport, btnNew, getPhotoUrl, btnSave, btnCancel } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import { useLookups } from 'hooks/useLookups';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| EMPLOYEE MASTER LIST (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: 'Sno', minWidth: 50 },
  { id: 'photo', label: 'PHOTO', minWidth: 80 },
  { id: 'firstName', label: 'First Name', required: true, minWidth: 120 },
  { id: 'lastName', label: 'Last Name', required: true, minWidth: 120 },
  { id: 'designationId', label: 'Designation', minWidth: 150 },
  { id: 'gradeCode', label: 'Grade', required: true, minWidth: 100 },
  { id: 'departmentId', label: 'Department', required: true, minWidth: 150 },
  { id: 'empCode', label: 'Emp Code', required: true, minWidth: 120 },
  { id: 'unitId', label: 'Unit Name', minWidth: 120 },
  { id: 'homeManagerName', label: 'Home Manager', minWidth: 150 },
  { id: 'businessManagerName', label: 'Business Manager', minWidth: 150 },
  { id: 'supplierName', label: 'Supplier Name', minWidth: 150 },
  { id: 'createdBy', label: 'CREATED BY', minWidth: 120 },
  { id: 'createdDate', label: 'CREATED DATE', minWidth: 150 },
  { id: 'updatedBy', label: 'UPDATED BY', minWidth: 120 },
  { id: 'updatedDate', label: 'UPDATED DATE', minWidth: 150 }
];

export default function EmployeeList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const perms = usePagePermissions(PAGE_CODES.EMP_MASTER);
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  // Row selection for manager mapping
  const [selectedRow, setSelectedRow] = useState(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [eligibleManagers, setEligibleManagers] = useState([]);
  const [mappingState, setMappingState] = useState({
    homeManagerId: '',
    businessManagerId: '',
    verticalHeadId: '',
    hrId: ''
  });
  
  // Mapping list from API
  const [mappings, setMappings] = useState([]);

  // Resolution Lookups
  const { 
    departments = [], 
    designations = [], 
    levels = [],
    users = [],
    grades = []
  } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'LEVELS', 'USERS', 'GRADES']);

  const getDeptName = (id) => String(departments.find(d => String(d.id) === String(id))?.departmentName || id || '-');
  const getDesigName = (id) => String(designations.find(d => String(d.id) === String(id))?.designationName || id || '-');
  const getLevelName = (id) => String(levels.find(l => String(l.rowId) === String(id))?.level || id || '-');
  const getUnitName = (id) => String([{ id: 1, name: 'UNIT 1' }, { id: 2, name: 'UNIT 2' }].find(u => String(u.id) === String(id))?.name || id || '-');

  // Helper: format manager dropdown label as "Name - EmpCode / Designation / Level"
  const getManagerLabel = (option) => {
    if (!option) return '';
    const name = `${option.firstName || option.employeeName || ''} ${option.lastName || ''}`.trim();
    const code = option.empCode || '';
    const desig = option.designationId ? getDesigName(option.designationId) : (option.designationName || '-');
    const level = option.empLevelId ? getLevelName(option.empLevelId) : '-';
    return `${name} - ${code} / ${desig} / ${level}`;
  };

  const fetchMappings = useCallback(async () => {
    try {
      const response = await axios.get('/api/master/employee/manager-mapping');
      if (Array.isArray(response.data)) {
        setMappings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch manager mappings:', error);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.HRM.EMPLOYEES);
      if (Array.isArray(response.data)) {
        setRows(response.data);
      } else {
        console.error('API did not return an array:', response.data);
        setRows([]);
      }
      await fetchMappings();
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetchMappings]);

  useEffect(() => { 
    fetchEmployees(); 
  }, [fetchEmployees]);

  const handleRowClick = (row) => {
    setSelectedRow(prev => prev && prev.id === row.id ? null : row);
  };

  const handleOpenAdd = () => navigate('/hra/employee/master/create');
  const handleOpenEdit = (row) => navigate(`/hra/employee/master/create?id=${row.id}`);

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.firstName ? `${row.firstName} ${row.lastName || ''}`.trim() : `Employee #${row.empCode}`);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.HRM.EMPLOYEES}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Employee deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete employee.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleMapManagerOpen = async () => {
    if (!selectedRow) {
      dispatch(openSnackbar({ 
        open: true, 
        message: 'Select row first', 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'warning', 
        close: false 
      }));
      return;
    }

    try {
      // Fetch eligible managers
      const managersRes = await axios.get(`/api/master/employee/manager-mapping/eligible-managers?empId=${selectedRow.id}`);
      setEligibleManagers(managersRes.data || []);

      // Fetch current mapping for this employee
      const mappingRes = await axios.get(`/api/master/employee/manager-mapping/${selectedRow.id}`);
      const cur = mappingRes.data || {};
      setMappingState({
        homeManagerId: cur.homeManagerId || '',
        businessManagerId: cur.businessManagerId || '',
        verticalHeadId: cur.verticalHeadId || '',
        hrId: cur.hrId || ''
      });
      setMapDialogOpen(true);
    } catch (error) {
      console.error('Failed to prepare Map Manager:', error);
      dispatch(openSnackbar({ 
        open: true, 
        message: 'Failed to retrieve eligible managers.', 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'error', 
        close: false 
      }));
    }
  };

  const handleMapManagerSave = async () => {
    try {
      await axios.post('/api/master/employee/manager-mapping', {
        empId: selectedRow.id,
        homeManagerId: mappingState.homeManagerId || null,
        businessManagerId: mappingState.businessManagerId || null,
        verticalHeadId: mappingState.verticalHeadId || null,
        hrId: mappingState.hrId || null
      });

      dispatch(openSnackbar({ 
        open: true, 
        message: 'Manager mapping updated successfully!', 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'success', 
        close: false 
      }));
      setMapDialogOpen(false);
      fetchMappings();
    } catch (error) {
      console.error('Failed to save manager mapping:', error);
      dispatch(openSnackbar({ 
        open: true, 
        message: 'Failed to update manager mapping.', 
        variant: 'alert', 
        alert: { variant: 'filled' }, 
        severity: 'error', 
        close: false 
      }));
    }
  };

  // SOP #4 — Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => {}
  });

  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];

    // Helper: get the best display name from a raw employee row
    const getEmpDisplayName = (r) => {
      if (!r) return '-';
      const full = `${r.firstName || ''} ${r.lastName || ''}`.trim();
      return full || r.employeeName || '-';
    };

    // Helper: split employeeName into first/last for columns when firstName is null
    const getFirstName = (r) => r.firstName || (r.employeeName ? r.employeeName.split(' ')[0] : '-') || '-';
    const getLastName = (r) => r.lastName || (r.employeeName ? r.employeeName.split(' ').slice(1).join(' ') : '-') || '-';

    return rows.map((row) => {
      const map = mappings.find(m => String(m.empId) === String(row.id));
      const homeManager = map && map.homeManagerId ? rows.find(r => String(r.id) === String(map.homeManagerId)) : null;
      const businessManager = map && map.businessManagerId ? rows.find(r => String(r.id) === String(map.businessManagerId)) : null;

      return {
        ...row,
        photo: row.employeePhotoUpload,
        firstName: getFirstName(row),
        lastName: getLastName(row),
        employeeName: row.employeeName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
        departmentId: getDeptName(row.departmentId),
        designationId: getDesigName(row.designationId),
        empLevelId: getLevelName(row.empLevelId),
        unitId: getUnitName(row.unitId),
        supplierName: row.supplierName || row.vendorName || '-',
        homeManagerName: homeManager ? getEmpDisplayName(homeManager) : '-',
        businessManagerName: businessManager ? getEmpDisplayName(businessManager) : '-',
        status: row.status || 'Active'
      };
    });
  }, [rows, departments, designations, levels, mappings]);

  const handleExport = () => {
    const exportData = resolvedRows.map((r, i) => ({
      'Sno': i + 1,
      'First Name': r.firstName,
      'Last Name': r.lastName,
      'Designation': r.designationId,
      'Grade': r.gradeCode,
      'Department': r.departmentId,
      'Emp Code': r.empCode,
      'Unit Name': r.unitId,
      'Home Manager': r.homeManagerName,
      'Business Manager': r.businessManagerName,
      'Supplier Name': r.supplierName,
      'Created By': r.createdBy,
      'Created Date': r.createdAt,
      'Updated By': r.updatedBy,
      'Updated Date': r.updatedAt
    }));
    exportToExcel(exportData, 'Employee_Master');
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUsers size={24} />
          <Typography variant="h3">Employee Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchEmployees} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          {perms.export && (
            <BOSExportButton
              data={resolvedRows}
              filename="Employee_Master"
              columns={[
                { header: 'Emp Code', key: 'empCode' },
                { header: 'First Name', key: 'firstName' },
                { header: 'Last Name', key: 'lastName' },
                { header: 'Status', key: 'status' }
              ]}
            />
          )}
          {perms.write && (
            <Button 
              variant="contained" 
              color="secondary" 
              size="medium" 
              onClick={handleMapManagerOpen} 
              sx={{
                ...btnNew,
                backgroundColor: 'secondary.main',
                '&:hover': { backgroundColor: 'secondary.dark' }
              }}
            >
              Map Manager
            </Button>
          )}
          {perms.write && (
            <Tooltip title={shortcutTooltip('Create New Employee', 'Ctrl + N')}>
              <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
                + New
              </Button>
            </Tooltip>
          )}
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={resolvedRows}
        page={page}
        size={size}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={perms.write ? handleOpenEdit : null}
        onDeleteRow={perms.delete ? handleDeleteClick : null}
        onClickRow={handleRowClick}
        selectedRowId={selectedRow?.id}
        renderCell={null}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? All related data (personal, contact, job profile, education, etc.) will be permanently removed."
        itemName={deleteTargetName}
      />

      <Dialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
            background: 'background.paper',
            p: 1.5
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconUsers size={22} />
            <Typography variant="h3">
              Map Manager — {selectedRow ? (selectedRow.employeeName || `${selectedRow.firstName || ''} ${selectedRow.lastName || ''}`.trim()) : ''}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, pb: 1, overflow: 'visible' }}>
          <Stack spacing={2.5}>
            <BOSFormSection
              icon={<IconUserCheck size={20} />}
              title="Reporting Managers"
              defaultOpen={true}
              sx={{ overflow: 'visible' }}
              contentSx={{ p: 2, overflow: 'visible' }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, width: '100%', overflow: 'visible' }}>
                <Box sx={{ width: '100%' }}>
                  <Autocomplete
                    fullWidth
                    sx={{ width: '100%' }}
                    size="medium"
                    clearOnEscape
                    options={eligibleManagers}
                    getOptionLabel={(option) => getManagerLabel(option)}
                    isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                    value={eligibleManagers.find(m => String(m.id) === String(mappingState.homeManagerId)) || null}
                    onChange={(_, newValue) => setMappingState(prev => ({ ...prev, homeManagerId: newValue?.id || '' }))}
                    PopperProps={{ style: { zIndex: 1400 } }}
                    ListboxProps={{ style: { maxHeight: '300px' } }}
                    noOptionsText="No eligible managers found for this level"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Home Manager"
                        placeholder="Search by name, code, or designation..."
                        sx={{ '& .MuiOutlinedInput-root': { minHeight: 56, borderRadius: '12px' } }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2 }}>
                        <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                          {(option.firstName || '?')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {`${option.firstName || ''} ${option.lastName || ''}`.trim()} — {option.empCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getDesigName(option.designationId)} / {getLevelName(option.empLevelId)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Autocomplete
                    fullWidth
                    sx={{ width: '100%' }}
                    size="medium"
                    clearOnEscape
                    options={eligibleManagers}
                    getOptionLabel={(option) => getManagerLabel(option)}
                    isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                    value={eligibleManagers.find(m => String(m.id) === String(mappingState.businessManagerId)) || null}
                    onChange={(_, newValue) => setMappingState(prev => ({ ...prev, businessManagerId: newValue?.id || '' }))}
                    PopperProps={{ style: { zIndex: 1400 } }}
                    ListboxProps={{ style: { maxHeight: '300px' } }}
                    noOptionsText="No eligible managers found for this level"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Business Manager"
                        placeholder="Search by name, code, or designation..."
                        sx={{ '& .MuiOutlinedInput-root': { minHeight: 56, borderRadius: '12px' } }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2 }}>
                        <Avatar sx={{ width: 38, height: 38, bgcolor: 'secondary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                          {(option.firstName || '?')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {`${option.firstName || ''} ${option.lastName || ''}`.trim()} — {option.empCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getDesigName(option.designationId)} / {getLevelName(option.empLevelId)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Box>
              </Box>
            </BOSFormSection>

            <BOSFormSection
              icon={<IconShieldCheck size={20} />}
              title="Approving Authorities"
              defaultOpen={true}
              sx={{ overflow: 'visible' }}
              contentSx={{ p: 2, overflow: 'visible' }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, width: '100%', overflow: 'visible' }}>
                <Box sx={{ width: '100%' }}>
                  <Autocomplete
                    fullWidth
                    sx={{ width: '100%' }}
                    size="medium"
                    clearOnEscape
                    options={eligibleManagers}
                    getOptionLabel={(option) => getManagerLabel(option)}
                    isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                    value={eligibleManagers.find(m => String(m.id) === String(mappingState.verticalHeadId)) || null}
                    onChange={(_, newValue) => setMappingState(prev => ({ ...prev, verticalHeadId: newValue?.id || '' }))}
                    PopperProps={{ style: { zIndex: 1400 } }}
                    ListboxProps={{ style: { maxHeight: '300px' } }}
                    noOptionsText="No eligible managers found for this level"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Vertical Head"
                        placeholder="Search by name, code, or designation..."
                        sx={{ '& .MuiOutlinedInput-root': { minHeight: 56, borderRadius: '12px' } }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2 }}>
                        <Avatar sx={{ width: 38, height: 38, bgcolor: 'info.main', fontSize: '0.9rem', fontWeight: 700 }}>
                          {(option.firstName || '?')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {`${option.firstName || ''} ${option.lastName || ''}`.trim()} — {option.empCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getDesigName(option.designationId)} / {getLevelName(option.empLevelId)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Autocomplete
                    fullWidth
                    sx={{ width: '100%' }}
                    size="medium"
                    clearOnEscape
                    options={eligibleManagers}
                    getOptionLabel={(option) => getManagerLabel(option)}
                    isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                    value={eligibleManagers.find(m => String(m.id) === String(mappingState.hrId)) || null}
                    onChange={(_, newValue) => setMappingState(prev => ({ ...prev, hrId: newValue?.id || '' }))}
                    PopperProps={{ style: { zIndex: 1400 } }}
                    ListboxProps={{ style: { maxHeight: '300px' } }}
                    noOptionsText="No eligible managers found for this level"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="HR"
                        placeholder="Search by name, code, or designation..."
                        sx={{ '& .MuiOutlinedInput-root': { minHeight: 56, borderRadius: '12px' } }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2 }}>
                        <Avatar sx={{ width: 38, height: 38, bgcolor: 'warning.main', fontSize: '0.9rem', fontWeight: 700 }}>
                          {(option.firstName || '?')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {`${option.firstName || ''} ${option.lastName || ''}`.trim()} — {option.empCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getDesigName(option.designationId)} / {getLevelName(option.empLevelId)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Box>
              </Box>
            </BOSFormSection>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1.5 }}>
          <Button onClick={() => setMapDialogOpen(false)} variant="contained" sx={btnCancel}>
            Cancel
          </Button>
          <Button onClick={handleMapManagerSave} variant="contained" sx={btnSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
