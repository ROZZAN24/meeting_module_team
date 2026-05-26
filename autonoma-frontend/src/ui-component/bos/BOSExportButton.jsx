import React, { useState, useMemo } from 'react';
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
import useAuth from 'hooks/useAuth';
import BOSDataTable from './BOSDataTable';
import { format } from 'date-fns';
import axios from 'utils/axios';

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
  size = 'medium',
  pageId = null,
  pageName = null,
  pageCode = null
}) {
  const theme = useTheme();
  const { user } = useAuth();
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
        let val = typeof col.key === 'function' ? col.key(row) : row[col.key];
        // Format dates for Excel readability
        const keyName = typeof col.key === 'string' ? col.key.toLowerCase() : '';
        if (keyName.includes('date') || keyName.includes('at')) {
          try {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
              val = format(d, 'dd/MM/yyyy HH:mm');
            }
          } catch (e) { /* ignore */ }
        }
        mappedRow[col.header] = val || '-';
      });

      // Auto-append Audit Columns if they exist in the row data (SOP Standard)
      const auditFields = [
        { key: 'createdBy', label: 'Created By' },
        { key: 'createdDate', label: 'Created Date' },
        { key: 'updatedBy', label: 'Updated By' },
        { key: 'updatedDate', label: 'Updated Date' }
      ];

      auditFields.forEach(field => {
        let val = row[field.key];
        if (val) {
          if (field.key.includes('Date')) {
            try { val = format(new Date(val), 'dd/MM/yyyy HH:mm'); } catch (e) { /* ignore */ }
          }
          mappedRow[field.label] = val;
        }
      });

      return mappedRow;
    });
  };

  const getFormattedFilename = () => {
    const ts = format(new Date(), 'dd-MM-yyyy_HHmm');
    return `${filename}_${ts}`;
  };

  const uploadAndLogExport = async (formatType) => {
    const pageTitle = filename.replace(/_/g, ' ');
    let filePath = null;

    // 1. Prepare and upload the JSON metadata file to enable high-fidelity preview
    try {
      const exportMeta = {
        data: prepareData(),
        columns: columns || (data.length > 0 ? Object.keys(data[0]).map(k => ({ header: k, key: k })) : []),
        filename: filename,
        formatType: formatType,
        timestamp: new Date().toISOString()
      };

      const jsonBlob = new Blob([JSON.stringify(exportMeta)], { type: 'application/json' });
      const formData = new FormData();
      const metaFilename = `${getFormattedFilename()}_meta.json`;
      formData.append('file', jsonBlob, metaFilename);
      formData.append('module', 'TRACEABILITY');

      const uploadRes = await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      filePath = uploadRes.data; // e.g. "DEFAULT/uuid_name_meta.json"
    } catch (err) {
      console.error('Failed to upload export metadata to server:', err);
    }

    // 2. Log to standard audit trail
    try {
      await axios.post('/api/audit-trail/log', {
        userId: user?.username || user?.email || user?.name || 'SYSTEM',
        pageName: `${pageTitle} Master`,
        actionType: 'EXPORT',
        tableName: filename,
        recordId: formatType,
        previousValue: JSON.stringify({
          recordCount: data.length,
          filename: getFormattedFilename(),
          format: formatType
        }),
        currentValue: null,
        comments: `Exported ${data.length} records of ${pageTitle} in ${formatType} format.`
      });
    } catch (err) {
      console.error('Failed to log export audit:', err);
    }

    // 3. Log to File Traceability Hub
    try {
      const computedPageName = pageTitle.toLowerCase().endsWith('master') ? pageTitle : `${pageTitle} Master`;
      await axios.post('/api/file-traceability', {
        pageId: pageId,
        pageCode: pageCode || 'M_DF_01',
        pageName: pageName || computedPageName,
        reportName: `${getFormattedFilename()}.${formatType === 'Excel' ? 'xlsx' : 'pdf'}`,
        filePath: filePath,
        createdBy: user?.username || user?.email || user?.name || 'SYSTEM'
      });
    } catch (err) {
      console.error('Failed to log file traceability:', err);
    }
  };

  const handleExportExcel = () => {
    if (!data || data.length === 0) return;
    uploadAndLogExport('Excel');
    exportToExcel(prepareData(), getFormattedFilename(), { userName: user?.name });
    handleClosePreview();
  };

  const handleExportPDF = () => {
    if (!data || data.length === 0) return;
    uploadAndLogExport('PDF');
    const originalTitle = document.title;
    document.title = getFormattedFilename();
    window.print();
    document.title = originalTitle;
    handleClosePreview();
  };

  const getColumnLetter = (n) => String.fromCharCode(65 + n);

  const previewColumns = columns ? columns.map((c, i) => ({ id: c.header, label: getColumnLetter(i) })) :
    (data.length > 0 ? Object.keys(data[0]).map((k, i) => ({ id: k, label: getColumnLetter(i) })) : []);

  const previewRows = useMemo(() => {
    const baseData = prepareData();
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    // For the UI Preview, we insert the header rows as "pseudo-rows" at the top
    const headerRows = [
      { [previewColumns[0]?.id]: 'AUTONOMA BUSINESS OPERATING SYSTEM' },
      { [previewColumns[0]?.id]: `Report: ${filename.replace(/_/g, ' ')}` },
      { [previewColumns[0]?.id]: `Generated By: ${user?.name || 'System'}` },
      { [previewColumns[0]?.id]: `Generated On: ${timestamp}` },
      {}, // Spacer
    ];

    // Excel column headers row (MEETING SCH NO, PARTICIPANT, etc.)
    const colHeadersRow = {};
    if (columns) {
      columns.forEach(col => {
        colHeadersRow[col.header] = col.header.toUpperCase();
      });
    } else if (data.length > 0) {
      Object.keys(data[0]).forEach(k => {
        colHeadersRow[k] = k.toUpperCase();
      });
    }

    return [...headerRows, colHeadersRow, ...baseData];
  }, [data, columns, user, filename, previewColumns]);

  const pdfColumns = columns ? columns.map(c => ({ id: c.header, label: c.header })) :
    (data.length > 0 ? Object.keys(data[0]).map(k => ({ id: k, label: k })) : []);

  const pdfRows = useMemo(() => {
    return prepareData();
  }, [data, columns]);

  // Excel simulation helpers

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
                    {previewRows[0] ? previewRows[0][previewColumns[0]?.id] : ''}
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
                      rows={previewRows}
                      page={page}
                      size={sizePerPage}
                      totalCount={previewRows.length}
                      onPageChange={setPage}
                      onSizeChange={setSizePerPage}
                      showActions={false}
                      disableSearchFilter={true}
                      sx={{
                        '& th': {
                          bgcolor: '#f8f9fa !important',
                          color: '#444 !important',
                          fontWeight: '600 !important',
                          textAlign: 'center',
                          borderRight: '1px solid #bbb',
                          borderBottom: '2px solid #bbb',
                          height: 40,
                          fontSize: '11px',
                          minWidth: '160px !important'
                        },
                        '& td': {
                          borderRight: '1px solid #ccc',
                          borderBottom: '1px solid #ccc',
                          fontSize: '13px',
                          height: 40,
                          position: 'relative',
                          minWidth: '160px !important'
                        },
                        // SPREADSHEET TABLE HEADER ROW (Row 6)
                        '& tr:nth-of-type(6) td': {
                          bgcolor: '#f1f3f4 !important',
                          fontWeight: '700 !important',
                          color: '#000 !important',
                          textAlign: 'left',
                          fontSize: '12px',
                          borderBottom: '2px solid #bbb !important'
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
                      Generated By: {user?.name || 'System User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                      {pdfColumns.map(col => (
                        <th key={col.id} style={{ padding: '12px 10px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pdfRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? 'transparent' : '#fafafa' }}>
                        {pdfColumns.map(col => (
                          <td key={col.id} style={{ padding: '12px 10px', fontSize: '11px', color: '#444' }}>
                            {row[col.id]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {pdfRows.length > 15 && (
                  <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '4px' }}>
                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      [... {pdfRows.length - 15} additional records omitted from preview ...]
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
  size: PropTypes.string,
  pageId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pageName: PropTypes.string,
  pageCode: PropTypes.string
};


