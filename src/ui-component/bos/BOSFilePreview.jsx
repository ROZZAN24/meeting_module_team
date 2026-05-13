import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Tooltip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  IconX,
  IconDownload,
  IconExternalLink,
  IconFileDescription,
  IconPhoto,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconFileText,
  IconPrinter,
  IconChevronLeft,
  IconChevronRight,
  IconMaximize
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { sanitizeHTML } from 'utils/sanitize';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

/**
 * ═══════════════════════════════════════════════════════════════
 * BOSFilePreview — Universal Document Preview Dialog
 * ═══════════════════════════════════════════════════════════════
 * 
 * Supports all common document types:
 *  ✓ Images  (jpg, png, gif, webp, bmp, svg)
 *  ✓ PDF     (inline iframe viewer)
 *  ✓ Word    (docx/doc → HTML via mammoth)
 *  ✓ Excel   (xlsx/xls → HTML table via SheetJS)
 *  ✓ Text    (txt, csv → raw text)
 *  ✓ Video   (mp4, webm)
 *  ✓ Audio   (mp3, wav)
 *
 * Usage:
 *   import BOSFilePreview from 'ui-component/bos/BOSFilePreview';
 *
 *   <BOSFilePreview
 *     open={previewOpen}
 *     onClose={() => setPreviewOpen(false)}
 *     file={{ fileName: 'report.pdf', serverFileName: 'QMS/uuid_report.pdf', isServer: true }}
 *   />
 *
 *   // OR with a direct URL:
 *   <BOSFilePreview open={open} onClose={close} url="https://..." fileName="doc.pdf" />
 */

// ── Build view URL for server files ──
const buildViewUrl = (serverFileName) => {
  if (!serverFileName) return '';
  const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
  const filesPath = API_PATHS.FILES.startsWith('/') ? API_PATHS.FILES : `/${API_PATHS.FILES}`;
  // Encode segments but preserve slashes for Spring Boot {*filename}
  const safeName = serverFileName.split('/').map(s => encodeURIComponent(s)).join('/');
  return `${baseUrl}${filesPath}/view/${safeName}`;
};

// ── Build download URL for server files ──
const buildDownloadUrl = (serverFileName) => {
  if (!serverFileName) return '';
  const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
  const filesPath = API_PATHS.FILES.startsWith('/') ? API_PATHS.FILES : `/${API_PATHS.FILES}`;
  const safeName = serverFileName.split('/').map(s => encodeURIComponent(s)).join('/');
  return `${baseUrl}${filesPath}/download/${safeName}`;
};

// ── Detect file category from extension ──
const getFileCategory = (fileName) => {
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  if (['csv', 'txt', 'log', 'json', 'xml'].includes(ext)) return 'text';
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return 'audio';
  return 'unknown';
};

// ── Category Icon ──
const getCategoryIcon = (category) => {
  switch (category) {
    case 'image': return IconPhoto;
    case 'pdf': return IconFileTypePdf;
    case 'excel': return IconFileSpreadsheet;
    case 'word': return IconFileText;
    default: return IconFileDescription;
  }
};

// ── Category Color ──
const getCategoryColor = (category) => {
  switch (category) {
    case 'image': return '#4caf50';
    case 'pdf': return '#f44336';
    case 'excel': return '#2e7d32';
    case 'word': return '#1565c0';
    case 'video': return '#9c27b0';
    case 'audio': return '#ff9800';
    default: return '#757575';
  }
};

