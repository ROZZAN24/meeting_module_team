import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  IconCloudUpload,
  IconFileDescription,
  IconTrash,
  IconEye,
  IconPhoto,
  IconFile,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconFileText
} from '@tabler/icons-react';
import { autoUploadFiles, getFileViewUrl } from 'utils/upload-helper';
import BOSFilePreview from './BOSFilePreview';

/**
 * ═══════════════════════════════════════════════════════════════
 * BOSFileUpload — BOS Standard File Upload Component
 * ═══════════════════════════════════════════════════════════════
 * 
 * Unified file upload with:
 *  ✓ Single & multiple file support
 *  ✓ Drag & drop zone
 *  ✓ Auto-upload to server via FileService
 *  ✓ Eye icon preview for all document types
 *  ✓ File type icons (PDF, Image, Excel, Doc, etc.)
 *  ✓ Delete/remove capability
 *  ✓ Module auto-detection (syncs with BosDocConstants)
 *
 * Usage:
 *   import { BOSFileUpload } from 'ui-component/bos';
 *
 *   <BOSFileUpload
 *     files={form.attachments}
 *     onChange={(files) => setForm({ ...form, attachments: files })}
 *     module="QMS_CHECKLIST"         // maps to BOS_DOCUMENTS/QMS/Checklist
 *     multiple={true}
 *     accept="image/*,.pdf,.docx,.xlsx"
 *     maxFiles={10}
 *     disabled={isReadOnly}
 *   />
 */

// ── File Type Icon Resolver ──────────────────────────────────
const getFileIcon = (fileName) => {
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return IconPhoto;
  if (['pdf'].includes(ext)) return IconFileTypePdf;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return IconFileSpreadsheet;
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return IconFileText;
  return IconFile;
};

