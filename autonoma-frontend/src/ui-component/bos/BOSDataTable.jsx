import PropTypes from 'prop-types';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Tooltip, TablePagination, Stack,
  Chip, Typography, useTheme
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import {
  tableContainerSx, tableHeadCellSx, getTableRowSx,
  tableActionEditSx, tableActionDeleteSx, getStatusChipSx
} from './BOSStyles';

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
  showActions = true,
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
  id
}) {
  const rows = data || rowsProp || [];
  console.log('[BOSDataTable] Rendering with rows:', rows.length);
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const baseRowSx = getTableRowSx(isDark);

  const formatDate = (d) => {
    if (!d) return '-';
    try { return format(new Date(d), 'dd-MM-yyyy HH:mm'); } catch { return '-'; }
  };

  const defaultRenderCell = (col, row, idx) => {
    if (col.render) return col.render(row, idx);
    const val = row[col.id];
    if (col.id === 'index') return page * size + idx + 1;
    if (col.id === 'status' || col.id === 'accountStatus') {
      const statusText = val === 1 || val === 'Active' ? 'Active' : 'Suspended';
      return <Chip label={statusText} size="small" sx={getStatusChipSx(statusText)} />;
    }
    if (col.id.toLowerCase().includes('date')) return formatDate(val);
    if (typeof val === 'object' && val !== null) {
      return val.name || val.label || val.id || '-';
    }
    return val ?? '-';
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ ...tableContainerSx, ...sx }} id={id}>
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
                  {col.label}
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
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>Loading data...</Typography>
                </TableCell>
              </TableRow>
            ) : (rows?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No records found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows?.map((row, idx) => {
                const isSelected = selectedRowId === row.id;
                const rowSx = {
                  ...baseRowSx,
                  ...(isSelected ? { 
                    bgcolor: isDark ? 'primary.darker' : 'primary.light',
                    '& td': { borderBottom: '1px solid', borderColor: 'primary.main' }
                  } : {})
                };

                return (
                  <TableRow 
                    key={row.id ?? idx} 
                    hover 
                    sx={rowSx} 
                    onClick={() => onClickRow?.(row)}
                    onDoubleClick={() => onDoubleClickRow ? onDoubleClickRow(row) : (onEditRow ? onEditRow(row) : null)}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        sx={{
                          cursor: (onDoubleClickRow || onClickRow) ? 'pointer' : 'default',
                          ...(col.id === 'index' ? { color: isSelected ? 'primary.dark' : 'primary.main', fontWeight: 600 } : {}),
                          ...(col.bold ? { fontWeight: 600, color: '#37474f' } : {}),
                          // SOP: 15-char wrap rule
                          whiteSpace: (String(row[col.id] || '').length > 15) ? 'normal' : 'nowrap',
                          ...(col.maxWidth ? { maxWidth: col.maxWidth, overflow: 'hidden', textOverflow: 'ellipsis' } : {}),
                          minWidth: col.minWidth || 80
                        }}
                      >
                        {renderCell ? renderCell(col, row, idx) : defaultRenderCell(col, row, idx)}
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell align="center">
                        <Stack direction="row" justifyContent="center" spacing={1}>
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
        p: 1.5, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between', 
        borderTop: '1px solid', 
        borderColor: 'divider',
        bgcolor: isDark ? 'background.default' : 'grey.50',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px'
      }}>
        <Box sx={{ flexGrow: 1 }}>
          {footerActions}
        </Box>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount ?? (rows?.length || 0)}
          rowsPerPage={size}
          page={page}
          onPageChange={(e, p) => onPageChange(p)}
          onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
          sx={{ border: 'none' }}
        />
      </Box>
    </>
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
  renderCell: PropTypes.func,
  footerActions: PropTypes.node,
  id: PropTypes.string
};
