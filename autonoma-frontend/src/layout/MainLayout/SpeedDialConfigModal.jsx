import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { alpha, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { IconX, IconGripVertical, IconSearch } from '@tabler/icons-react';

// ──────────────────────────────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────────────────────────────
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const moveBetween = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);
  return {
    [droppableSource.droppableId]: sourceClone,
    [droppableDestination.droppableId]: destClone
  };
};

// ──────────────────────────────────────────────────────────────────────
// DraggableItem — MUST be top-level, not nested inside another component
// ──────────────────────────────────────────────────────────────────────
function DraggableItem({ item, index }) {
  const theme = useTheme();
  const Icon = item.icon;
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          elevation={snapshot.isDragging ? 4 : 0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            mb: 1,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: snapshot.isDragging ? theme.palette.primary.main : theme.palette.divider,
            bgcolor: snapshot.isDragging
              ? alpha(theme.palette.primary.main, 0.06)
              : theme.palette.background.paper,
            cursor: 'grab',
            userSelect: 'none',
            transition: 'border-color 0.15s, background-color 0.15s',
            '&:hover': {
              borderColor: alpha(theme.palette.primary.main, 0.4),
              bgcolor: alpha(theme.palette.primary.main, 0.03)
            }
          }}
        >
          <IconGripVertical size={18} color={theme.palette.text.disabled} />
          {Icon && <Icon size={20} stroke={1.5} color={theme.palette.text.secondary} />}
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', flexGrow: 1 }}>
            {item.title}
          </Typography>
        </Paper>
      )}
    </Draggable>
  );
}

DraggableItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
};

