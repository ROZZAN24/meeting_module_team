import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Select,
  Stack
} from '@mui/material';
import { IconX, IconMailForward } from '@tabler/icons-react';
import { getDialogStyles, btnCancel, btnEdit } from 'ui-component/bos/BOSStyles';
import { useColorScheme } from '@mui/material/styles';
import { useTheme } from '@mui/material';

export default function ForwardMailDialog({ open, handleClose }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ds = getDialogStyles(theme, isDark);
  
  const [to, setTo] = useState('-Select-');
  const [cc, setCc] = useState('');
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: ds.paper }}>
      <DialogTitle sx={ds.titleBar} component="div">
        <Typography variant="h5" component="span" sx={ds.titleText}>Send Mail</Typography>
        <IconButton onClick={handleClose} size="small" sx={ds.closeBtn}>
          <IconX size={24} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4, pt: 3 }}>
        <Box sx={{ 
          border: '2px solid #3f51b5', 
          p: 3, 
          mb: 3, 
          borderRadius: '8px'
        }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ minWidth: 60, fontWeight: 600, color: '#3f51b5' }}>To</Typography>
              <Select
                size="small"
                fullWidth
                value={to}
                onChange={(e) => setTo(e.target.value)}
                sx={{ borderRadius: '4px' }}
              >
                <MenuItem value="-Select-">-Select-</MenuItem>
                <MenuItem value="sales@nutechwindparts.com">Sales Team</MenuItem>
                <MenuItem value="support@nutechwindparts.com">Support Team</MenuItem>
                <MenuItem value="admin@nutechwindparts.com">Admin Team</MenuItem>
              </Select>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ minWidth: 60, fontWeight: 600, color: '#3f51b5' }}>CC</Typography>
              <TextField
                size="small"
                fullWidth
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
              />
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleClose} 
            sx={{ ...btnCancel, bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' }, borderRadius: '4px', px: 3 }} 
            startIcon={<IconX size={18} />}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            sx={{ ...btnEdit(theme), bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' }, borderRadius: '4px', px: 3 }} 
            startIcon={<IconMailForward size={18} />}
          >
            Forward To
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