export default function BOSFilePreview({ 
  open, 
  onClose, 
  file, 
  url: directUrl, 
  fileName: directFileName,
  allFiles = [], // New: support for cycling through files
  onNavigate // New: callback for cycling
}) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Resolve props
  const currentFile = file || {};
  const fileName = currentFile.fileName || currentFile.name || directFileName || 'Document';
  const isServer = currentFile.isServer || currentFile.serverFileName;
  const category = getFileCategory(fileName);
  const CategoryIcon = getCategoryIcon(category);
  const categoryColor = getCategoryColor(category);

  // Strip UUID prefix for display & Truncate Middle
  const getDisplayName = (name, maxLength = 35) => {
    if (!name) return 'Document';
    let cleanName = name;
    const parts = name.split('_');
    if (parts.length > 1 && parts[0].length >= 32) {
      cleanName = parts.slice(1).join('_');
    }
    
    if (cleanName.length <= maxLength) return cleanName;
    
    const ext = cleanName.split('.').pop();
    const base = cleanName.substring(0, cleanName.lastIndexOf('.'));
    const charsToShow = maxLength - ext.length - 3;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);

    return base.substring(0, frontChars) + '...' + base.slice(-backChars) + '.' + ext;
  };
  const displayName = getDisplayName(fileName);

  const viewUrl = directUrl || (isServer ? buildViewUrl(currentFile.serverFileName || currentFile.name) : '');
  const downloadUrl = isServer ? buildDownloadUrl(currentFile.serverFileName || currentFile.name) : viewUrl;

  const currentIndex = allFiles.findIndex(f => (f.serverFileName || f.name) === (currentFile.serverFileName || currentFile.name));
  const hasMultiple = allFiles.length > 1;

  // ── Print Function ──
  const handlePrint = () => {
    if (category === 'pdf' || category === 'image') {
      const printWindow = window.open(viewUrl, '_blank');
      printWindow?.focus();
      printWindow?.print();
    } else {
      window.print(); // Fallback for HTML content
    }
  };

  // ── Navigation ──
  const navigate = (direction) => {
    if (!onNavigate || !hasMultiple) return;
    let nextIdx = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIdx >= allFiles.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = allFiles.length - 1;
    onNavigate(allFiles[nextIdx], nextIdx);
  };

  // ── Convert Word/Excel to HTML ──
  const convertDocument = useCallback(async () => {
    if (!open || !viewUrl || !['word', 'excel'].includes(category)) return;

    setLoading(true);
    setContent('');
    setError('');

    try {
      const response = await axios.get(viewUrl, { responseType: 'arraybuffer' });
      const arrayBuffer = response.data;

      // Defensive check: Very small buffers (e.g. < 1KB) are likely JSON error messages 
      // or invalid files, as docx/xlsx headers alone are usually larger.
      if (arrayBuffer.byteLength < 1000) {
        // Try to see if it's a JSON error
        const text = new TextDecoder().decode(arrayBuffer);
        if (text.includes('{"') || text.includes('message')) {
          console.error('[BOSFilePreview] Server returned a small buffer that looks like JSON error:', text);
          throw new Error('Server returned an invalid file or error message.');
        }
      }

      if (category === 'word') {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setContent(result.value);
      } else if (category === 'excel') {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        setContent(XLSX.utils.sheet_to_html(firstSheet));
      }
    } catch (err) {
      console.error('[BOSFilePreview] Conversion failed:', err);
      if (err.message && err.message.includes('invalid file')) {
        setError('The file appears to be corrupted or invalid.');
      } else {
        setError('Failed to load document preview. Try downloading the file instead.');
      }
    } finally {
      setLoading(false);
    }
  }, [open, viewUrl, category]);

  // ── Load text files ──
  const loadTextContent = useCallback(async () => {
    if (!open || !viewUrl || category !== 'text') return;

    setLoading(true);
    setContent('');
    setError('');

    try {
      const response = await axios.get(viewUrl, { responseType: 'text' });
      setContent(`<pre style="white-space:pre-wrap;word-break:break-word;font-family:monospace;font-size:13px;line-height:1.6;padding:16px;">${response.data}</pre>`);
    } catch (err) {
      setError('Failed to load text file.');
    } finally {
      setLoading(false);
    }
  }, [open, viewUrl, category]);

  useEffect(() => {
    if (!open) {
      setContent('');
      setError('');
      return;
    }
    if (['word', 'excel'].includes(category)) convertDocument();
    if (category === 'text') loadTextContent();
  }, [open, convertDocument, loadTextContent, category]);


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          maxHeight: '92vh'
        }
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1,
          px: 2,
          bgcolor: alpha(categoryColor, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <Box sx={{
            p: 0.75,
            borderRadius: 1.5,
            bgcolor: alpha(categoryColor, 0.12),
            display: 'flex'
          }}>
            <CategoryIcon size={22} color={categoryColor} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: { xs: '200px', md: '400px' } }}>
              {displayName}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={category.toUpperCase()} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800, bgcolor: alpha(categoryColor, 0.1), color: categoryColor }} />
              {hasMultiple && (
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {currentIndex + 1} of {allFiles.length}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {hasMultiple && (
            <>
              <Tooltip title="Previous (Left Arrow)">
                <IconButton size="small" onClick={() => navigate('prev')} sx={{ color: categoryColor }}><IconChevronLeft size={20} /></IconButton>
              </Tooltip>
              <Tooltip title="Next (Right Arrow)">
                <IconButton size="small" onClick={() => navigate('next')} sx={{ color: categoryColor }}><IconChevronRight size={20} /></IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />
            </>
          )}
          
          <Tooltip title="Print Document">
            <IconButton size="small" onClick={handlePrint} color="inherit"><IconPrinter size={20} /></IconButton>
          </Tooltip>
          <Tooltip title="Open Original">
            <IconButton size="small" onClick={() => window.open(viewUrl, '_blank')} color="inherit"><IconExternalLink size={20} /></IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <IconX size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent
        sx={{
          p: 0,
          minHeight: '500px',
          maxHeight: '75vh',
          display: (loading || error || (!content && category === 'unknown')) ? 'flex' : 'block',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa',
          overflow: 'auto'
        }}
      >
        {loading ? (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Converting document for preview...
            </Typography>
          </Stack>
        ) : error ? (
          <Stack alignItems="center" spacing={2} sx={{ p: 4 }}>
            <IconFileDescription size={48} color={theme.palette.error.main} />
            <Typography variant="body1" color="error" fontWeight={600}>
              {error}
            </Typography>
          </Stack>
        ) : (
          <>
            {/* Word / Excel / Text — Rendered HTML */}
            {content && (
              <Box
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  bgcolor: 'white',
                  p: 4,
                  '& table': { borderCollapse: 'collapse', width: '100%' },
                  '& th, & td': { border: '1px solid #e0e0e0', p: '6px 10px', fontSize: '0.85rem' },
                  '& th': { bgcolor: '#f5f5f5', fontWeight: 700 },
                  '& tr:nth-of-type(even)': { bgcolor: '#fafafa' }
                }}
              />
            )}

            {/* PDF — iframe */}
            {!content && category === 'pdf' && viewUrl && (
              <iframe
                title="PDF Preview"
                src={viewUrl}
                style={{ width: '100%', height: '75vh', border: 'none' }}
              />
            )}

            {/* Image — native img */}
            {!content && category === 'image' && viewUrl && (
              <Box
                component="img"
                src={viewUrl}
                alt={displayName}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  m: 3
                }}
              />
            )}

            {/* Video — native video */}
            {!content && category === 'video' && viewUrl && (
              <video
                controls
                style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 8 }}
                src={viewUrl}
              />
            )}

            {/* Audio — native audio */}
            {!content && category === 'audio' && viewUrl && (
              <Box sx={{ p: 4, width: '100%' }}>
                <audio controls style={{ width: '100%' }} src={viewUrl} />
              </Box>
            )}

            {/* Unknown — download prompt */}
            {!content && category === 'unknown' && (
              <Stack alignItems="center" spacing={2} sx={{ p: 6 }}>
                <IconFileDescription size={64} color={theme.palette.text.disabled} stroke={1} />
                <Typography variant="h5" color="text.secondary" fontWeight={600}>
                  Preview not available for this file type
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Click Download below to view the file
                </Typography>
              </Stack>
            )}
          </>
        )}
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fafafa' }}>
        {downloadUrl && (
          <Button
            startIcon={<IconDownload size={18} />}
            onClick={() => window.open(downloadUrl, '_blank')}
            sx={{ fontWeight: 600 }}
          >
            Download
          </Button>
        )}
        {viewUrl && (
          <Button
            startIcon={<IconExternalLink size={18} />}
            onClick={() => window.open(viewUrl, '_blank')}
            sx={{ fontWeight: 600 }}
          >
            Open in New Tab
          </Button>
        )}
        <Button variant="contained" onClick={onClose} sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

BOSFilePreview.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  file: PropTypes.shape({
    fileName: PropTypes.string,
    name: PropTypes.string,
    serverFileName: PropTypes.string,
    isServer: PropTypes.bool
  }),
  url: PropTypes.string,
  fileName: PropTypes.string
};