// ── File Size Formatter ──────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Display Name (strip UUID & Truncate Middle) ─────────────────────────
const getDisplayName = (name, maxLength = 25) => {
  if (!name) return 'Unknown File';
  let cleanName = name;
  const parts = name.split('_');
  // UUID is 36 chars — if first segment looks like UUID, skip it
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

export default function BOSFileUpload({
  files = [],
  onChange,
  module,
  multiple = true,
  accept = '*',
  maxFiles = 20,
  maxSizeMB = 25,
  disabled = false,
  compact = false,
  label = 'Upload Files',
  helperText = ''
}) {
  const theme = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // ── Drag & Drop Handlers ──
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  }, [disabled]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [disabled, files, multiple, maxFiles]);

  // ── Process & Upload Files ──
  const processFiles = async (newFiles) => {
    if (!newFiles.length) return;
    
    // Enforce limits
    const remainingSlots = maxFiles - files.length;
    const filesToUpload = multiple ? newFiles.slice(0, remainingSlots) : [newFiles[0]];

    // Validate file sizes
    const oversized = filesToUpload.filter(f => f.size > maxSizeMB * 1024 * 1024);
    if (oversized.length) {
      console.warn(`[BOSFileUpload] ${oversized.length} file(s) exceed ${maxSizeMB}MB limit`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploaded = await autoUploadFiles(filesToUpload, module, (progress) => {
        setUploadProgress(progress);
      });

      const newEntries = uploaded.map((serverPath, i) => ({
        id: `${Date.now()}_${i}`,
        fileName: filesToUpload[i].name,
        serverFileName: serverPath,
        fileSize: filesToUpload[i].size,
        fileType: filesToUpload[i].type,
        isServer: true,
        uploadedAt: new Date().toISOString()
      }));

      if (multiple) {
        onChange([...files, ...newEntries]);
      } else {
        onChange(newEntries);
      }
    } catch (error) {
      console.error('[BOSFileUpload] Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ── File Input Handler ──
  const handleInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
    e.target.value = ''; // reset input
  };

  // ── Remove File ──
  const handleRemove = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  // ── Preview File ──
  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const fileCount = files.length;
  const atLimit = fileCount >= maxFiles;

  return (
    <Box>
      {/* ── Drop Zone ── */}
      {!disabled && !atLimit && (
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          component="label"
          sx={{
            display: 'flex',
            flexDirection: compact ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: compact ? 1.5 : 1,
            p: compact ? 1.5 : 3,
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'divider',
            borderRadius: 2.5,
            bgcolor: dragActive 
              ? alpha(theme.palette.primary.main, 0.04)
              : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            '&:hover': {
              borderColor: 'primary.light',
              bgcolor: alpha(theme.palette.primary.main, 0.02)
            }
          }}
        >
          <input
            type="file"
            hidden
            multiple={multiple}
            accept={accept}
            onChange={handleInputChange}
          />
          <Box sx={{
            p: compact ? 0.8 : 1.5,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            display: 'flex'
          }}>
            <IconCloudUpload 
              size={compact ? 20 : 32} 
              color={theme.palette.primary.main} 
              stroke={1.5} 
            />
          </Box>
          <Box sx={{ textAlign: compact ? 'left' : 'center' }}>
            <Typography variant={compact ? 'body2' : 'subtitle2'} fontWeight={600} color="text.primary">
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {helperText || `Drag & drop or click • ${multiple ? `Up to ${maxFiles} files` : 'Single file'} • Max ${maxSizeMB}MB each`}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Upload Progress ── */}
      {uploading && (
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': { borderRadius: 3 }
            }} 
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}

      {/* ── File List ── */}
      {fileCount > 0 && (
        <Stack spacing={0.75} sx={{ mt: 1.5 }}>
          {files.map((file, i) => {
            const name = file.fileName || file.name || 'Unknown';
            const displayName = getDisplayName(name);
            const FileIcon = getFileIcon(name);
            const isOnServer = file.isServer || file.serverFileName;

            return (
              <Box 
                key={file.id || i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    borderColor: 'primary.light',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`
                  }
                }}
              >
                {/* Server indicator bar */}
                {isOnServer && (
                  <Box sx={{ 
                    position: 'absolute', top: 0, left: 0, 
                    width: 3, height: '100%', 
                    bgcolor: 'success.main' 
                  }} />
                )}

                {/* File Icon */}
                <Box sx={{
                  width: 38, height: 38, borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileIcon size={20} color={theme.palette.primary.main} />
                </Box>

                {/* File Info */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Tooltip title={name} arrow placement="top">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        color: 'text.primary'
                      }}
                    >
                      {displayName}
                    </Typography>
                  </Tooltip>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {file.fileSize && (
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.fileSize)}
                      </Typography>
                    )}
                    {isOnServer && (
                      <Chip 
                        label="Saved" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }} 
                      />
                    )}
                  </Stack>
                </Box>

                {/* Actions */}
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <Tooltip title="Preview" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(file)}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                      }}
                    >
                      <IconEye size={16} />
                    </IconButton>
                  </Tooltip>
                  {!disabled && (
                    <Tooltip title="Remove" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(i)}
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.08),
                          color: 'error.main',
                          '&:hover': { bgcolor: 'error.main', color: 'white' }
                        }}
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* ── Count Badge ── */}
      {multiple && fileCount > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {fileCount} of {maxFiles} file{maxFiles > 1 ? 's' : ''} uploaded
        </Typography>
      )}

      {/* ── Universal Preview Dialog ── */}
      <BOSFilePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={previewFile}
        allFiles={files}
        onNavigate={(newFile) => setPreviewFile(newFile)}
      />
    </Box>
  );
}

BOSFileUpload.propTypes = {
  files: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  module: PropTypes.string,
  multiple: PropTypes.bool,
  accept: PropTypes.string,
  maxFiles: PropTypes.number,
  maxSizeMB: PropTypes.number,
  disabled: PropTypes.bool,
  compact: PropTypes.bool,
  label: PropTypes.string,
  helperText: PropTypes.string
};
