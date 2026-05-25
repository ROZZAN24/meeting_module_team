import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// material-ui
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
  Switch,
  TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useAuth from 'hooks/useAuth';
import { setFilterConfig, resetFilters } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import { 
  BOSTextField, 
  tableContainerSx, 
  tableHeadCellSx, 
  getTableRowSx, 
  tableActionEditSx, 
  tableActionDeleteSx, 
  getStatusChipSx 
} from 'ui-component/bos';

// assets
import {
  IconSettings,
  IconPlus,
  IconPencil,
  IconX,
  IconDeviceFloppy,
  IconCalendarEvent,
  IconUser,
  IconTrash,
  IconCheck
} from '@tabler/icons-react';

// ==============================|| PREFIX CREDENTIALS - INLINE EDITABLE ||============================== //

const searchConfig = [
  { id: 'accountYear', label: 'Account Year', type: 'text', placeholder: 'Search Year...' },
  { id: 'salesOrderPrefix', label: 'SO Prefix', type: 'text', placeholder: 'Search SO Prefix...' },
  { id: 'invoicePrefix', label: 'Invoice Prefix', type: 'text', placeholder: 'Search Invoice Prefix...' }
];

const PrefixCredentials = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Inline editing states
  const [editIdx, setEditIdx] = useState(-1); // -1 means no row is being edited
  const [editData, setEditData] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const { user } = useAuth();
  const perms = usePagePermissions(PAGE_CODES.AD_PREFIX_CREDENTIALS);
  const searchQuery = useSelector((state) => state.search.query);

  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err;
    return err?.message || err?.error || err?.detail || JSON.stringify(err) || 'An unexpected error occurred';
  };

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/prefix-credentials/all');
      setCredentials(response.data);
    } catch (err) {
      console.error('Failed to fetch prefix credentials:', err);
      dispatch(openSnackbar({ open: true, message: getErrorMessage(err) || 'Failed to fetch prefix credentials', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
    dispatch(setFilterConfig(searchConfig));
    dispatch(resetFilters());
    return () => {
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
    };
  }, [dispatch]);

  const filteredCredentials = useMemo(() => {
    const query = searchQuery?.toLowerCase() || '';
    let filtered = credentials;
    if (query) {
      filtered = credentials.filter((cred) =>
        cred.accountYear?.toLowerCase().includes(query) ||
        cred.salesOrderPrefix?.toLowerCase().includes(query) ||
        cred.matPoPrefix?.toLowerCase().includes(query) ||
        cred.gateEntryPrefix?.toLowerCase().includes(query) ||
        cred.invoicePrefix?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [credentials, searchQuery]);

  const paginatedCredentials = useMemo(() => {
    return filteredCredentials.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCredentials, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handler for adding a new row
  const handleAddRow = () => {
    if (isAdding || editIdx !== -1) {
      dispatch(openSnackbar({ open: true, message: 'Please save or cancel current edit first', variant: 'alert', severity: 'warning' }));
      return;
    }
    setIsAdding(true);
    setEditData({
      accountYear: '',
      status: 1,
      salesOrderPrefix: '',
      salesOrderSuffix: '',
      salesOrderDigit: '',
      matPoPrefix: '',
      matPoSuffix: '',
      matPoDigit: '',
      gateEntryPrefix: '',
      gateEntrySuffix: '',
      gateEntryDigit: '',
      grnPrefix: '',
      grnSuffix: '',
      grnDigit: '',
      invoicePrefix: '',
      invoiceSuffix: '',
      invoiceDigit: ''
    });
  };

  // Handler for editing an existing row
  const handleEditRow = (idx, row) => {
    if (isAdding || editIdx !== -1) {
      dispatch(openSnackbar({ open: true, message: 'Please save or cancel current edit first', variant: 'alert', severity: 'warning' }));
      return;
    }
    setEditIdx(idx);
    setEditData({ ...row });
  };

  const handleCancelEdit = () => {
    setEditIdx(-1);
    setEditData({});
    setIsAdding(false);
  };

  const handleInputChange = (field, value) => {
    let finalValue = value;
    
    // Auto-mask for Account Year: YYYY-YYYY
    if (field === 'accountYear') {
      // Remove all non-numeric characters except hyphen
      const cleanValue = value.replace(/[^\d-]/g, '');
      
      // Auto-insert hyphen at position 4
      if (cleanValue.length === 4 && !cleanValue.includes('-')) {
        finalValue = cleanValue + '-';
      } else if (cleanValue.length > 9) {
        finalValue = cleanValue.substring(0, 9);
      } else {
        finalValue = cleanValue;
      }
    }
    
    setEditData((prev) => ({ ...prev, [field]: finalValue }));
  };

  const validateData = (data) => {
    if (!data.accountYear?.trim()) return 'Account Year is required';
    
    // Regex for YYYY-YYYY format
    const yearRegex = /^\d{4}-\d{4}$/;
    if (!yearRegex.test(data.accountYear)) {
      return 'Account Year must be in format YYYY-YYYY (e.g. 2026-2027)';
    }

    // Check uniqueness on add
    if (isAdding && credentials.some(c => c.accountYear.toLowerCase() === data.accountYear.toLowerCase())) {
      return 'Account Year already exists';
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateData(editData);
    if (error) {
      dispatch(openSnackbar({ open: true, message: error, variant: 'alert', severity: 'error' }));
      return;
    }

    try {
      const payload = {
        ...editData,
        status: editData.status ? 1 : 0,
        salesOrderDigit: editData.salesOrderDigit ? parseInt(editData.salesOrderDigit) : null,
        matPoDigit: editData.matPoDigit ? parseInt(editData.matPoDigit) : null,
        gateEntryDigit: editData.gateEntryDigit ? parseInt(editData.gateEntryDigit) : null,
        grnDigit: editData.grnDigit ? parseInt(editData.grnDigit) : null,
        invoiceDigit: editData.invoiceDigit ? parseInt(editData.invoiceDigit) : null
      };

      if (isAdding) {
        payload.createdBy = user?.id || 'System';
        await axios.post('/api/prefix-credentials/create', payload);
      } else {
        payload.updatedBy = user?.id || 'System';
        await axios.put(`/api/prefix-credentials/update/${editData.accountYear}`, payload);
      }

      dispatch(openSnackbar({ open: true, message: `Prefix Credential ${isAdding ? 'created' : 'updated'} successfully`, variant: 'alert', severity: 'success' }));
      handleCancelEdit();
      fetchCredentials();
    } catch (err) {
      console.error('Save failed:', err);
      dispatch(openSnackbar({ open: true, message: getErrorMessage(err) || 'Save failed', variant: 'alert', severity: 'error' }));
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.accountYear);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`/api/prefix-credentials/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Prefix Credential deleted successfully', variant: 'alert', severity: 'success' }));
      fetchCredentials();
    } catch (err) {
      console.error('Delete failed:', err);
      dispatch(openSnackbar({ open: true, message: getErrorMessage(err) || 'Delete failed', variant: 'alert', severity: 'error' }));
    }
  };

  const renderCellContent = (row, field, idx, type = 'text') => {
    const isEditing = idx === editIdx || (isAdding && idx === -1);

    if (isEditing) {
      if (field === 'status') {
        return (
          <Switch
            size="small"
            checked={editData.status === 1}
            onChange={(e) => handleInputChange('status', e.target.checked ? 1 : 0)}
            color="primary"
          />
        );
      }

      // Determine placeholder based on field
      let placeholder = '...';
      if (field === 'accountYear') placeholder = '####-####';
      else if (field.endsWith('Prefix')) placeholder = 'PR-';
      else if (field.endsWith('Suffix')) placeholder = '-SF';
      else if (field.endsWith('Digit')) placeholder = '6';

      return (
        <BOSTextField
          fullWidth
          size="small"
          variant="standard"
          type={type}
          value={editData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          disabled={!isAdding && field === 'accountYear'}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            maxLength: field === 'accountYear' ? 9 : (type === 'number' ? 10 : 20),
            style: { fontSize: '0.7rem', fontWeight: 700, padding: '4px 0' }
          }}
          sx={{ '& .MuiInput-underline:before': { borderBottomColor: alpha(theme.palette.primary.main, 0.2) } }}
        />
      );
    }

    if (field === 'status') {
      return (
        <Typography variant="caption" sx={{
          fontWeight: 800,
          color: row.status === 1 ? '#4caf50' : '#f44336',
          bgcolor: alpha(row.status === 1 ? '#4caf50' : '#f44336', 0.08),
          px: 1, py: 0.3, borderRadius: '4px', fontSize: '0.65rem'
        }}>
          {row.status === 1 ? 'Active' : 'Inactive'}
        </Typography>
      );
    }

    if (field === 'accountYear') {
        return <Typography variant="body2" sx={{ fontWeight: 800, color: '#2196f3', fontSize: '0.7rem' }}>{row[field]}</Typography>;
      }

      return <Typography variant="body2" sx={{ fontWeight: 800, color: '#1a223f', fontSize: '0.7rem' }}>{row[field] ?? '-'}</Typography>;
    };

    const categories = [
      { label: 'Sales Order', prefix: 'salesOrderPrefix', suffix: 'salesOrderSuffix', digit: 'salesOrderDigit' },
      { label: 'Material PO', prefix: 'matPoPrefix', suffix: 'matPoSuffix', digit: 'matPoDigit' },
      { label: 'Gate Entry', prefix: 'gateEntryPrefix', suffix: 'gateEntrySuffix', digit: 'gateEntryDigit' },
      { label: 'GRN', prefix: 'grnPrefix', suffix: 'grnSuffix', digit: 'grnDigit' },
      { label: 'Invoice', prefix: 'invoicePrefix', suffix: 'invoiceSuffix', digit: 'invoiceDigit' }
    ];

    // Sticky Column Styles
    const stickyColLeft1 = {
      position: 'sticky',
      left: 0,
      zIndex: 105,
      borderRight: '1px solid #eef2f6 !important',
      boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)'
    };

    const stickyColLeft2 = {
      position: 'sticky',
      left: 150,
      zIndex: 105,
      borderRight: '2px solid #eef2f6 !important',
      boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)'
    };

    const stickyColRight1 = {
      position: 'sticky',
      right: 100,
      zIndex: 105,
      borderLeft: '2px solid #eef2f6 !important',
      boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.05)'
    };

    const stickyColRight2 = {
      position: 'sticky',
      right: 0,
      zIndex: 105,
      borderLeft: '1px solid #eef2f6 !important',
      boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.05)'
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 145px)', gap: 1, overflow: 'hidden' }}>
        {/* ── HEADER SECTION ── */}
        <Box sx={{
          bgcolor: 'white',
          p: '10px 24px',
          borderRadius: '12px',
          border: '1px solid #eef2f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <IconSettings size={28} />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a223f', lineHeight: 1.2 }}>Prefix / Suffix Credentials</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#9e9e9e', textTransform: 'uppercase', fontSize: '0.65rem' }}>SYSTEM CONFIGURATION MANAGER</Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={handleAddRow}
            disabled={isAdding || editIdx !== -1 || !perms.write}
            sx={{
              height: 40,
              borderRadius: '8px',
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.dark },
              px: 3,
              fontWeight: 700,
              boxShadow: 'none'
            }}
          >
            Add Prefix
          </Button>
        </Box>

        {/* ── TABLE SECTION ── */}
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #eef2f6',
          bgcolor: 'white',
          minHeight: 0
        }}>
          <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table stickyHeader size="small" sx={{ minWidth: 2400, tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow sx={{ '& th': { borderRight: '1px solid #eef2f6', borderBottom: '1px solid #eef2f6' } }}>
                  <TableCell rowSpan={2} sx={{ ...stickyColLeft1, width: 150, fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.7rem', textAlign: 'center' }}>Account_year</TableCell>
                  <TableCell rowSpan={2} sx={{ ...stickyColLeft2, width: 100, fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.7rem', textAlign: 'center' }}>status</TableCell>
                  {categories.map((cat) => (
                    <TableCell key={cat.label} colSpan={3} sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.03), color: '#1a223f', fontSize: '0.7rem', textAlign: 'center' }}>
                      {cat.label}
                    </TableCell>
                  ))}
                  <TableCell rowSpan={2} sx={{ ...stickyColRight1, fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.7rem', textAlign: 'center', width: 100 }}>Audit Info</TableCell>
                  <TableCell rowSpan={2} sx={{ ...stickyColRight2, fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.7rem', textAlign: 'center', width: 100 }}>Action</TableCell>
                </TableRow>
                <TableRow sx={{ '& th': { borderRight: '1px solid #eef2f6', borderBottom: '1px solid #eef2f6' } }}>
                  {categories.map((cat) => (
                    <>
                      <TableCell key={`${cat.label}-prefix`} sx={{ width: 120, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.03), color: '#64748b', fontSize: '0.65rem', textAlign: 'center' }}>Prefix</TableCell>
                      <TableCell key={`${cat.label}-suffix`} sx={{ width: 120, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.03), color: '#64748b', fontSize: '0.65rem', textAlign: 'center' }}>Sufix</TableCell>
                      <TableCell key={`${cat.label}-digit`} sx={{ width: 60, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.03), color: '#64748b', fontSize: '0.65rem', textAlign: 'center' }}>Digit</TableCell>
                    </>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Render New Row at the top if isAdding */}
                {isAdding && (
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), '& td': { borderRight: '1px solid #f1f5f9' } }}>
                    <TableCell align="center" sx={{ ...stickyColLeft1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>{renderCellContent({}, 'accountYear', -1)}</TableCell>
                    <TableCell align="center" sx={{ ...stickyColLeft2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>{renderCellContent({}, 'status', -1)}</TableCell>
                    {categories.map((cat) => (
                      <>
                        <TableCell key={`add-${cat.prefix}`} align="center" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.01) }}>{renderCellContent({}, cat.prefix, -1)}</TableCell>
                        <TableCell key={`add-${cat.suffix}`} align="center" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.01) }}>{renderCellContent({}, cat.suffix, -1)}</TableCell>
                        <TableCell key={`add-${cat.digit}`} align="center" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.01) }}>{renderCellContent({}, cat.digit, -1, 'number')}</TableCell>
                      </>
                    ))}
                    <TableCell align="center" sx={{ ...stickyColRight1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>New Entry</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ ...stickyColRight2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton size="small" onClick={handleSave} sx={{ color: '#4caf50', bgcolor: alpha('#4caf50', 0.1), '&:hover': { bgcolor: '#4caf50', color: 'white' } }}>
                          <IconCheck size={18} />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancelEdit} sx={{ color: '#f44336', bgcolor: alpha('#f44336', 0.1), '&:hover': { bgcolor: '#f44336', color: 'white' } }}>
                          <IconX size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}

                {loading ? (
                  <TableRow>
                    <TableCell colSpan={19} align="center" sx={{ py: 10 }}>
                      <CircularProgress size={32} thickness={5} />
                      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>Loading Credentials...</Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedCredentials.length > 0 ? (
                  paginatedCredentials.map((row, idx) => {
                    const rowBg = idx % 2 === 0 ? 'white' : '#f9fbff';
                    const scrollBg = alpha(theme.palette.primary.main, 0.01);
                    return (
                      <TableRow
                        key={row.accountYear}
                        sx={{
                          '& td': { py: 1, borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' },
                          '&:hover': { bgcolor: '#f1f5f9 !important', '& td': { bgcolor: '#f1f5f9 !important' } },
                          bgcolor: rowBg
                        }}
                      >
                        <TableCell align="center" sx={{ ...stickyColLeft1, bgcolor: rowBg }}>{renderCellContent(row, 'accountYear', idx)}</TableCell>
                        <TableCell align="center" sx={{ ...stickyColLeft2, bgcolor: rowBg }}>{renderCellContent(row, 'status', idx)}</TableCell>
                        {categories.map((cat) => (
                          <>
                            <TableCell key={`${row.accountYear}-${cat.prefix}`} align="center" sx={{ bgcolor: scrollBg }}>{renderCellContent(row, cat.prefix, idx)}</TableCell>
                            <TableCell key={`${row.accountYear}-${cat.suffix}`} align="center" sx={{ bgcolor: scrollBg }}>{renderCellContent(row, cat.suffix, idx)}</TableCell>
                            <TableCell key={`${row.accountYear}-${cat.digit}`} align="center" sx={{ bgcolor: scrollBg }}>{renderCellContent(row, cat.digit, idx)}</TableCell>
                          </>
                        ))}
                        <TableCell align="center" sx={{ ...stickyColRight1, bgcolor: rowBg }}>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <Tooltip title={`Created: ${row.createdDate ? new Date(row.createdDate).toLocaleString() : 'N/A'}\nUpdated: ${row.updatedDate ? new Date(row.updatedDate).toLocaleString() : 'N/A'}`}>
                              <Box>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1a223f', display: 'block', lineHeight: 1.1, fontSize: '0.65rem' }}>
                                  {row.updatedDate || row.createdDate ? new Date(row.updatedDate || row.createdDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.55rem', fontWeight: 700 }}>
                                  {row.updatedBy || row.createdBy || 'System'}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                        <TableCell align="center" sx={{ ...stickyColRight2, bgcolor: rowBg }}>
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {editIdx === idx ? (
                              <>
                                <Tooltip title="Save" arrow>
                                  <IconButton size="small" onClick={handleSave} sx={{ color: '#4caf50', bgcolor: alpha('#4caf50', 0.1), '&:hover': { bgcolor: '#4caf50', color: 'white' } }}>
                                    <IconDeviceFloppy size={16} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel" arrow>
                                  <IconButton size="small" onClick={handleCancelEdit} sx={{ color: '#f44336', bgcolor: alpha('#f44336', 0.1), '&:hover': { bgcolor: '#f44336', color: 'white' } }}>
                                    <IconX size={16} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                <Tooltip title="Edit" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditRow(idx, row)}
                                    disabled={isAdding || editIdx !== -1 || !perms.write}
                                    sx={{
                                      bgcolor: alpha('#2196f3', 0.1),
                                      color: '#2196f3',
                                      borderRadius: '6px',
                                      p: 0.5,
                                      '&:hover': { bgcolor: '#2196f3', color: 'white' }
                                    }}
                                  >
                                    <IconPencil size={16} />
                                  </IconButton>
                                </Tooltip>
                                {perms.delete && user?.isBosAdmin === 1 && (
                                  <Tooltip title="Delete" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteClick(row)}
                                      disabled={isAdding || editIdx !== -1}
                                      sx={{
                                        bgcolor: alpha('#f44336', 0.1),
                                        color: '#f44336',
                                        borderRadius: '6px',
                                        p: 0.5,
                                        '&:hover': { bgcolor: '#f44336', color: 'white' }
                                      }}
                                    >
                                      <IconTrash size={16} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={19} align="center" sx={{ py: 10 }}>
                      <Typography variant="h5" color="textSecondary">No prefix credentials found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredCredentials.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              bgcolor: '#f8fafc',
              borderTop: '1px solid #eef2f6',
              '& .MuiTablePagination-toolbar': { p: 0, minHeight: 40 },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem', fontWeight: 700, color: '#64748b' },
              '& .MuiTablePagination-select': { fontSize: '0.75rem', fontWeight: 700 }
            }}
          />
        </Box>

        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Prefix Credential"
          message="Are you sure you want to delete this prefix credential? This action cannot be undone."
          itemName={`Account Year: ${deleteTargetId}`}
        />
      </Box>
    );
  };

  export default PrefixCredentials;
