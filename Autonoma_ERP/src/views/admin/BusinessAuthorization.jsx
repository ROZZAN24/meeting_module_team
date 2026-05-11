import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Checkbox,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Fade,
  TablePagination
} from '@mui/material';
import { 
  IconDeviceFloppy, 
  IconShieldLock, 
  IconCheck,
  IconX,
  IconLayout2
} from '@tabler/icons-react';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig, resetFilters } from 'store/slices/search';

// Search Configuration for this page
const businessAuthSearchConfig = [
  { id: 'module', label: 'Module', type: 'text', placeholder: 'Search Module...' },
  { id: 'subModule', label: 'Submodule', type: 'text', placeholder: 'Search Submodule...' },
  { id: 'pageName', label: 'Page Name', type: 'text', placeholder: 'Search Page Name...' }
];

const BusinessAuthorization = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [pageData, setPageData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Get global search query and filters from Redux
  const searchQuery = useSelector((state) => state.search.query);
  const searchFilters = useSelector((state) => state.search.filters);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchPageData();
    // Set page-specific search filters
    dispatch(setFilterConfig(businessAuthSearchConfig));
    dispatch(resetFilters());

    return () => {
      // Clear filters on unmount
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
    };
  }, [dispatch]);

  // Reset page when search query or filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, searchFilters]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/bos-pages');
      setPageData(res.data);
    } catch (error) {
      console.error('Failed to fetch page data', error);
      dispatch(openSnackbar({
        open: true,
        message: 'Failed to fetch page data',
        variant: 'alert',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (idx) => {
    const newData = [...pageData];
    newData[idx].enabled = newData[idx].enabled === 1 ? 0 : 1;
    setPageData(newData);
  };

  const handleEnableAll = (checked) => {
    const newData = pageData.map(item => ({
      ...item,
      enabled: checked ? 1 : 0
    }));
    setPageData(newData);
  };

  const isAllEnabled = pageData.length > 0 && pageData.every(item => item.enabled === 1);
  const isSomeEnabled = pageData.some(item => item.enabled === 1) && !isAllEnabled;

  const handleSaveAll = async () => {
    try {
      await axios.post('/api/bos-pages/save-all', pageData);
      dispatch(openSnackbar({
        open: true,
        message: 'Business authorizations saved successfully',
        variant: 'alert',
        severity: 'success'
      }));
    } catch (error) {
      console.error('Save failed', error);
      dispatch(openSnackbar({
        open: true,
        message: 'Failed to save authorizations',
        variant: 'alert',
        severity: 'error'
      }));
    }
  };

  const handleSaveRow = async (row) => {
    try {
      await axios.post('/api/bos-pages/save-all', [row]);
      dispatch(openSnackbar({
        open: true,
        message: `Saved status for ${row.pageName}`,
        variant: 'alert',
        severity: 'success'
      }));
    } catch (error) {
      console.error('Row save failed', error);
    }
  };

  const filteredData = useMemo(() => {
    return pageData.filter(item => {
      const query = searchQuery.toLowerCase();
      
      // Global keyword search
      const matchesKeyword = (
        item.pageName?.toLowerCase().includes(query) ||
        item.pageId?.toString().includes(query) ||
        item.module?.modName?.toLowerCase().includes(query) ||
        item.module?.moduleId?.toString().includes(query) ||
        item.subModule?.subModName?.toLowerCase().includes(query) ||
        item.subModule?.subModId?.toString().includes(query) ||
        item.pageCode?.toLowerCase().includes(query)
      );

      // Advanced field filters
      const moduleFilter = searchFilters.module?.toLowerCase() || '';
      const subModuleFilter = searchFilters.subModule?.toLowerCase() || '';
      const pageNameFilter = searchFilters.pageName?.toLowerCase() || '';

      const matchesModule = !moduleFilter || item.module?.modName?.toLowerCase().includes(moduleFilter);
      const matchesSubModule = !subModuleFilter || item.subModule?.subModName?.toLowerCase().includes(subModuleFilter);
      const matchesPageName = !pageNameFilter || item.pageName?.toLowerCase().includes(pageNameFilter);

      return matchesKeyword && matchesModule && matchesSubModule && matchesPageName;
    });
  }, [pageData, searchQuery, searchFilters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Card */}
      <MainCard sx={{ 
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.paper} 100%)`,
        border: 'none',
        boxShadow: theme.shadows[2]
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
                <IconShieldLock size={32} color="white" />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight={700}>Business Authorization</Typography>
                <Typography variant="subtitle2" color="textSecondary">Manage system-wide page availability</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <AnimateButton>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                startIcon={<IconDeviceFloppy size={22} />}
                onClick={handleSaveAll}
                disabled={pageData.length === 0}
                sx={{ height: 50, borderRadius: '12px', fontSize: '1rem', fontWeight: 600, px: 4 }}
              >
                Save All Changes
              </Button>
            </AnimateButton>
          </Grid>
        </Grid>
      </MainCard>

      {/* Main Table Card */}
      <MainCard 
        content={false}
        title={
          <Stack direction="row" spacing={2} alignItems="center">
            <IconLayout2 size={22} color={theme.palette.primary.main} />
            <Typography variant="h4">Page Enablement Matrix</Typography>
          </Stack>
        }
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 310px)', borderRadius: '0 0 12px 12px' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Module Id</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Module Name</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Submodule</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Page ID</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Page Name</TableCell>
                <TableCell align="center" sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.info.main,
                  bgcolor: theme.palette.info.light + '10',
                  borderBottom: '2px solid',
                  borderColor: theme.palette.info.main
                }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <Checkbox
                      size="small"
                      indeterminate={isSomeEnabled}
                      checked={isAllEnabled}
                      onChange={(e) => handleEnableAll(e.target.checked)}
                      sx={{ color: theme.palette.info.main }}
                    />
                    Enable
                  </Stack>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: theme.palette.grey[50] }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}><Typography variant="h4">Loading Pages...</Typography></TableCell></TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}><Typography variant="h4">No Pages Found</Typography></TableCell></TableRow>
              ) : (
                paginatedData.map((row, idx) => {
                  const globalIdx = pageData.findIndex(item => item.pageId === row.pageId);
                  const displayIdx = page * rowsPerPage + idx + 1;
                  return (
                    <TableRow key={row.pageId} hover sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: theme.palette.action.hover },
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: theme.palette.primary.light + '20' }
                    }}>
                      <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>{displayIdx}</TableCell>
                      <TableCell>{row.module?.moduleId}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.module?.modName}</TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>{row.subModule?.subModName || '-'}</TableCell>
                      <TableCell>{row.pageId}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight={700} color="primary.main">{row.pageName}</Typography>
                        {row.pageCode && <Typography variant="caption" color="textSecondary">{row.pageCode}</Typography>}
                      </TableCell>
                      
                      <TableCell align="center">
                        <Checkbox
                          checked={row.enabled === 1}
                          onChange={() => handleCheckboxChange(globalIdx)}
                          icon={<IconX size={18} color={theme.palette.grey[300]} />}
                          checkedIcon={<IconCheck size={18} color={theme.palette.success.main} />}
                          sx={{ 
                            transition: 'transform 0.1s',
                            '&:hover': { transform: 'scale(1.2)' }
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="Save Status">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleSaveRow(row)}
                            sx={{ 
                              bgcolor: theme.palette.primary.light + '30',
                              '&:hover': { bgcolor: theme.palette.primary.main, color: 'white' }
                            }}
                          >
                            <IconDeviceFloppy size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            borderTop: '1px solid', 
            borderColor: 'divider',
            '& .MuiTablePagination-toolbar': { p: 0, minHeight: 48 },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { m: 0 }
          }}
        />
      </MainCard>
    </Box>
  );
};

const AnimateButton = ({ children }) => (
  <Box sx={{ transition: 'transform 0.1s', '&:hover': { transform: 'scale(1.02)' }, '&:active': { transform: 'scale(0.98)' } }}>
    {children}
  </Box>
);

export default BusinessAuthorization;