// ──────────────────────────────────────────────────────────────────────
// SpeedDialConfigModal
// ──────────────────────────────────────────────────────────────────────
export default function SpeedDialConfigModal({ open, onClose, moduleGroup, currentSpeedDialIds, onSave }) {
  const theme = useTheme();
  const [availableItems, setAvailableItems] = useState([]);
  const [speedDialItems, setSpeedDialItems] = useState([]);
  const [availableFilter, setAvailableFilter] = useState('');
  const [speedDialFilter, setSpeedDialFilter] = useState('');

  const filteredAvailable = availableItems.filter(item => item.title.toLowerCase().includes(availableFilter.toLowerCase()));
  const filteredSpeedDial = speedDialItems.filter(item => item.title.toLowerCase().includes(speedDialFilter.toLowerCase()));

  useEffect(() => {
    if (!open || !moduleGroup) return;

    const allChildren = moduleGroup.allLeafItems || moduleGroup.children || [];
    const selectedSet = new Set(currentSpeedDialIds);

    // Preserve order of currentSpeedDialIds in the speed-dial column
    const selectedMap = new Map(allChildren.map((c) => [c.id, c]));
    const speedDial = currentSpeedDialIds.map((id) => selectedMap.get(id)).filter(Boolean);
    const available = allChildren.filter((c) => !selectedSet.has(c.id));

    setSpeedDialItems(speedDial);
    setAvailableItems(available);
  }, [open, moduleGroup, currentSpeedDialIds]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceListFiltered = source.droppableId === 'speedDial' ? filteredSpeedDial : filteredAvailable;
    const destListFiltered = destination.droppableId === 'speedDial' ? filteredSpeedDial : filteredAvailable;

    const sourceList = source.droppableId === 'speedDial' ? speedDialItems : availableItems;
    const destList = destination.droppableId === 'speedDial' ? speedDialItems : availableItems;

    const draggedItem = sourceListFiltered[source.index];
    if (!draggedItem) return;

    const originalSourceIndex = sourceList.findIndex(item => item.id === draggedItem.id);

    if (source.droppableId === destination.droppableId) {
      const newSourceList = Array.from(sourceList);
      newSourceList.splice(originalSourceIndex, 1);
      
      let originalDestIndex = newSourceList.length;
      if (destination.index < destListFiltered.length) {
        const targetItem = destListFiltered[destination.index];
        originalDestIndex = newSourceList.findIndex(item => item.id === targetItem.id);
        if (originalDestIndex === -1) originalDestIndex = newSourceList.length;
      }
      
      newSourceList.splice(originalDestIndex, 0, draggedItem);
      source.droppableId === 'speedDial' ? setSpeedDialItems(newSourceList) : setAvailableItems(newSourceList);
    } else {
      let originalDestIndex = destList.length;
      if (destination.index < destListFiltered.length) {
        const targetItem = destListFiltered[destination.index];
        originalDestIndex = destList.findIndex(item => item.id === targetItem.id);
        if (originalDestIndex === -1) originalDestIndex = destList.length;
      }

      const newSourceList = Array.from(sourceList);
      newSourceList.splice(originalSourceIndex, 1);

      const newDestList = Array.from(destList);
      newDestList.splice(originalDestIndex, 0, draggedItem);

      if (source.droppableId === 'speedDial') {
        setSpeedDialItems(newSourceList);
        setAvailableItems(newDestList);
      } else {
        setAvailableItems(newSourceList);
        setSpeedDialItems(newDestList);
      }
    }
  };

  const handleSave = () => {
    onSave(moduleGroup.id, speedDialItems.map((i) => i.id));
    onClose();
  };

  if (!moduleGroup) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '14px', overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Customize Speed Dial
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {moduleGroup.title} — drag items to rearrange or move between lists
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.08) }
          }}
        >
          <IconX size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{ display: 'flex', gap: 3, height: 380 }}>

            {/* ── Available ── */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="overline" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary', letterSpacing: 1 }}>
                Available Menus ({filteredAvailable.length})
              </Typography>
              <Droppable droppableId="available">
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      p: 1.5,
                      borderRadius: '10px',
                      border: '1.5px dashed',
                      borderColor: snapshot.isDraggingOver
                        ? theme.palette.primary.main
                        : theme.palette.divider,
                      bgcolor: snapshot.isDraggingOver
                        ? alpha(theme.palette.primary.main, 0.04)
                        : 'background.default',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s, background-color 0.2s'
                    }}
                  >
                    <OutlinedInput
                      fullWidth
                      size="small"
                      placeholder="Filter..."
                      value={availableFilter}
                      onChange={(e) => setAvailableFilter(e.target.value)}
                      startAdornment={<InputAdornment position="start"><IconSearch size={16} /></InputAdornment>}
                      sx={{ 
                        mb: 2, 
                        flexShrink: 0,
                        borderRadius: '8px', 
                        bgcolor: theme.palette.background.paper,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.divider, 0.5)
                        }
                      }}
                    />
                    <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, px: 0.5, mx: -0.5 }}>
                      {availableItems.length === 0 && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: 'block', textAlign: 'center', mt: 4 }}
                        >
                          All menus are in Speed Dial
                        </Typography>
                      )}
                      {filteredAvailable.map((item, index) => (
                        <DraggableItem key={item.id} item={item} index={index} />
                      ))}
                      {provided.placeholder}
                    </Box>
                  </Box>
                )}
              </Droppable>
            </Box>

            {/* ── Speed Dial ── */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="overline" sx={{ mb: 1, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
                Speed Dial ({filteredSpeedDial.length})
              </Typography>
              <Droppable droppableId="speedDial">
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      p: 1.5,
                      borderRadius: '10px',
                      border: '2px dashed',
                      borderColor: snapshot.isDraggingOver
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.35),
                      bgcolor: snapshot.isDraggingOver
                        ? alpha(theme.palette.primary.main, 0.04)
                        : alpha(theme.palette.primary.main, 0.02),
                      overflow: 'hidden',
                      transition: 'border-color 0.2s, background-color 0.2s'
                    }}
                  >
                    <OutlinedInput
                      fullWidth
                      size="small"
                      placeholder="Filter..."
                      value={speedDialFilter}
                      onChange={(e) => setSpeedDialFilter(e.target.value)}
                      startAdornment={<InputAdornment position="start"><IconSearch size={16} /></InputAdornment>}
                      sx={{ 
                        mb: 2, 
                        flexShrink: 0,
                        borderRadius: '8px', 
                        bgcolor: theme.palette.background.paper,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, 0.2)
                        }
                      }}
                    />
                    <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, px: 0.5, mx: -0.5 }}>
                      {speedDialItems.length === 0 && !snapshot.isDraggingOver && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: 'block', textAlign: 'center', mt: 4 }}
                        >
                          Drag items here to add to speed dial
                        </Typography>
                      )}
                      {filteredSpeedDial.map((item, index) => (
                        <DraggableItem key={item.id} item={item} index={index} />
                      ))}
                      {provided.placeholder}
                    </Box>
                  </Box>
                )}
              </Droppable>
            </Box>
          </Box>
        </DragDropContext>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: '8px' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          sx={{ borderRadius: '8px', px: 3, boxShadow: 'none' }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SpeedDialConfigModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  moduleGroup: PropTypes.object,
  currentSpeedDialIds: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired
};
