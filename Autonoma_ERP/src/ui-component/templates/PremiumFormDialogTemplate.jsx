import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Slide,
  useTheme,
  Stack
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  IconX,
  IconEdit,
  IconSettings,
  IconListDetails,
  IconTrash,
  IconEraser,
  IconCloudUpload,
  IconCamera,
  IconFileDescription
} from '@tabler/icons-react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PremiumFormDialogTemplate({ open, handleClose, initialData, readOnly = false }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // State variables for generic fields
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [field1, setField1] = useState(initialData?.field1 || '');
  const [dropdown1, setDropdown1] = useState(initialData?.dropdown1 || 'OPTION 1');

  // Exact darkStyles from the standardized template
  const darkStyles = {
    dialog: {
      bgcolor: isDark ? '#161b22' : theme.palette.background.paper,
      color: isDark ? '#c9d1d9' : theme.palette.text.primary
    },
    input: {
      width: '100% !important',
      '& .MuiOutlinedInput-root': {
        width: '100%',
        bgcolor: isDark ? 'background.default' : 'grey.50',
        color: 'text.primary',
        '& fieldset': { borderColor: 'divider' },
        '&:hover fieldset': { borderColor: isDark ? '#8b949e' : theme.palette.primary.main },
        '&.Mui-focused fieldset': { borderColor: isDark ? '#58a6ff' : theme.palette.primary.main },
        '& input': { py: 1.2, fontSize: '0.9rem' },
        '& .MuiSelect-select': { py: 1.2, fontSize: '0.9rem', width: '100%', minWidth: '150px' }
      },
      '& .MuiInputLabel-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
      '& .MuiSvgIcon-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
      '& .MuiFormLabel-asterisk': { color: '#ef4444' }
    },
    btnSave: {
      bgcolor: 'success.main',
      color: '#fff',
      '&:hover': { bgcolor: 'success.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
    },
    btnClear: {
      bgcolor: 'secondary.main',
      color: '#fff',
      '&:hover': { bgcolor: 'secondary.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s'
    },
    btnInactive: {
      bgcolor: 'error.main',
      color: '#fff',
      '&:hover': { bgcolor: 'error.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
    },
    btnUpload: {
      bgcolor: isDark ? '#7c4dff' : theme.palette.primary.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#651fff' : theme.palette.primary.dark },
      borderRadius: '8px',
      textTransform: 'none',
      fontSize: '0.85rem'
    },
    btnScan: {
      bgcolor: isDark ? '#238af2' : theme.palette.primary.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#1a76d2' : theme.palette.primary.dark },
      borderRadius: '8px',
      textTransform: 'none',
      fontSize: '0.85rem'
    }
  };

  const handleClear = () => {
    setField1('');
    setDropdown1('OPTION 1');
  };

  const handleSave = () => {
    // Save logic
    handleClose();
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }
        }
      }}
      PaperProps={{
        sx: {
          height: 'auto',
          maxHeight: '95vh',
          bgcolor: darkStyles.dialog.bgcolor,
          backgroundImage: 'none',
          borderRadius: '24px',
          border: isDark ? '1px solid #30363d' : 'none',
          boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.5)' : '0 24px 48px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: isDark ? 'background.default' : 'primary.light',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2.5,
          px: 4
        }}
      >
        <Typography variant="h5" component="span" sx={{ fontWeight: 600, color: isDark ? '#58a6ff' : theme.palette.primary.main, fontSize: '1.25rem' }}>
          Standard Master Title
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: isDark ? '#8b949e' : theme.palette.text.secondary }}>
          <IconX size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 5, bgcolor: darkStyles.dialog.bgcolor, width: '100%', overflowX: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4, width: '100%', alignItems: 'start' }}>
          
          {/* ── LEFT COLUMN: Form Sections ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Section 1 */}
            <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconSettings size={20} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Section 1</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Stack spacing={2.5} sx={{ width: '100%' }}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    required
                    error={!field1}
                    helperText={!field1 ? 'Please fill this' : ''}
                    label="Generic Input 1" 
                    value={field1} 
                    onChange={(e) => setField1(e.target.value)} 
                    sx={darkStyles.input} 
                    InputProps={{ readOnly: !isEditing }} 
                  />
                  <TextField select fullWidth size="small" label="Generic Dropdown" value={dropdown1} onChange={(e) => setDropdown1(e.target.value)} sx={darkStyles.input} disabled={!isEditing}>
                    <MenuItem value="OPTION 1">OPTION 1</MenuItem>
                    <MenuItem value="OPTION 2">OPTION 2</MenuItem>
                  </TextField>
                </Stack>
              </Box>
            </Box>

            {/* Section 2 */}
            <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconListDetails size={20} color={theme.palette.warning.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Section 2</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Stack spacing={2.5} sx={{ width: '100%' }}>
                  <TextField fullWidth size="small" label="Generic Input 2" sx={darkStyles.input} InputProps={{ readOnly: !isEditing }} />
                </Stack>
              </Box>
            </Box>

          </Box>

          {/* ── RIGHT COLUMN: Attachments & Scanning ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            
            {/* Uploaded Files Template */}
            <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconCloudUpload size={20} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Attachments</Typography>
              </Box>
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, bgcolor: isDark ? 'transparent' : 'grey.50' }}>
                <Box sx={{ mb: 2 }}>
                  <Button component="label" variant="contained" sx={darkStyles.btnUpload} startIcon={<IconCloudUpload size={20} />}>
                    Browse Files
                    <input type="file" multiple hidden />
                  </Button>
                </Box>
                <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                  <IconFileDescription size={52} stroke={1} />
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>No file uploaded yet</Typography>
                  <Typography variant="caption">Upload files using the button above</Typography>
                </Box>
              </Box>
            </Box>

            {/* Scanned Files Template */}
            <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconCamera size={20} color={theme.palette.secondary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Scan Documents</Typography>
              </Box>
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, bgcolor: isDark ? 'transparent' : 'grey.50' }}>
                <Box sx={{ mb: 2 }}>
                  <Button component="label" variant="contained" sx={darkStyles.btnScan} startIcon={<IconCamera size={20} />}>
                    Scan & Upload
                    <input type="file" accept="image/*" capture="environment" hidden />
                  </Button>
                </Box>
                <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                  <IconFileDescription size={52} stroke={1} />
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>No file scanned yet</Typography>
                  <Typography variant="caption">Scan documents using the camera</Typography>
                </Box>
              </Box>
            </Box>

          </Box>
        </Box>
      </DialogContent>

      <Box sx={{ p: 3, borderTop: isDark ? '1px solid #30363d' : `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: darkStyles.dialog.bgcolor }}>
        {!isEditing ? (
          <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
            <Button onClick={() => setIsEditing(true)} variant="contained" sx={{...darkStyles.btnSave, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }}} startIcon={<IconEdit size={20} />}>
              Edit
            </Button>
            <Button onClick={handleClose} variant="outlined" sx={{ ...darkStyles.btnInactive, color: isDark ? '#fff' : 'inherit' }} startIcon={<IconX size={20} />}>
              Close
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" sx={darkStyles.btnInactive} startIcon={<IconTrash size={20} />}>
                Delete
              </Button>
              <Button onClick={handleClear} variant="contained" sx={darkStyles.btnClear} startIcon={<IconEraser size={20} />}>
                Clear
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={handleSave} variant="contained" sx={darkStyles.btnSave} startIcon={<IconCheck size={20} />}>
                Save
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
}

PremiumFormDialogTemplate.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};
