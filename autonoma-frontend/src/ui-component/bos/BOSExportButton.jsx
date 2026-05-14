import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Button, Tooltip, CircularProgress, Box, Typography, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  IconButton, Stack, Divider, Tabs, Tab, Paper, useTheme
} from '@mui/material';
import { 
  IconFileExport, IconFileSpreadsheet, IconFileTypePdf, 
  IconX, IconEye, IconFunction, IconPlus, IconSearch 
} from '@tabler/icons-react';
import { exportToExcel } from 'utils/excelExport';
import BOSDataTable from './BOSDataTable';

/**
 * ═══════════════════════════════════════════════════════════════
 * BOSExportButton — Standard Export with High-Fidelity Preview
 * ═══════════════════════════════════════════════════════════════
 */

export default function BOSExportButton({ 
  data = [], 
  filename = 'Export', 
  columns = null,
  disabled = false,
  loading = false,
  variant = 'outlined',
  color = 'primary',
  size = 'medium'
}) {
  const theme = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Excel, 1: PDF
  const [page, setPage] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);

  const handleOpenPreview = () => setPreviewOpen(true);
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setActiveTab(0);
  };

  const prepareData = () => {
    if (!columns || columns.length === 0) return data;
    return data.map(row => {
      const mappedRow = {};
      columns.forEach(col => {
        mappedRow[col.header] = row[col.key] || '-';
      });
      return mappedRow;
    });
  };

  const handleExportExcel = () => {
    if (!data || data.length === 0) return;
    exportToExcel(prepareData(), filename);
    handleClosePreview();
  };

  const handleExportPDF = () => {
    if (!data || data.length === 0) return;
    window.print();
    handleClosePreview();
  };

  const previewColumns = columns ? columns.map(c => ({ id: c.header, label: c.header })) : 
    (data.length > 0 ? Object.keys(data[0]).map(k => ({ id: k, label: k })) : []);

  const previewRows = prepareData();

  // Excel simulation helpers
  const getColumnLetter = (n) => String.fromCharCode(65 + n);

  return (
    <>
      <Tooltip title={`Preview & Export ${data.length} records`} arrow>
        <span>
          <Button
            variant={variant}
            color={color}
            size={size}
            disabled={disabled || data.length === 0 || loading}
            onClick={handleOpenPreview}
            startIcon={loading ? <CircularProgress size={16} /> : <IconEye size={18} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              px: 2
            }}
          >
            Export
          </Button>
        </span>
      </Tooltip>

      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden', height: '90vh' } }}
      >
        <DialogTitle sx={{ p: 2, bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconFileExport size={24} color="#2196f3" />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Export Designer</Typography>
              <Typography variant="caption" color="text.secondary">
                {filename.replace(/_/g, ' ')} ({data.length} records) • {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleClosePreview} size="small"><IconX size={20} /></IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} aria-label="export preview tabs" centered>
            <Tab icon={<IconFileSpreadsheet size={20} />} iconPosition="start" label="Excel Spreadsheet" sx={{ fontWeight: 600 }} />
            <Tab icon={<IconFileTypePdf size={20} />} iconPosition="start" label="PDF Document" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>
        
        <DialogContent sx={{ p: 0, bgcolor: 'grey.100', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 0 ? (
            <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* EXCEL TOOLBAR SIMULATION */}
              <Paper sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 1, borderRight: '1px solid #eee' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>A1</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                  <IconFunction size={16} color="#aaa" />
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '13px' }}>
                    {previewRows[0] ? previewRows[0][previewColumns[0].id] : ''}
                  </Typography>
                </Box>
              </Paper>

              <Paper sx={{ 
                flexGrow: 1,
                borderRadius: '4px', 
                overflow: 'hidden', 
                border: '1px solid', 
                borderColor: '#bbb',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                {/* COLUMN HEADERS (A, B, C...) */}
                <Box sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #bbb', display: 'flex', position: 'sticky', top: 0, zIndex: 3 }}>
                   <Box sx={{ width: 40, borderRight: '1px solid #bbb', bgcolor: '#e9ecef' }} />
                   {previewColumns.map((col, i) => (
                     <Box key={i} sx={{ flex: 1, textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#444', py: 0.5, borderRight: '1px solid #bbb' }}>
                       {getColumnLetter(i)}
                     </Box>
                   ))}
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex' }}>
                   {/* ROW NUMBERS (1, 2, 3...) */}
                   <Box sx={{ width: 40, bgcolor: '#f8f9fa', borderRight: '1px solid #bbb', position: 'sticky', left: 0, zIndex: 2 }}>
                      {Array.from({ length: sizePerPage }).map((_, i) => (
                        <Box key={i} sx={{ height: 40, borderBottom: '1px solid #bbb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#666' }}>
                          {page * sizePerPage + i + 1}
                        </Box>
                      ))}
                   </Box>

                   <Box sx={{ flexGrow: 1 }}>
                    <BOSDataTable
                      columns={previewColumns}
                      rows={previewRows.slice(page * sizePerPage, page * sizePerPage + sizePerPage)}
                      page={page}
                      size={sizePerPage}
                      totalCount={previewRows.length}
                      onPageChange={setPage}
                      onSizeChange={setSizePerPage}
                      showActions={false}
                      sx={{ 
                        '& th': { 
                          bgcolor: '#fff !important', 
                          color: '#000', 
                          fontWeight: 700, 
                          borderRight: '1px solid #bbb',
                          borderBottom: '2px solid #bbb',
                          height: 40,
                          fontSize: '12px'
                        },
                        '& td': { 
                          borderRight: '1px solid #ccc', 
                          borderBottom: '1px solid #ccc',
                          fontSize: '13px',
                          height: 40,
                          position: 'relative'
                        },
                        // SELECTED CELL HIGHLIGHT
                        '& tr:first-of-type td:first-of-type': {
                          outline: '2px solid #217346',
                          outlineOffset: '-2px',
                          bgcolor: '#e7f1ec'
                        },
                        border: 'none', 
                        boxShadow: 'none' 
                      }}
                    />
                   </Box>
                </Box>

                {/* EXCEL BOTTOM BAR (Sheet Tabs) */}
                <Box sx={{ bgcolor: '#f8f9fa', borderTop: '1px solid #bbb', p: 0.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                   <Stack direction="row" spacing={0.5} sx={{ px: 1 }}>
                      <Box sx={{ bgcolor: 'white', px: 2, py: 0.5, border: '1px solid #bbb', borderBottom: 'none', borderRadius: '4px 4px 0 0', fontSize: '11px', fontWeight: 700, color: '#217346' }}>
                        Sheet1
                      </Box>
                      <IconButton size="small"><IconPlus size={14} /></IconButton>
                   </Stack>
                   <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                   <Typography variant="caption" sx={{ fontSize: '10px', color: 'grey.600' }}>Ready</Typography>
                </Box>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
              <Paper sx={{ 
                width: '210mm', 
                minHeight: '297mm', 
                p: '25mm', 
                bgcolor: 'white', 
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                fontFamily: theme.typography.fontFamily
              }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 6, borderBottom: '3px solid', borderColor: 'primary.main', pb: 2 }}>
                  <Box>
                    <Typography variant="h1" sx={{ color: 'primary.main', fontWeight: 900, fontSize: '2.5rem', letterSpacing: -1.5 }}>
                      AUTONOMA
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2 }}>
                      Business Operating System
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{filename.replace(/_/g, ' ')}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Generated on: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 700 }}>
                      Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: '4px', borderLeft: '4px solid', borderColor: 'primary.main' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Report Summary
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This document contains {data.length} verified records from the Autonoma ERP database.
                  </Typography>
                </Box>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
                      {previewColumns.map(col => (
                        <th key={col.id} style={{ padding: '12px 10px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? 'transparent' : '#fafafa' }}>
                        {previewColumns.map(col => (
                          <td key={col.id} style={{ padding: '12px 10px', fontSize: '11px', color: '#444' }}>
                            {row[col.id]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {previewRows.length > 15 && (
                  <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '4px' }}>
                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      [... {previewRows.length - 15} additional records omitted from preview ...]
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 'auto', pt: 4, borderTop: '1px solid #eee', textAlign: 'center', position: 'relative', bottom: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                    Confidential Report | © {new Date().getFullYear()} Autonoma ERP
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <Divider />
        
        <DialogActions sx={{ p: 2.5, bgcolor: 'grey.50' }}>
          <Button variant="outlined" color="secondary" onClick={handleClosePreview} startIcon={<IconX size={18} />}>
            Cancel
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleExportExcel} 
              disabled={activeTab !== 0}
              startIcon={<IconFileSpreadsheet size={18} />}
              sx={{ 
                bgcolor: '#107c41', 
                '&:hover': { bgcolor: '#0a5c31' },
                opacity: activeTab === 0 ? 1 : 0.5,
                fontWeight: 700
              }}
            >
              Download Excel
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleExportPDF} 
              disabled={activeTab !== 1}
              startIcon={<IconFileTypePdf size={18} />}
              sx={{
                opacity: activeTab === 1 ? 1 : 0.5,
                fontWeight: 700
              }}
            >
              Download PDF
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

BOSExportButton.propTypes = {
  data: PropTypes.array.isRequired,
  filename: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired
    })
  ),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  variant: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string
};


