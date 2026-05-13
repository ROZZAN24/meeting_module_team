import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Stack,
  IconButton,
  MenuItem
} from '@mui/material';
import { IconSearch, IconCheck } from '@tabler/icons-react';
import { BOSTextField, BOSFormDialog } from 'ui-component/bos';

const RM_DATA = [
  { id: 1, partNo: 'NT/NIL', partName: 'NIL' },
  { id: 2, partNo: 'NT/A20101/8R', partName: 'BRAKE PAD RAW MATERIAL WITH TEFLON WIRE' },
  { id: 3, partNo: 'NT/A21101/2R', partName: 'CASTING SG400/15 FOR A21101' },
  { id: 4, partNo: 'NT/A32101A/1R', partName: 'ROD STEEL MS DIA 35 X L 65 MM' },
  { id: 5, partNo: 'NT/A32101B/1R', partName: 'PROFILE CUTTING MS X THK 16 MM' },
  { id: 6, partNo: 'NT/A32101C/8R', partName: 'SHEET ASBESTOS 5 MM THK' },
  { id: 7, partNo: 'NT/A32201A/1R', partName: 'PROFILE CUTTING MS X THK 10 MM' },
  { id: 8, partNo: 'NT/A32201C/8R', partName: 'ASBESTOS LINER' },
  { id: 9, partNo: 'NT/A32302A/1R', partName: 'PLATE STEEL EN 32 A BRIGHT BAR THK 38 X W 60 X L 155 MM' },
  { id: 10, partNo: 'NT/A39201/2R', partName: 'CASTING SG700/2 FOR A39201' },
  { id: 11, partNo: 'NT/A39203A/1R', partName: 'ROD EN353 DIA 265 x L 55 MM' },
  { id: 12, partNo: 'NT/A39204/1R', partName: 'ROD STEEL 16MnCr5 DIA 80 X L 182 MM' },
  { id: 13, partNo: 'NT/A39205A/2R', partName: 'CASTING SG500/7 FOR A39205A' },
  { id: 14, partNo: 'NT/A39205A1-1/1R', partName: 'WASHER - MS -OD 130mm X TH 8mm ( IS 2062 )' },
  { id: 15, partNo: 'NT/A40101/6R', partName: 'BLOCK ALUMINIUM HE 30 SQ 110 X L 150 MM' },
  { id: 16, partNo: 'NT/A40103C/R', partName: 'ROD BRASS DIA 20 X L 8 MM' },
  { id: 17, partNo: 'NT/A40104B/6R', partName: 'BLOCK ALUMINIUM HE 30 THK 80 X W 85 X L 85 MM' },
  { id: 18, partNo: 'NT/A40104C/1R', partName: 'ROD STEEL MS BRIGHT DIA 70 X L 83 MM' },
  { id: 19, partNo: 'NT/A40104F/6R', partName: 'ROD ALUMINIUM HE 30 DIA 25 X L 14 MM' },
  { id: 20, partNo: 'NT/A40104G/6R', partName: 'ROD ALUMINIUM HE 30 DIA 20 X L 38 MM' }
];

const PRODUCT_DATA = [
  { id: 0, partNo: 'NIL', partName: 'NO PRODUCT / UNSELECT' },
  { id: 1, partNo: 'PRD/FIN/001', partName: 'FINISHED PRODUCT A' },
  { id: 2, partNo: 'PRD/FIN/002', partName: 'FINISHED PRODUCT B' },
  { id: 3, partNo: 'PRD/ASM/001', partName: 'ASSEMBLY UNIT 1' }
];

export default function MaterialSelectionDialog({ open, onClose, onSelect, type }) {
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('partName');

  const data = type === 'RM' ? RM_DATA : PRODUCT_DATA;

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item[searchBy]?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, searchBy]);

  const handleClear = () => {
    onSelect({ partNo: '', partName: '' });
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      onClear={handleClear}
      title={`Select ${type === 'RM' ? 'Raw Material' : 'Product'}`}
      maxWidth="md"
    >
      <Box sx={{ width: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
          <BOSTextField
            select
            label="Search By"
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            sx={{ width: 150 }}
            size="small"
          >
            <MenuItem value="partNo">Part No</MenuItem>
            <MenuItem value="partName">Part Name</MenuItem>
          </BOSTextField>
          <BOSTextField
            fullWidth
            placeholder="Search Here..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              )
            }}
          />
        </Stack>

        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 450, borderRadius: 2 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 900, width: 60, py: 1.5 }}>Sl No</TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 900, width: 180 }}>Part No</TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 900 }}>Part Name</TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 900, width: 80, textAlign: 'center' }}>Select</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No results found for "{search}"
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, idx) => (
                  <TableRow 
                    key={item.id} 
                    hover 
                    onDoubleClick={() => onSelect(item)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'primary.lighter !important' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>{item.partNo}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{item.partName}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => onSelect(item)}
                        sx={{ bgcolor: 'primary.lighter', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                      >
                        <IconCheck size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2, textAlign: 'right' }}>
           <Typography variant="caption" color="text.secondary" fontWeight={800}>
              Showing {filteredData.length} records • Double-click row to select
           </Typography>
        </Box>
      </Box>
    </BOSFormDialog>
  );
}
