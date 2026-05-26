import PropTypes from 'prop-types';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Tooltip, TablePagination, Stack,
  Chip, Typography, useTheme, alpha
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useEffect, useState } from 'react';
import { setTableConfig } from 'store/slices/search';
import {
  tableContainerSx, tableHeadCellSx, getTableRowSx,
  tableActionEditSx, tableActionDeleteSx, getStatusChipSx
} from './BOSStyles';
import { getPhotoUrl } from './BOSUtils';
import { IconUser } from '@tabler/icons-react';
import { Avatar } from '@mui/material';

/**
 * BOS DataTable — SOP #2, #7, #8, #12, #15, #16
 * Universal scrollable datatable for all BOS master pages.
 */
export default function BOSDataTable({
  columns,
  data,
  rows: rowsProp,
  loading,
  onEditRow,
  onDeleteRow,
  onDoubleClickRow,
  showActions: showActionsProp = true,
  actionColumn,
  selectable = false,
  onSelectionChange,
  totalCount,
  page = 0,
  size = 10,
  onPageChange,
  onSizeChange,
  footerActions,
  onClickRow,
  selectedRowId,
  renderCell,
  sx = {},
  id,
  disableSearchFilter = false
}) {
  const rows = data || rowsProp || [];
  console.log('[BOSDataTable] Rendering with rows:', rows.length);
  const dispatch = useDispatch();
  const [localSelectedId, setLocalSelectedId] = useState(null);

  useEffect(() => {
    if (columns && rows) {
      // Rule 1 extension: Extract unique values from rows for each column to provide dropdown options
      const columnsWithData = columns.map(col => {
        if (col.id === 'index' || col.id === 'photo' || col.id === 'actions') return col;
        
        const uniqueValues = [...new Set(rows.map(r => r[col.id]))]
          .filter(v => v !== undefined && v !== null && v !== '')
          .map(v => ({ value: v, label: String(v) }));

        return { ...col, options: uniqueValues };
      });
      dispatch(setTableConfig(columnsWithData));
    }
    return () => {
      dispatch(setTableConfig(null));
    };
  }, [columns, rows, dispatch]);
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const baseRowSx = getTableRowSx(isDark);

  const showActions = useMemo(() => {
    if (showActionsProp === false) return false;
    return Boolean(onEditRow || onDeleteRow || actionColumn);
  }, [showActionsProp, onEditRow, onDeleteRow, actionColumn]);

  const searchQuery = useSelector((state) => state.search?.query || '');
  const globalFilters = useSelector((state) => state.search?.filters || {});

  const formatDate = (d) => {
    if (!d) return '-';
    try { 
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return String(d);
      return format(dateObj, 'dd/MM/yyyy HH:mm'); 
    } catch { 
      return '-'; 
    }
  };

  const getCellDisplayValue = (col, row, idx) => {
    let val = row[col.id];
    
    if (val === undefined || val === null) {
      // 1. Standard camelCase to snake_case (e.g. updatedBy -> updated_by)
      const snakeCaseId = col.id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      val = row[snakeCaseId];
      
      // 2. Audit-Specific Fallbacks (The "Big 4")
      if (val === undefined || val === null || val === '') {
        if (col.id === 'createdDate') val = row['createdAt'] || row['created_at'];
        if (col.id === 'updatedDate') val = row['updatedAt'] || row['updated_at'];
        if (col.id === 'createdBy') val = row['created_by'];
        if (col.id === 'updatedBy') val = row['updated_by'];
      }
    }

    if (col.id === 'index') return String((page * size) + (idx + 1));

    if (col.id === 'status' || col.id === 'accountStatus') {
      let statusText = 'Inactive';
      if (val === 1 || val === 'Active' || val === 'ACTIVE') statusText = 'Active';
      else if (val === 'Suspended' || val === 'SUSPENDED') statusText = 'Suspended';
      else if (val === 0 || val === 'Inactive' || val === 'INACTIVE' || val === 'InActive' || val === 'In Active') statusText = 'Inactive';
      else if (val !== null && val !== undefined && val !== '') statusText = String(val);
      return statusText;
    }

    // Date Formatting (SOP Compliance - Removes +00:00 via formatDate)
    const isDateField = col.id.toLowerCase().includes('date') || 
                       col.id.endsWith('At') || 
                       col.id.endsWith('_at') || 
                       col.id === 'entryDate' ||
                       col.id === 'invoiceDate';
    
    // Explicitly exclude false positives like 'state' or 'category'
    const isFalsePositive = col.id.toLowerCase().includes('state') || col.id.toLowerCase().includes('category');

    if (isDateField && !isFalsePositive) {
      return formatDate(val);
    }
    
    // Handle Boolean values (Yes/No)
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    
    if (typeof val === 'object' && val !== null) {
      return val.name || val.label || val.id || '-';
    }
    return (val !== null && val !== undefined && val !== '') ? String(val) : '-';
  };

  const filteredRows = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    if (disableSearchFilter) return rows;

    return rows.filter((row, idx) => {
      // 1. Dynamic Filters from Search Popover (Only apply filters relevant to this table's columns)
      if (globalFilters) {
        for (const [key, fVal] of Object.entries(globalFilters)) {
          if (fVal === undefined || fVal === null || fVal === '' || fVal === 'All') continue;
          
          // Check if this filter key exists in our columns
          const col = columns.find(c => c.id === key);
          if (!col && key !== 'status') continue; 

          const filterVal = String(fVal).toLowerCase().trim();
          const displayVal = col ? getCellDisplayValue(col, row, idx).toLowerCase().trim() : String(row[key] || '').toLowerCase().trim();
          
          if (filterVal && !displayVal.includes(filterVal)) {
            return false;
          }
        }
      }

      // 2. Global Query (Main text box)
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        return columns.some((col) => {
          if (col.id === 'index' || col.id === 'photo' || col.id === 'actions') return false;
          const displayVal = getCellDisplayValue(col, row, idx).toLowerCase();
          return displayVal.includes(queryLower);
        });
      }

      return true;
    });
  }, [rows, searchQuery, globalFilters, columns, disableSearchFilter, page, size]);

  const paginatedRows = useMemo(() => {
    // If the rows are already sliced/paginated by the caller (i.e. rows.length <= size and totalCount is larger),
    // we should render them directly without slicing.
    if (totalCount !== undefined && totalCount > filteredRows.length && filteredRows.length <= size) {
      return filteredRows;
    }
    // Otherwise, do local pagination
    return filteredRows.slice(page * size, page * size + size);
  }, [filteredRows, page, size, totalCount]);

  const defaultRenderCell = (col, row, idx) => {
    if (col.render) return col.render(row, idx);
    
    // ── DATA RESOLUTION (Supports camelCase, snake_case, and common audit fallbacks) ──
    let val = row[col.id];
    
    if (val === undefined || val === null) {
      // 1. Standard camelCase to snake_case (e.g. updatedBy -> updated_by)
      const snakeCaseId = col.id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      val = row[snakeCaseId];
      
      // 2. Audit-Specific Fallbacks (The "Big 4")
      if (val === undefined || val === null || val === '') {
        if (col.id === 'createdDate') val = row['createdAt'] || row['created_at'];
        if (col.id === 'updatedDate') val = row['updatedAt'] || row['updated_at'];
        if (col.id === 'createdBy') val = row['created_by'];
        if (col.id === 'updatedBy') val = row['updated_by'];
      }
    }

    if (col.renderCell) return col.renderCell(val, row);

    if (col.id === 'index') return (page * size) + idx + 1;

    // Standard Photo Rendering (SOP Compliance)
    if (col.id === 'photo' || col.id === 'employeePhotoUpload' || col.id === 'avatar') {
      return (
        <Avatar
          src={getPhotoUrl(val)}
          variant="rounded"
          sx={{ width: 32, height: 40, bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}
        >
          <IconUser size={18} color="#ccc" />
        </Avatar>
      );
    }

    if (col.id === 'status' || col.id === 'accountStatus') {
      const statusText = getCellDisplayValue(col, row, idx);
      return <Chip label={statusText} size="small" sx={getStatusChipSx(statusText)} />;
    }

    // Date Formatting (SOP Compliance - Removes +00:00 via formatDate)
    const isDateField = col.id.toLowerCase().includes('date') || 
                       col.id.endsWith('At') || 
                       col.id.endsWith('_at') || 
                       col.id === 'entryDate' ||
                       col.id === 'invoiceDate';
    
    // Explicitly exclude false positives like 'state' or 'category'
    const isFalsePositive = col.id.toLowerCase().includes('state') || col.id.toLowerCase().includes('category');

    if (isDateField && !isFalsePositive) {
      return formatDate(val);
    }
    
    // Handle Boolean values (Yes/No)
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    
    if (typeof val === 'object' && val !== null) {
      return val.name || val.label || val.id || '-';
    }
    return (val !== null && val !== undefined && val !== '') ? String(val) : '-';
  };

  const activeSelectedId = selectedRowId !== undefined && selectedRowId !== null ? selectedRowId : localSelectedId;

  const { 
    height = 'calc(100vh - 185px)', 
    maxHeight, 
    minHeight, 
    ...restSx 
  } = sx;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height, maxHeight, minHeight, overflow: 'hidden' }}>
      <TableContainer component={Paper} sx={{ ...tableContainerSx, flexGrow: 1, height: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, ...restSx }} id={id}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col, ci) => (
                <TableCell
                  key={col.id}
                  sx={{
                    ...tableHeadCellSx,
                    ...(ci === 0 ? { borderTopLeftRadius: '16px' } : {}),
                    ...(!showActions && ci === columns.length - 1 ? { borderTopRightRadius: '16px' } : {})
                  }}
                >
                  {col.id === 'index' ? 'No' : col.label}
                </TableCell>
              ))}
              {showActions && (
                <TableCell sx={{ ...tableHeadCellSx, textAlign: 'center', borderTopRightRadius: '16px' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} sx={{ p: 0, border: 'none' }}>
                  <Box sx={{ position: 'sticky', left: 0, width: '100%', maxWidth: 'calc(100vw - 280px)', display: 'flex', justifyContent: 'center', py: 3 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>Loading data...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (filteredRows?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} sx={{ p: 0, border: 'none' }}>
                  <Box sx={{ position: 'sticky', left: 0, width: '100%', maxWidth: 'calc(100vw - 280px)', display: 'flex', justifyContent: 'center', py: 3 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No records found.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, idx) => {
                const rowId = row.id !== undefined && row.id !== null ? row.id : `row-idx-${idx}`;
                const isSelected = activeSelectedId === rowId || activeSelectedId === row.id;
                
                const rowSx = {
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: isSelected 
                    ? (isDark ? alpha(theme.palette.primary.main, 0.25) : alpha(theme.palette.primary.main, 0.12))
                    : (idx % 2 === 1 ? (isDark ? '#161b22' : '#fafafa') : (isDark ? 'background.paper' : '#ffffff')),
                  '& td': { 
                    borderBottom: '1px solid', 
                    borderColor: isSelected ? theme.palette.primary.main : 'divider', 
                    py: 1.5 // Ensure padding doesn't shrink!
                  },
                  '&:hover': {
                    bgcolor: isSelected 
                      ? (isDark ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.16)) + ' !important'
                      : (isDark ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.05)) + ' !important'
                  }
                };

                return (
                  <TableRow 
                    key={rowId}
                    hover 
                    sx={rowSx} 
                    onClick={() => {
                      setLocalSelectedId(rowId);
                      onClickRow?.(row);
                    }}
                    onDoubleClick={() => onDoubleClickRow ? onDoubleClickRow(row) : (onEditRow ? onEditRow(row) : null)}
                  >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      sx={{
                        cursor: (onDoubleClickRow || onClickRow || onEditRow) ? 'pointer' : 'default',
                        ...(col.id === 'index' ? { color: isSelected ? 'primary.dark' : 'primary.main', fontWeight: 600 } : {}),
                        ...(col.bold ? { fontWeight: 600, color: '#37474f' } : {}),
                        // SOP: Prevent column split issue by keeping text on one line unless explicitly long
                        whiteSpace: (String(row[col.id] || '').length > 50 || col.wrap) ? 'normal' : 'nowrap',
                        ...(col.maxWidth ? { maxWidth: col.maxWidth, overflow: 'hidden', textOverflow: 'ellipsis' } : {}),
                        minWidth: col.id === 'index' ? 60 : (col.minWidth || 100),
                        paddingX: 1.5
                      }}
                    >
                      {(() => {
                        if (renderCell) {
                          const customVal = renderCell(col, row, idx);
                          if (customVal !== null && customVal !== undefined) return customVal;
                        }
                        return defaultRenderCell(col, row, idx);
                      })()}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell align="center" sx={{ minWidth: 100 }}>
                      <Stack direction="row" justifyContent="center" spacing={1} sx={{ flexWrap: 'nowrap', alignItems: 'center' }}>
                        {actionColumn && actionColumn.render && (
                          <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
                            {actionColumn.render(row)}
                          </Box>
                        )}
                        {onEditRow && (
                          <Tooltip title="Edit">
                            <IconButton onClick={(e) => { e.stopPropagation(); onEditRow(row); }} size="small" sx={tableActionEditSx}>
                              <IconEdit size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDeleteRow && (
                          <Tooltip title="Delete">
                            <IconButton onClick={(e) => { e.stopPropagation(); onDeleteRow(row); }} size="small" sx={tableActionDeleteSx}>
                              <IconTrash size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ 
        py: 0, 
        px: 1.5, 
        minHeight: '36px',
        height: '36px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        borderTop: '1px solid', 
        borderColor: 'divider',
        bgcolor: isDark ? 'background.default' : 'grey.50',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          {footerActions}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount ?? (rows?.length || 0)}
            rowsPerPage={size}
            page={page}
            onPageChange={(e, p) => onPageChange(p)}
            onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
            sx={{
              minHeight: '36px !important',
              height: '36px !important',
              overflow: 'hidden',
              border: 'none',
              '& .MuiTablePagination-toolbar': { 
                justifyContent: 'center', 
                flexWrap: 'nowrap',
                minHeight: '36px !important',
                height: '36px',
                p: '0px !important',
                gap: 1
              },
              '& .MuiTablePagination-spacer': { display: 'none' },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                margin: 0,
                fontSize: '0.75rem',
                fontWeight: 500
              },
              '& .MuiTablePagination-select': {
                py: '2px',
                fontSize: '0.75rem',
                fontWeight: 500
              },
              '& .MuiTablePagination-actions': {
                margin: 0
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} />
      </Box>
    </Box>
  );
}

BOSDataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  totalCount: PropTypes.number,
  loading: PropTypes.bool,
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  onDoubleClickRow: PropTypes.func,
  onClickRow: PropTypes.func,
  selectedRowId: PropTypes.any,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  showActions: PropTypes.bool,
  actionColumn: PropTypes.object,
  renderCell: PropTypes.func,
  footerActions: PropTypes.node,
  id: PropTypes.string,
  disableSearchFilter: PropTypes.bool
};
