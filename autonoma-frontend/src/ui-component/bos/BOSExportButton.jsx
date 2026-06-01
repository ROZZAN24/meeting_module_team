import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Tooltip, CircularProgress, Box, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Stack, Divider, Tabs, Tab, Paper, useTheme,
  Checkbox, FormControlLabel, FormGroup, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  IconFileExport, IconFileSpreadsheet, IconFileTypePdf,
  IconX, IconEye, IconFunction, IconPlus, IconSearch,
  IconChevronLeft, IconChevronRight
} from '@tabler/icons-react';
import { exportToExcel } from 'utils/excelExport';
import useAuth from 'hooks/useAuth';
import BOSDataTable from './BOSDataTable';
import { format } from 'date-fns';
import axios from 'utils/axios';
import { resolveNestedValue } from './BOSUtils';

/**
 * ═══════════════════════════════════════════════════════════════
 * BOSExportButton — Standard Export with High-Fidelity Preview
 * ═══════════════════════════════════════════════════════════════
 */

export default function BOSExportButton({
  data = [],
  filename = 'Export',
  columns = null,
  screenColumns = null,
  disabled = false,
  loading = false,
  variant = 'outlined',
  color = 'primary',
  size = 'medium',
  pageId = null,
  pageName = null,
  pageCode = null,
  sx = {}
}) {
  const theme = useTheme();

  const normalizedColumns = useMemo(() => {
    if (!columns) return [];
    return columns.map(c => {
      if (!c) return null;
      return {
        ...c,
        key: c.key || c.id,
        header: c.header || c.label || c.id || c.key
      };
    }).filter(Boolean);
  }, [columns]);

  const normalizedScreenColumns = useMemo(() => {
    if (!screenColumns) return [];
    return screenColumns.map(c => {
      if (!c) return null;
      return {
        ...c,
        key: c.key || c.id,
        header: c.header || c.label || c.id || c.key
      };
    }).filter(Boolean);
  }, [screenColumns]);
  const { user } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Excel, 1: PDF
  const [page, setPage] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);

  const [selectedPdfColKeys, setSelectedPdfColKeys] = useState([]);
  const [selectedExcelColKeys, setSelectedExcelColKeys] = useState([]);
  const [orientationOverride, setOrientationOverride] = useState(null); // null (Auto), 'portrait', 'landscape'
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [showPdfHeader, setShowPdfHeader] = useState(true);
  const [companyProfile, setCompanyProfile] = useState({ companyName: 'AUTONOMA', shortName: 'Business Operating System' });

  // Fetch company profile once on mount
  useEffect(() => {
    axios.get('/api/company-profile/all')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length > 0) {
          const rec = list[0];
          setCompanyProfile({
            companyName: rec.companyName || 'AUTONOMA',
            shortName: rec.shortName || rec.dbSourceName || 'Business Operating System'
          });
        }
      })
      .catch(() => { /* silently use defaults */ });
  }, []);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(480, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const allAvailableCols = useMemo(() => {
    const seen = new Set();
    const list = [];
    const source = [...(normalizedScreenColumns || []), ...(normalizedColumns || [])];
    source.forEach(col => {
      if (col && col.key && !seen.has(col.key)) {
        seen.add(col.key);
        list.push(col);
      }
    });
    return list;
  }, [normalizedScreenColumns, normalizedColumns]);

  // Synchronize/initialize checkboxes when dialog opens
  useEffect(() => {
    if (previewOpen) {
      // Default PDF: curated columns if defined and not empty, else all screen columns
      const initialPdf = (normalizedColumns && normalizedColumns.length > 0) ? normalizedColumns : (normalizedScreenColumns || []);
      setSelectedPdfColKeys(initialPdf.map(c => c.key));

      // Default Excel: screen columns if defined and not empty, else all columns
      const initialExcel = (normalizedScreenColumns && normalizedScreenColumns.length > 0) ? normalizedScreenColumns : (normalizedColumns || []);
      setSelectedExcelColKeys(initialExcel.map(c => c.key));

      setOrientationOverride(null);
      setSettingsCollapsed(false);
      setShowPdfHeader(true);
    }
  }, [previewOpen, normalizedColumns, normalizedScreenColumns]);

  const excelColumns = useMemo(() => {
    return allAvailableCols.filter(col => selectedExcelColKeys.includes(col.key));
  }, [allAvailableCols, selectedExcelColKeys]);

  const pdfCols = useMemo(() => {
    return allAvailableCols.filter(col => selectedPdfColKeys.includes(col.key));
  }, [allAvailableCols, selectedPdfColKeys]);


  const handleOpenPreview = () => setPreviewOpen(true);
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setActiveTab(0);
  };

  const prepareData = (colsList) => {
    const activeCols = colsList || normalizedColumns;
    if (!activeCols || activeCols.length === 0) return data;
    return data.map(row => {
      const mappedRow = {};
      activeCols.forEach(col => {
        let val = typeof col.key === 'function' ? col.key(row) : resolveNestedValue(col.key, row);
        
        const keyName = typeof col.key === 'string' ? col.key : '';
        if (keyName === 'updatedBy' || keyName === 'updated_by') {
          const hasUpdate = row['updatedAt'] || row['updated_at'] || row['updatedDate'] || row['updated_date'];
          if (!hasUpdate) {
            val = '-';
          }
        }

        // Format dates for Excel readability
        const keyNameLower = keyName.toLowerCase();
        const colHeaderLower = col.header.toLowerCase();
        const isUserField = keyNameLower.includes('user') || keyNameLower.includes('by') || 
                            colHeaderLower.includes('user') || colHeaderLower.includes('by');

        if (isUserField) {
          if (typeof val === 'object' && val !== null) {
            val = val.username || val.userId || val.empCode || val.empId || val.id || '-';
          }
        } else if (typeof val === 'object' && val !== null) {
          val = val.name || val.label || val.id || '-';
        }

        if ((keyNameLower.includes('date') || keyNameLower.includes('at')) && !keyNameLower.includes('by')) {
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
        { key: 'createdUser', fallback: 'createdBy', label: 'Created User' },
        { key: 'createdDate', fallback: 'createdAt', label: 'Created Date' },
        { key: 'updatedUser', fallback: 'updatedBy', label: 'Updated User' },
        { key: 'updatedDate', fallback: 'updatedAt', label: 'Updated Date' }
      ];

      const hasUpdate = row['updatedAt'] || row['updated_at'] || row['updatedDate'] || row['updated_date'];
      auditFields.forEach(field => {
        let val = row[field.key] || 
                  (field.fallback ? row[field.fallback] : undefined) || 
                  row[field.key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)] || 
                  (field.fallback ? row[field.fallback.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)] : undefined);
        if (field.key.startsWith('updated') && !hasUpdate) {
          val = null;
        }
        if (val) {
          if (field.key.startsWith('createdUser') || field.key.startsWith('updatedUser') || 
              field.key.startsWith('createdBy') || field.key.startsWith('updatedBy')) {
            if (typeof val === 'object' && val !== null) {
              val = val.username || val.userId || val.empCode || val.empId || val.id || '-';
            }
          } else if (typeof val === 'object' && val !== null) {
            val = val.name || val.label || val.id || '-';
          }
          if (field.key.endsWith('At') || field.key.endsWith('Date')) {
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
    const activeCols = formatType === 'Excel' ? excelColumns : pdfCols;

    // 1. Prepare and upload the JSON metadata file to enable high-fidelity preview
    try {
      const exportMeta = {
        data: prepareData(activeCols),
        columns: activeCols,
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
        createdUser: user?.username || user?.email || user?.name || 'SYSTEM'
      });
    } catch (err) {
      console.error('Failed to log file traceability:', err);
    }
  };

  const handleExportExcel = () => {
    if (!data || data.length === 0) return;
    uploadAndLogExport('Excel');
    exportToExcel(prepareData(excelColumns), getFormattedFilename(), { 
      userName: user?.id || user?.username || user?.email || 'SYSTEM',
      companyName: companyProfile.companyName || 'AUTONOMA',
      shortName: companyProfile.shortName || 'Business Operating System'
    });
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

  const previewColumns = useMemo(() => {
    return excelColumns.map((c, i) => ({ id: c.header, label: getColumnLetter(i) }));
  }, [excelColumns]);

  const previewRows = useMemo(() => {
    const baseData = prepareData(excelColumns);

    // Excel column headers row
    const colHeadersRow = {};
    excelColumns.forEach(col => {
      colHeadersRow[col.header] = col.header.toUpperCase();
    });

    return [colHeadersRow, ...baseData];
  }, [data, excelColumns]);

  const pdfColumns = useMemo(() => {
    return pdfCols.map(c => ({ id: c.header, label: c.header }));
  }, [pdfCols]);

  const pdfRows = useMemo(() => {
    return prepareData(pdfCols);
  }, [data, pdfCols]);

  const isLandscape = useMemo(() => {
    if (orientationOverride) return orientationOverride === 'landscape';
    return pdfColumns.length > 5;
  }, [orientationOverride, pdfColumns.length]);

  const padding = pdfColumns.length > 8 ? '4px 3px' : (pdfColumns.length > 5 ? '6px 4px' : '10px 8px');
  const fontSizeHeader = pdfColumns.length > 8 ? '8.5px' : (pdfColumns.length > 5 ? '10px' : '11.5px');
  const fontSizeCell = pdfColumns.length > 8 ? '7.5px' : (pdfColumns.length > 5 ? '9px' : '10.5px');
  const paperPadding = pdfColumns.length > 8 ? '8mm' : (pdfColumns.length > 5 ? '12mm' : '20mm');
  const paperWidth = isLandscape ? '297mm' : '210mm';
  const paperMinHeight = isLandscape ? '210mm' : '297mm';

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
              px: 2,
              ...sx
            }}
          >
            Export
          </Button>
        </span>
      </Tooltip>

      <Dialog
        id="bos-pdf-print-dialog"
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden', height: '90vh' } }}
      >
        <DialogTitle className="no-print" sx={{ p: 2, bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
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

        <Box className="no-print" sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', px: 2, py: 0.5, gap: 2 }}>
          {/* Left element: Settings Toggle Button */}
          <Button
            variant={settingsCollapsed ? "contained" : "outlined"}
            color="primary"
            onClick={() => setSettingsCollapsed(!settingsCollapsed)}
            startIcon={settingsCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: 2,
              height: '36px',
              minWidth: '145px',
              whiteSpace: 'nowrap'
            }}
          >
            {settingsCollapsed ? "Show Settings" : "Hide Settings"}
          </Button>

          {/* Center element: Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            aria-label="export preview tabs" 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              '& .MuiTabs-flexContainer': { justifyContent: 'center' } 
            }}
          >
            <Tab icon={<IconFileSpreadsheet size={20} />} iconPosition="start" label="Excel Spreadsheet" sx={{ fontWeight: 600 }} />
            <Tab icon={<IconFileTypePdf size={20} />} iconPosition="start" label="PDF Document" sx={{ fontWeight: 600 }} />
          </Tabs>

          {/* Right element: Empty spacer to balance the left settings button */}
          <Box sx={{ width: '145px', flexShrink: 0 }} />
        </Box>

        <DialogContent sx={{ p: 0, bgcolor: 'grey.100', display: 'flex', flexDirection: 'row', height: '100%', overflow: 'hidden' }}>
          {/* LEFT SIDEBAR: EXPORT SETTINGS */}
          <Box className="no-print" sx={{
            width: settingsCollapsed ? 0 : sidebarWidth,
            borderRight: settingsCollapsed ? 'none' : '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowX: 'hidden',
            overflowY: 'auto',
            p: settingsCollapsed ? 0 : 2.5,
            position: 'relative',
            transition: isResizing ? 'none' : 'width 0.25s ease, p 0.25s ease, border 0.25s ease',
          }}>
            {/* Resize Handle */}
            {!settingsCollapsed && (
              <Box
                onMouseDown={startResizing}
                sx={{
                  width: '6px',
                  cursor: 'col-resize',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 10,
                  bgcolor: isResizing ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                  transition: 'background-color 0.2s',
                }}
              />
            )}

            {!settingsCollapsed && (
              <Box sx={{ width: sidebarWidth - 40, minWidth: 230 }}>
                {activeTab === 0 ? (
                  // Excel settings
                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Excel Settings
                        </Typography>
                        <IconButton size="small" onClick={() => setSettingsCollapsed(true)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', p: 0.5 }}>
                          <IconChevronLeft size={16} />
                        </IconButton>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Select columns to include in the spreadsheet.
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Columns</Typography>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="text" sx={{ p: 0, minWidth: 0, textTransform: 'none', fontSize: '11px', fontWeight: 600 }} onClick={() => setSelectedExcelColKeys(allAvailableCols.map(c => c.key))}>
                            All
                          </Button>
                          <Typography variant="caption" color="text.disabled">|</Typography>
                          <Button size="small" variant="text" color="secondary" sx={{ p: 0, minWidth: 0, textTransform: 'none', fontSize: '11px', fontWeight: 600 }} onClick={() => setSelectedExcelColKeys([])}>
                            None
                          </Button>
                        </Stack>
                      </Stack>

                      <FormGroup sx={{ gap: 0.5 }}>
                        {allAvailableCols.map(col => (
                          <FormControlLabel
                            key={col.key}
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedExcelColKeys.includes(col.key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedExcelColKeys([...selectedExcelColKeys, col.key]);
                                  } else {
                                    setSelectedExcelColKeys(selectedExcelColKeys.filter(k => k !== col.key));
                                  }
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ fontSize: '13px', color: 'text.primary', fontWeight: selectedExcelColKeys.includes(col.key) ? 600 : 400 }}>
                                {col.header}
                              </Typography>
                            }
                            sx={{ ml: -0.5 }}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  </Stack>
                ) : (
                  // PDF settings
                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          PDF Settings
                        </Typography>
                        <IconButton size="small" onClick={() => setSettingsCollapsed(true)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', p: 0.5 }}>
                          <IconChevronLeft size={16} />
                        </IconButton>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Configure document format and layout.
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Page Layout Settings */}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Orientation
                      </Typography>
                      <ToggleButtonGroup
                        value={orientationOverride}
                        exclusive
                        onChange={(e, val) => { if (val !== null) setOrientationOverride(val); }}
                        size="small"
                        fullWidth
                        sx={{
                          '& .MuiToggleButton-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 0.5
                          }
                        }}
                      >
                        <ToggleButton value="portrait">
                          Portrait
                        </ToggleButton>
                        <ToggleButton value="landscape">
                          Landscape
                        </ToggleButton>
                      </ToggleButtonGroup>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setOrientationOverride(null)}
                        disabled={orientationOverride === null}
                        sx={{ textTransform: 'none', mt: 0.5, fontSize: '11px', fontWeight: 600 }}
                      >
                        Reset to Default (Auto)
                      </Button>
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Paper Size
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.25,
                        bgcolor: 'grey.50',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '13px' }}>
                          A4 Standard
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          210 x 297 mm
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />

                    {/* Show Header Toggle */}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Document Header
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={showPdfHeader}
                            onChange={(e) => setShowPdfHeader(e.target.checked)}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: '13px', color: 'text.primary' }}>
                            Show AUTONOMA header
                          </Typography>
                        }
                        sx={{ ml: -0.5 }}
                      />
                    </Box>

                    <Divider />

                    {/* Columns selection */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Columns</Typography>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="text" sx={{ p: 0, minWidth: 0, textTransform: 'none', fontSize: '11px', fontWeight: 600 }} onClick={() => setSelectedPdfColKeys(allAvailableCols.map(c => c.key))}>
                            All
                          </Button>
                          <Typography variant="caption" color="text.disabled">|</Typography>
                          <Button size="small" variant="text" color="secondary" sx={{ p: 0, minWidth: 0, textTransform: 'none', fontSize: '11px', fontWeight: 600 }} onClick={() => setSelectedPdfColKeys([])}>
                            None
                          </Button>
                        </Stack>
                      </Stack>

                      <FormGroup sx={{ gap: 0.5 }}>
                        {allAvailableCols.map(col => (
                          <FormControlLabel
                            key={col.key}
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedPdfColKeys.includes(col.key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPdfColKeys([...selectedPdfColKeys, col.key]);
                                  } else {
                                    setSelectedPdfColKeys(selectedPdfColKeys.filter(k => k !== col.key));
                                  }
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ fontSize: '13px', color: 'text.primary', fontWeight: selectedPdfColKeys.includes(col.key) ? 600 : 400 }}>
                                {col.header}
                              </Typography>
                            }
                            sx={{ ml: -0.5 }}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  </Stack>
                )}
              </Box>
            )}
          </Box>

          {/* RIGHT VIEWPORT: PREVIEW */}
          <Box sx={{
            flexGrow: 1,
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            p: activeTab === 0 ? 2 : 4,
            height: '100%',
            width: '100%',
            position: 'relative'
          }}>

            {activeTab === 0 ? (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                {/* EXCEL TOOLBAR SIMULATION */}
                <Paper sx={{ mb: 1, p: 1, bgcolor: 'white', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
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
                  position: 'relative',
                  width: '100%',
                  height: 'calc(100% - 60px)'
                }}>
                  {excelColumns.length === 0 ? (
                    <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', bgcolor: 'white' }}>
                      <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No columns selected. Use the settings panel on the left to select columns to display.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', width: '100%' }}>
                      {/* ROW NUMBERS (1, 2, 3...) */}
                      <Box sx={{ width: 40, bgcolor: '#f8f9fa', borderRight: '1px solid #bbb', position: 'sticky', left: 0, zIndex: 2 }}>
                        {Array.from({ length: sizePerPage }).map((_, i) => (
                          <Box key={i} sx={{ height: 40, borderBottom: '1px solid #bbb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#666' }}>
                            {page * sizePerPage + i + 1}
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ flexGrow: 1, width: 'calc(100% - 40px)' }}>
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
                          disableTableConfig={true}
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
                            // SPREADSHEET TABLE HEADER ROW (Row 1)
                            '& tr:nth-of-type(1) td': {
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
                  )}

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
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <style>{`
                  @media print {
                    #root {
                      display: none !important;
                    }
                    body {
                      margin: 0 !important;
                      padding: 0 !important;
                      overflow: visible !important;
                      background: white !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                    .print-only {
                      display: table !important;
                    }
                    .MuiDialog-root {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      overflow: visible !important;
                    }
                    .MuiDialog-container {
                      display: block !important;
                      width: 100% !important;
                      height: auto !important;
                      overflow: visible !important;
                    }
                    .MuiDialog-paper {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      max-height: none !important;
                      box-shadow: none !important;
                      border: none !important;
                      border-radius: 0 !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      overflow: visible !important;
                    }
                    .MuiDialogContent-root {
                      display: block !important;
                      overflow: visible !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      background: white !important;
                    }
                    .MuiDialogContent-root > div {
                      padding: 0 !important;
                      margin: 0 !important;
                      display: block !important;
                      overflow: visible !important;
                    }
                    .bos-pdf-page-card {
                      width: 100% !important;
                      min-height: 0 !important;
                      box-shadow: none !important;
                      border: none !important;
                      margin: 0 !important;
                      padding: 5mm !important; /* Minimal padding on print to maximize printable A4 space */
                      page-break-inside: avoid !important;
                    }
                    tr {
                      page-break-inside: avoid !important;
                    }
                    @page {
                      size: ${isLandscape ? 'landscape' : 'portrait'};
                      margin: 10mm;
                    }
                  }
                  @media screen {
                    .print-only {
                      display: none !important;
                    }
                  }
                `}</style>
                <Paper 
                  className="bos-pdf-page-card"
                  sx={{
                    width: paperWidth,
                    minHeight: paperMinHeight,
                    p: paperPadding,
                    bgcolor: 'white',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                    fontFamily: theme.typography.fontFamily,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {showPdfHeader && (
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 6, borderBottom: '3px solid', borderColor: 'primary.main', pb: 2 }}>
                      <Box>
                        <Typography variant="h1" sx={{ color: 'primary.main', fontWeight: 900, fontSize: '2.5rem', letterSpacing: -1.5 }}>
                          {companyProfile.companyName}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2 }}>
                          {companyProfile.shortName}
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
                  )}

                  <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: '4px', borderLeft: '4px solid', borderColor: 'primary.main' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Report Summary
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This document contains {data.length} verified records from the Autonoma ERP database.
                    </Typography>
                  </Box>

                  {pdfColumns.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No columns selected. Use the settings panel on the left to select columns to display.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* 1. Preview Table (limited to 15 rows for UI performance, visible only on screen) */}
                      <table className="no-print" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', tableLayout: 'auto' }}>
                        <thead>
                          <tr style={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
                            {pdfColumns.map(col => (
                              <th key={col.id} style={{ 
                                padding: padding, 
                                textAlign: 'left', 
                                fontSize: fontSizeHeader, 
                                fontWeight: '700', 
                                textTransform: 'uppercase',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal'
                              }}>
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pdfRows.slice(0, 15).map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? 'transparent' : '#fafafa' }}>
                              {pdfColumns.map(col => (
                                <td key={col.id} style={{ 
                                  padding: padding, 
                                  fontSize: fontSizeCell, 
                                  color: '#444',
                                  wordBreak: 'break-word',
                                  whiteSpace: 'normal'
                                }}>
                                  {row[col.id]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* 2. Print Table (renders ALL rows, visible only when printing/saving to PDF) */}
                      <table className="print-only" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', tableLayout: 'auto' }}>
                        <thead>
                          <tr style={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
                            {pdfColumns.map(col => (
                              <th key={col.id} style={{ 
                                padding: padding, 
                                textAlign: 'left', 
                                fontSize: fontSizeHeader, 
                                fontWeight: '700', 
                                textTransform: 'uppercase',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal'
                              }}>
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pdfRows.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? 'transparent' : '#fafafa' }}>
                              {pdfColumns.map(col => (
                                <td key={col.id} style={{ 
                                  padding: padding, 
                                  fontSize: fontSizeCell, 
                                  color: '#444',
                                  wordBreak: 'break-word',
                                  whiteSpace: 'normal'
                                }}>
                                  {row[col.id]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {pdfRows.length > 15 && (
                        <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '4px' }} className="no-print">
                          <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            [... {pdfRows.length - 15} additional records omitted from preview ...]
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}

                  <Box sx={{ mt: 'auto', pt: 4, borderTop: '1px solid #eee', textAlign: 'center', position: 'relative', bottom: 0 }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                      Confidential Report | © {new Date().getFullYear()} Autonoma ERP
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
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
  screenColumns: PropTypes.arrayOf(
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
  pageCode: PropTypes.string,
  sx: PropTypes.object
};


