import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  IconEye,
  IconTrash,
  IconFileDescription,
  IconX,
  IconDownload
} from '@tabler/icons-react';
import { API_PATHS } from 'utils/api-constants';
import axios from 'utils/axios';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

/**
 * BOSFileGallery - Standardized Attachment Gallery for Autonoma ERP
 */
export const BOSFileGallery = ({ 
  files = [], 
  onRemove, 
  isEditing = true, 
  title = 'Attachments',
  maxHeight = 300 
}) => {
  const theme = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ url: '', name: '', type: '', content: '' });
  const [loading, setLoading] = useState(false);

  const handlePreview = async (file) => {
    let url;
    const name = file.name || file.fileName || 'document';
    const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : '';
    
    setLoading(true);
    setPreviewOpen(true);
    setPreviewData({ url: '', name, type: file.type || file.fileType, content: '' });

    try {
      if (file.isServer || file.serverFileName) {
        const fileName = file.serverFileName || file.name;
        const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
        const filePath = API_PATHS.FILES.startsWith('/') ? API_PATHS.FILES : `/${API_PATHS.FILES}`;
        url = `${baseUrl}${filePath}/view/${encodeURIComponent(fileName)}`;
      } else {
        url = URL.createObjectURL(file instanceof File ? file : file.file);
      }

      let content = '';
      if (['docx', 'doc', 'xlsx', 'xls'].includes(ext)) {
        let arrayBuffer;
        if (file.isServer || file.serverFileName) {
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          arrayBuffer = response.data;
        } else {
          const actualFile = file instanceof File ? file : file.file;
          arrayBuffer = await actualFile.arrayBuffer();
        }

        if (ext === 'docx' || ext === 'doc') {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          content = result.value;
        } else if (ext === 'xlsx' || ext === 'xls') {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          content = XLSX.utils.sheet_to_html(firstSheet);
        }
      }

      setPreviewData({ url, name, type: file.type || file.fileType, content });
    } catch (error) {
      console.error('Preview failed:', error);
      setPreviewData(prev => ({ ...prev, content: '<div style="padding: 20px; color: red;">Failed to load preview. Please download the file to view.</div>' }));
    } finally {
      setLoading(false);
    }
  };

  const isImage = (file) => {
    const name = (file.name || file.fileName || '').toLowerCase();
    const type = (file.type || file.fileType || '').toLowerCase();
    return type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  };

  const getFileUrl = (file) => {
    if (file.isServer || file.serverFileName) {
      const fileName = file.serverFileName || file.name;
      const baseUrl = (axios.defaults.baseURL || '').replace(/\/+$/, '');
      const filePath = API_PATHS.FILES.startsWith('/') ? API_PATHS.FILES : `/${API_PATHS.FILES}`;
      return `${baseUrl}${filePath}/download/${fileName}`;
    }
    return URL.createObjectURL(file instanceof File ? file : file.file);
  };

  return (
    <Box>
      <Box sx={{ mt: 1, textAlign: 'left', maxHeight: maxHeight, overflow: 'auto', pr: 0.5 }}>
        {files.length === 0 ? (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', py: 2 }}>
            No attachments found
          </Typography>
        ) : (
          files.map((file, i) => {
            const fileName = file.name || file.fileName || 'Unknown File';
            const isSvr = file.isServer || file.serverFileName;
            const img = isImage(file);
            
            // Shorten filename for display (remove UUID prefixes)
            const parts = fileName ? fileName.split('_') : [];
            const displayFileName = parts.length > 1 ? parts[parts.length - 1] : fileName;
            
            return (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', p: 1, mb: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
                position: 'relative', overflow: 'hidden', transition: 'all 0.2s'
              }}>
                {isSvr && (
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: 'success.main' }} />
                )}
                
                {img ? (
                  <Box 
                    component="img" 
                    src={getFileUrl(file)} 
                    sx={{ width: 42, height: 42, borderRadius: 1, objectFit: 'cover', mr: 2, border: '1px solid', borderColor: 'divider' }} 
                  />
                ) : (
                  <Box sx={{ width: 42, height: 42, borderRadius: 1, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <IconFileDescription size={24} color={theme.palette.text.secondary} />
                  </Box>
                )}

                <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
                  <Tooltip title={fileName} arrow placement="top">
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'text.primary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        width: '100%'
                      }}
                    >
                      {displayFileName}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', opacity: 0.8, fontStyle: file.docDetails ? 'italic' : 'normal' }}>
                    {file.docDetails || (isSvr ? 'Saved on Server' : 'Local Upload')}
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <IconButton size="small" color="primary" onClick={() => handlePreview(file)} sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                    <IconEye size={16} />
                  </IconButton>
                  {isEditing && (
                    <IconButton size="small" color="error" onClick={() => onRemove(i)} sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                      <IconTrash size={16} />
                    </IconButton>
                  )}
                </Stack>
              </Box>
            );
          })
        )}
      </Box>

      {/* Shared Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{previewData.name}</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}><IconX size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', bgcolor: '#fafafa', p: 4, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <Typography variant="body2" color="text.secondary">Converting for preview...</Typography>
          ) : (
            <>
              {previewData.content ? (
                <Box 
                  dangerouslySetInnerHTML={{ __html: previewData.content }} 
                  sx={{ 
                    width: '100%', 
                    maxHeight: '70vh', 
                    overflow: 'auto', 
                    textAlign: 'left', 
                    bgcolor: 'white', 
                    p: 3, 
                    borderRadius: 1, 
                    boxShadow: 1,
                    '& table': { borderCollapse: 'collapse', width: '100%' },
                    '& th, & td': { border: '1px solid #ddd', p: 1 }
                  }} 
                />
              ) : previewData.url && (
                previewData.name.toLowerCase().endsWith('.pdf') ? (
                  <iframe title="PDF Preview" src={previewData.url} style={{ width: '100%', height: '70vh', border: 'none' }} />
                ) : (
                  <Box 
                    component="img" 
                    src={previewData.url} 
                    sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', objectFit: 'contain' }} 
                  />
                )
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button startIcon={<IconDownload size={18} />} onClick={() => window.open(previewData.url, '_blank')}>Download</Button>
          <Button variant="contained" onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

BOSFileGallery.propTypes = {
  files: PropTypes.array,
  onRemove: PropTypes.func,
  isEditing: PropTypes.bool,
  title: PropTypes.string,
  maxHeight: PropTypes.number
};
