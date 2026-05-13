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
import BOSFilePreview from './BOSFilePreview';

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

  const handlePreview = (file) => {
    setPreviewData(file);
    setPreviewOpen(true);
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
      <BOSFilePreview 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
        file={previewData}
        allFiles={files}
        onNavigate={(newFile) => setPreviewData(newFile)}
      />
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
