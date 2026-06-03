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
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { IconX, IconGripVertical, IconSearch, IconChevronRight, IconChevronLeft } from '@tabler/icons-react';

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
function DraggableItem({ item, index, selected, onToggle }) {
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
          onClick={() => onToggle && onToggle(item.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            mb: 1.5,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: snapshot.isDragging 
              ? theme.palette.primary.main 
              : (selected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.6)),
            bgcolor: snapshot.isDragging
              ? alpha(theme.palette.primary.main, 0.12)
              : selected ? alpha(theme.palette.primary.main, 0.06) : theme.palette.background.paper,
            cursor: 'pointer',
            userSelect: 'none',
            boxShadow: selected ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}` : `0 2px 6px ${alpha(theme.palette.common.black, 0.03)}`,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
            '&:hover': {
              borderColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.4),
              bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.02),
              transform: snapshot.isDragging ? 'scale(1.02)' : 'translateY(-2px)',
              boxShadow: selected ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.2)}` : `0 4px 12px ${alpha(theme.palette.common.black, 0.06)}`
            }
          }}
        >
          <IconGripVertical size={18} color={theme.palette.text.disabled} />
          {onToggle && (
            <Checkbox 
              checked={selected || false} 
              onChange={() => onToggle(item.id)} 
              onClick={(e) => e.stopPropagation()} 
              size="small" 
              sx={{ p: 0 }} 
            />
          )}
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
  index: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  onToggle: PropTypes.func
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
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedSpeedDial, setSelectedSpeedDial] = useState([]);

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
    setSelectedAvailable([]);
    setSelectedSpeedDial([]);
  }, [open, moduleGroup, currentSpeedDialIds]);

  const handleToggleAvailable = (id) => {
    setSelectedAvailable(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (speedDialItems.length + prev.length >= 6) {
          alert("You can only have a maximum of 6 items in the Speed Dial.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleToggleSpeedDial = (id) => {
    setSelectedSpeedDial(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleMoveToSpeedDial = () => {
    const itemsToMove = availableItems.filter(item => selectedAvailable.includes(item.id));
    if (speedDialItems.length + itemsToMove.length > 6) {
      alert(`You can only add up to 6 items to the Speed Dial. (Currently: ${speedDialItems.length}, Selected: ${itemsToMove.length})`);
      return;
    }
    setSpeedDialItems(prev => [...prev, ...itemsToMove]);
    setAvailableItems(prev => prev.filter(item => !selectedAvailable.includes(item.id)));
    setSelectedAvailable([]);
  };

  const handleMoveToAvailable = () => {
    const itemsToMove = speedDialItems.filter(item => selectedSpeedDial.includes(item.id));
    setAvailableItems(prev => [...prev, ...itemsToMove]);
    setSpeedDialItems(prev => prev.filter(item => !selectedSpeedDial.includes(item.id)));
    setSelectedSpeedDial([]);
  };

  const handleSelectAllAvailable = (e) => {
    if (e.target.checked) {
      const remainingSlots = 6 - speedDialItems.length;
      if (remainingSlots <= 0) {
        alert("Speed Dial is already full (maximum 6 items).");
        return;
      }
      const itemsToSelect = filteredAvailable.map(item => item.id);
      if (itemsToSelect.length > remainingSlots) {
        alert(`You can only select up to ${remainingSlots} more items.`);
        setSelectedAvailable(itemsToSelect.slice(0, remainingSlots));
      } else {
        setSelectedAvailable(itemsToSelect);
      }
    } else {
      setSelectedAvailable([]);
    }
  };

  const handleSelectAllSpeedDial = (e) => {
    if (e.target.checked) {
      setSelectedSpeedDial(filteredSpeedDial.map(item => item.id));
    } else {
      setSelectedSpeedDial([]);
    }
  };

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
      if (destination.droppableId === 'speedDial' && speedDialItems.length >= 6) {
        alert("You can only add up to 6 items to the Speed Dial.");
        return;
      }

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
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        pb: 2,
        pt: 3,
        px: 4,
        background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.04)}, transparent)`
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: theme.palette.text.primary }}>
            Customize Speed Dial
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            {moduleGroup.title} — drag items to rearrange or use checkboxes to move multiple
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            bgcolor: alpha(theme.palette.text.secondary, 0.05),
            '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1), transform: 'rotate(90deg)' },
            transition: 'all 0.3s'
          }}
        >
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{ display: 'flex', gap: 3, height: 420 }}>

            {/* ── Available ── */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Checkbox 
                  size="small" 
                  checked={filteredAvailable.length > 0 && selectedAvailable.length === filteredAvailable.length}
                  indeterminate={selectedAvailable.length > 0 && selectedAvailable.length < filteredAvailable.length}
                  onChange={handleSelectAllAvailable}
                  sx={{ p: 0.5, mr: 1 }}
                />
                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1 }}>
                  Available Menus ({filteredAvailable.length})
                  {selectedAvailable.length > 0 && <span style={{ color: theme.palette.primary.main, textTransform: 'none', fontWeight: 600 }}> • {selectedAvailable.length} selected</span>}
                </Typography>
              </Box>
              <Droppable droppableId="available">
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      p: 2,
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: snapshot.isDraggingOver
                        ? theme.palette.primary.main
                        : alpha(theme.palette.divider, 0.6),
                      bgcolor: snapshot.isDraggingOver
                        ? alpha(theme.palette.primary.main, 0.04)
                        : theme.palette.background.paper,
                      boxShadow: `inset 0 2px 20px 0 ${alpha(theme.palette.common.black, 0.02)}`,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
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
                        <DraggableItem 
                          key={item.id} 
                          item={item} 
                          index={index} 
                          selected={selectedAvailable.includes(item.id)} 
                          onToggle={handleToggleAvailable} 
                        />
                      ))}
                      {provided.placeholder}
                    </Box>
                  </Box>
                )}
              </Droppable>
            </Box>

            {/* ── Transfer Buttons ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2.5, pt: 6 }}>
              <Tooltip title="Add Selected" placement="top">
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMoveToSpeedDial}
                    disabled={selectedAvailable.length === 0 || speedDialItems.length + selectedAvailable.length > 6}
                    sx={{ 
                      minWidth: 48, 
                      width: 48,
                      height: 48, 
                      p: 0, 
                      borderRadius: '50%', 
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.05)', boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}` }
                    }}
                  >
                    <IconChevronRight size={24} stroke={2.5} />
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Remove Selected" placement="bottom">
                <span>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleMoveToAvailable}
                    disabled={selectedSpeedDial.length === 0}
                    sx={{ 
                      minWidth: 48, 
                      width: 48,
                      height: 48, 
                      p: 0, 
                      borderRadius: '50%',
                      borderWidth: '2px',
                      bgcolor: theme.palette.background.paper,
                      transition: 'all 0.2s',
                      '&:hover': { borderWidth: '2px', transform: 'scale(1.05)', bgcolor: alpha(theme.palette.primary.main, 0.04) }
                    }}
                  >
                    <IconChevronLeft size={24} stroke={2.5} />
                  </Button>
                </span>
              </Tooltip>
            </Box>

            {/* ── Speed Dial ── */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Checkbox 
                  size="small" 
                  checked={filteredSpeedDial.length > 0 && selectedSpeedDial.length === filteredSpeedDial.length}
                  indeterminate={selectedSpeedDial.length > 0 && selectedSpeedDial.length < filteredSpeedDial.length}
                  onChange={handleSelectAllSpeedDial}
                  sx={{ p: 0.5, mr: 1 }}
                />
                <Typography variant="overline" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
                  Speed Dial ({filteredSpeedDial.length}/6)
                  {selectedSpeedDial.length > 0 && <span style={{ textTransform: 'none', fontWeight: 600 }}> • {selectedSpeedDial.length} selected</span>}
                </Typography>
              </Box>
              <Droppable droppableId="speedDial">
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      p: 2,
                      borderRadius: '16px',
                      border: '2px solid',
                      borderColor: snapshot.isDraggingOver
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.2),
                      bgcolor: snapshot.isDraggingOver
                        ? alpha(theme.palette.primary.main, 0.04)
                        : alpha(theme.palette.primary.main, 0.015),
                      boxShadow: `inset 0 2px 20px 0 ${alpha(theme.palette.primary.main, 0.03)}`,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
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
                        <DraggableItem 
                          key={item.id} 
                          item={item} 
                          index={index}
                          selected={selectedSpeedDial.includes(item.id)}
                          onToggle={handleToggleSpeedDial} 
                        />
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

      <DialogActions sx={{ px: 4, py: 2.5, gap: 1.5, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="inherit" 
          sx={{ borderRadius: '10px', px: 3, fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          sx={{ 
            borderRadius: '10px', 
            px: 4,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.35)}`,
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.5)}`,
              transform: 'translateY(-1px)'
            }
          }}
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
