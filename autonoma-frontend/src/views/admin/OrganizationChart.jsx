import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Card, Avatar, Stack, CircularProgress, IconButton, Tooltip, 
  useTheme, Grid, Autocomplete, TextField, Popover, FormGroup, FormControlLabel, 
  Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { Tree, TreeNode } from 'react-organizational-chart';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { useLookups } from 'hooks/useLookups';
import MainCard from 'ui-component/cards/MainCard';
import { 
  IconSitemap, IconZoomIn, IconZoomOut, IconFocus2, IconSettings, 
  IconChevronDown, IconChevronUp, IconPlus, IconUserPlus, IconUserMinus, IconTrash 
} from '@tabler/icons-react';
import { getUserImageUrl } from 'utils/api-base';

// ─── Styled Node Component ──────────────────────────────────────────────────
const StyledNode = ({ position, isRoot, theme, fields, collapsedNodes, toggleCollapse, handleDragStart, handleDrop, handleDragOver, isDraggingTarget, onAddPosition, onAssignEmployee, onUnassignEmployee, onDeletePosition }) => {
  const hasChildren = position.children && position.children.length > 0;
  const isCollapsed = collapsedNodes.has(position.id);
  const isEmptySlot = !position.assignedEmployeeId && !position.isExited;
  const isExited = position.isExited;
  const isVacant = isEmptySlot || isExited;

  return (
    <Card
      draggable={!position.isCompanyNode}
      onDragStart={(e) => handleDragStart(e, position)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, position)}
      elevation={0}
      sx={{
        padding: 1.5,
        display: 'inline-block',
        border: isEmptySlot 
          ? `2px dashed ${theme.palette.text.disabled}` 
          : isExited ? `2px solid ${theme.palette.error.light}` 
          : `2px solid ${isDraggingTarget ? theme.palette.success.main : (isRoot ? theme.palette.primary.main : theme.palette.divider)}`,
        borderRadius: 2,
        backgroundColor: isDraggingTarget ? (theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.1)' : '#ECFDF5') : (theme.palette.mode === 'dark' ? (isExited ? '#331111' : '#1E293B') : (isEmptySlot ? '#f9f9f9' : isExited ? '#fff1f0' : '#fff')),
        boxShadow: isRoot ? `0 4px 14px ${theme.palette.primary.light}` : '0 2px 8px rgba(0,0,0,0.04)',
        minWidth: 160,
        maxWidth: 200,
        position: 'relative',
        transition: 'all 0.2s',
        opacity: isExited ? 0.7 : 1,
        cursor: position.isCompanyNode ? 'default' : 'grab',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          borderColor: isExited ? theme.palette.error.main : theme.palette.primary.light,
          opacity: 1
        },
        '&:hover .action-btn': {
          opacity: 1
        }
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 4, right: 4 }}>
        {!isVacant && !position.isCompanyNode && (
          <Tooltip title="Unassign Employee" placement="top">
            <IconButton
              className="action-btn"
              size="small"
              onClick={(e) => { e.stopPropagation(); onUnassignEmployee(position); }}
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                width: 24, height: 24,
                '&:hover': { bgcolor: 'warning.main', color: '#fff' }
              }}
            >
              <IconUserMinus size={14} />
            </IconButton>
          </Tooltip>
        )}
        {isVacant && !position.isCompanyNode && (
          <Tooltip title="Assign Employee" placement="top">
            <IconButton
              className="action-btn"
              size="small"
              onClick={(e) => { e.stopPropagation(); onAssignEmployee(position); }}
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                width: 24, height: 24,
                '&:hover': { bgcolor: 'secondary.main', color: '#fff' }
              }}
            >
              <IconUserPlus size={14} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Create Subordinate Position" placement="top">
          <IconButton
            className="action-btn"
            size="small"
            onClick={(e) => { e.stopPropagation(); onAddPosition(position); }}
            sx={{
              opacity: 0,
              transition: 'opacity 0.2s',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              width: 24, height: 24,
              '&:hover': { bgcolor: 'primary.main', color: '#fff' }
            }}
          >
            <IconPlus size={14} />
          </IconButton>
        </Tooltip>
        {!hasChildren && !position.isCompanyNode && (
          <Tooltip title="Delete Position" placement="top">
            <IconButton
              className="action-btn"
              size="small"
              onClick={(e) => { e.stopPropagation(); onDeletePosition(position); }}
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                width: 24, height: 24,
                '&:hover': { bgcolor: 'error.main', color: '#fff' }
              }}
            >
              <IconTrash size={14} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Stack alignItems="center" spacing={1} mt={isVacant ? 2 : 0}>
        {isEmptySlot && (
          <Chip label="VACANT" color="default" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
        )}
        {isExited && (
          <Chip label="EXITED / INACTIVE" color="error" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
        )}
        
        {fields.showPhoto && !isEmptySlot && (
          <Tooltip 
            title={
              <Box sx={{ p: 0.5, textAlign: 'center' }}>
                {position.photo ? (
                  <img src={getUserImageUrl(position.photo)} alt="Profile" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '4px', filter: isExited ? 'grayscale(100%)' : 'none' }} />
                ) : (
                  <Avatar sx={{ width: 100, height: 100, fontSize: '3rem', margin: '0 auto', bgcolor: isExited ? theme.palette.grey[500] : theme.palette.primary.main }}>
                    {position.firstName ? position.firstName[0].toUpperCase() : (position.employeeName ? position.employeeName[0].toUpperCase() : '?')}
                  </Avatar>
                )}
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 700, color: '#fff' }}>
                  {position.firstName || position.employeeName || ''}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {position.designationId || position.positionTitle || ''}
                </Typography>
              </Box>
            } 
            placement="top"
            arrow
            componentsProps={{
              tooltip: {
                sx: { bgcolor: 'rgba(0,0,0,0.85)', p: 1 }
              }
            }}
          >
            <Avatar
              src={position.photo ? getUserImageUrl(position.photo) : undefined}
              sx={{
                width: 48,
                height: 48,
                border: `2px solid ${isExited ? theme.palette.error.main : theme.palette.background.default}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                bgcolor: isExited ? 'error.main' : 'primary.main',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                filter: isExited ? 'grayscale(100%)' : 'none'
              }}
            >
              {position.firstName ? position.firstName[0].toUpperCase() : (position.employeeName ? position.employeeName[0].toUpperCase() : '?')}
            </Avatar>
          </Tooltip>
        )}
        
        <Box textAlign="center" width="100%">
          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2, mb: 0.5, wordWrap: 'break-word', color: isEmptySlot ? 'text.secondary' : isExited ? 'error.main' : 'text.primary', textDecoration: isExited ? 'line-through' : 'none' }}>
            {isEmptySlot ? position.positionTitle : `${position.firstName || ''} ${position.lastName || ''}`.trim() || position.employeeName || 'Unknown'}
          </Typography>
          
          {fields.showDesignation && !isEmptySlot && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.1 }}>
              {position.designationId || position.positionTitle || '-'}
            </Typography>
          )}
          
          {fields.showDepartment && position.departmentName && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.1, fontStyle: 'italic' }}>
              {position.departmentName}
            </Typography>
          )}
          
          {fields.showCode && !isEmptySlot && (
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isExited ? 'text.secondary' : 'primary.main', fontWeight: 600, mt: 0.5, display: 'block' }}>
              {position.empCode || '-'}
            </Typography>
          )}
        </Box>

        {hasChildren && (
          <IconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); toggleCollapse(position.id); }}
            sx={{ 
              position: 'absolute', bottom: -12, 
              bgcolor: 'background.paper', 
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': { bgcolor: 'action.hover' },
              width: 24, height: 24
            }}
          >
            {isCollapsed ? <IconChevronDown size={14} /> : <IconChevronUp size={14} />}
          </IconButton>
        )}
      </Stack>
    </Card>
  );
};


// ─── Main Component ────────────────────────────────────────────────────────
export default function OrganizationChart() {
  const theme = useTheme();

  // Data State
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]); // For assignment dropdown
  const [loading, setLoading] = useState(true);
  
  // View State
  const [zoom, setZoom] = useState(1);
  const [rootPositionId, setRootPositionId] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());
  
  // Field Toggles
  const [fields, setFields] = useState({
    showPhoto: true,
    showDesignation: true,
    showDepartment: false,
    showCode: true
  });

  const [anchorEl, setAnchorEl] = useState(null);

  // Drag and Drop
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOverNodeId, setDragOverNodeId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, source: null, target: null });

  // Add Position State
  const [addPosDialog, setAddPosDialog] = useState({ open: false, parentNode: null, positionTitle: '', departmentId: '' });
  
  // Assign Employee State
  const [assignDialog, setAssignDialog] = useState({ open: false, position: null, selectedEmployee: null });

  const { departments = [], designations = [], levels = [], designationLevels = [] } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'LEVELS', 'DESIGNATION_LEVELS']);
  
  const finalLevels = levels.length > 0 ? levels : designationLevels;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [posRes, empRes] = await Promise.all([
        axios.get('/api/master/hr/positions/tree'),
        axios.get(API_PATHS.HRM.EMPLOYEES)
      ]);
      
      if (Array.isArray(posRes.data)) setPositions(posRes.data);
      if (Array.isArray(empRes.data)) setEmployees(empRes.data);
    } catch (error) {
      console.error('Failed to fetch org chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to filter tree
  const filterTree = (nodes, deptId, rootId) => {
    if (!nodes) return [];
    
    // If root is selected, find it and return it as the only root
    if (rootId) {
      const findNode = (list) => {
        for (let n of list) {
          if (n.id === rootId) return n;
          if (n.children) {
            const found = findNode(n.children);
            if (found) return found;
          }
        }
        return null;
      };
      const foundRoot = findNode(nodes);
      return foundRoot ? [foundRoot] : [];
    }

    // Filter by department is complex on a tree, we'll just filter the roots for now
    // A robust department filter would require rebuilding the tree showing paths to matching nodes.
    // For simplicity, we apply it to roots or just return nodes.
    return nodes;
  };

  const treeData = useMemo(() => {
    if (!positions || positions.length === 0) return null;

    let roots = filterTree(positions, selectedDeptId, rootPositionId);
    
    if (roots.length === 0) return null;
    if (roots.length === 1) return roots[0];

    return {
      id: 'company-root',
      isCompanyNode: true,
      positionTitle: 'Company Hierarchy',
      firstName: 'Company',
      lastName: 'Hierarchy',
      assignedEmployeeId: 'ROOT', // not null, so it doesn't show as vacant
      children: roots
    };
  }, [positions, rootPositionId, selectedDeptId]);

  // Flatten tree for the autocomplete
  const flatPositions = useMemo(() => {
    const flat = [];
    const traverse = (nodes) => {
      nodes.forEach(n => {
        flat.push(n);
        if (n.children) traverse(n.children);
      });
    };
    traverse(positions);
    return flat;
  }, [positions]);

  const activeEmpList = useMemo(() => {
    const assignedIds = new Set();
    const extractAssigned = (nodes) => {
      nodes.forEach(n => {
        if (n.assignedEmployeeId) assignedIds.add(String(n.assignedEmployeeId));
        if (n.children) extractAssigned(n.children);
      });
    };
    extractAssigned(positions);

    return employees.filter(r => {
      const code = r.oldEmpCode || r.empCode || '';
      return !code.startsWith('ATS-') && 
             (r.status === 'Active' || !r.status) && 
             !r.exitDate &&
             !assignedIds.has(String(r.id));
    });
  }, [employees, positions]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.3));
  const handleResetZoom = () => setZoom(1);

  const toggleCollapse = (id) => {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleDragStart = (e, position) => {
    setDraggedNode(position);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetPosition) => {
    e.preventDefault();
    setDragOverNodeId(null);
    if (!draggedNode || targetPosition.id === draggedNode.id || targetPosition.isCompanyNode) return;
    
    setConfirmDialog({ open: true, source: draggedNode, target: targetPosition });
    setDraggedNode(null);
  };

  const confirmManagerChange = async () => {
    const { source, target } = confirmDialog;
    setConfirmDialog({ open: false, source: null, target: null });
    
    try {
      setLoading(true);
      await axios.put(`/api/master/hr/positions/${source.id}`, {
        parentPositionId: target.id
      });
      await fetchData(); 
    } catch (error) {
      console.error('Failed to update position hierarchy', error);
      alert('Failed to update structure.');
      setLoading(false);
    }
  };

  const handleOpenAddPosition = (parentNode) => {
    setAddPosDialog({ 
      open: true, 
      parentNode, 
      positionTitle: '', 
      departmentId: parentNode.departmentId || '' 
    });
  };

  const confirmAddPosition = async () => {
    const { parentNode, positionTitle, departmentId } = addPosDialog;
    if (!positionTitle) return;

    setAddPosDialog({ open: false, parentNode: null, positionTitle: '', departmentId: '' });
    
    try {
      setLoading(true);
      const parentId = parentNode.isCompanyNode ? null : parentNode.id;
      await axios.post('/api/master/hr/positions', {
        positionTitle,
        departmentId,
        parentPositionId: parentId,
        status: 'Active'
      });
      await fetchData(); 
    } catch (error) {
      console.error('Failed to create position', error);
      alert('Failed to create position.');
      setLoading(false);
    }
  };

  const confirmAssignEmployee = async () => {
    const { position, selectedEmployee } = assignDialog;
    if (!selectedEmployee) return;

    setAssignDialog({ open: false, position: null, selectedEmployee: null });
    
    try {
      setLoading(true);
      await axios.post('/api/master/hr/positions/assign', {
        positionId: position.id,
        employeeId: selectedEmployee.id
      });
      await fetchData(); 
    } catch (error) {
      console.error('Failed to assign employee', error);
      alert('Failed to assign employee.');
      setLoading(false);
    }
  };

  const handleUnassignEmployee = async (position) => {
    if (!window.confirm(`Are you sure you want to unassign the employee from ${position.positionTitle}?`)) return;
    try {
      setLoading(true);
      await axios.post('/api/master/hr/positions/unassign', { positionId: position.id });
      await fetchData();
    } catch (error) {
      console.error('Failed to unassign', error);
      alert('Failed to unassign employee.');
      setLoading(false);
    }
  };

  const handleDeletePosition = async (position) => {
    if (!window.confirm(`Are you sure you want to delete the position: ${position.positionTitle}?`)) return;
    try {
      setLoading(true);
      await axios.delete(`/api/master/hr/positions/${position.id}`);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete position', error);
      alert(error.response?.data || 'Failed to delete position.');
      setLoading(false);
    }
  };

  // ─── Render Helpers ──────────────────────────────────────────────────────
  const renderTreeNodes = (node) => {
    if (collapsedNodes.has(node.id)) return null;

    return node.children?.map(child => (
      <TreeNode 
        key={child.id} 
        label={
          <Box 
            onDragOver={(e) => {
              e.preventDefault();
              if (draggedNode && draggedNode.id !== child.id && !child.isCompanyNode) {
                setDragOverNodeId(child.id);
              }
            }}
            onDragLeave={() => setDragOverNodeId(null)}
          >
            <StyledNode 
              position={child} 
              theme={theme} 
              isRoot={false}
              fields={fields}
              collapsedNodes={collapsedNodes}
              toggleCollapse={toggleCollapse}
              handleDragStart={handleDragStart}
              handleDrop={handleDrop}
              handleDragOver={handleDragOver}
              isDraggingTarget={dragOverNodeId === child.id}
              onAddPosition={handleOpenAddPosition}
              onAssignEmployee={(pos) => setAssignDialog({ open: true, position: pos, selectedEmployee: null })}
              onUnassignEmployee={handleUnassignEmployee}
              onDeletePosition={handleDeletePosition}
            />
          </Box>
        }
      >
        {child.children && child.children.length > 0 && renderTreeNodes(child)}
      </TreeNode>
    ));
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconSitemap size={24} />
          <Typography variant="h3">Organization Chart</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1}>
          <Tooltip title="View Settings">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" color="primary">
              <IconSettings />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small"><IconZoomOut /></IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton onClick={handleResetZoom} size="small"><IconFocus2 /></IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small"><IconZoomIn /></IconButton>
          </Tooltip>
        </Stack>
      }
      sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}
      contentSX={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0 }}
    >
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>Display Fields</Typography>
          <FormGroup>
            <FormControlLabel control={<Checkbox size="small" checked={fields.showPhoto} onChange={(e) => setFields({ ...fields, showPhoto: e.target.checked })} />} label="Photo" />
            <FormControlLabel control={<Checkbox size="small" checked={fields.showDesignation} onChange={(e) => setFields({ ...fields, showDesignation: e.target.checked })} />} label="Designation" />
            <FormControlLabel control={<Checkbox size="small" checked={fields.showDepartment} onChange={(e) => setFields({ ...fields, showDepartment: e.target.checked })} />} label="Department" />
            <FormControlLabel control={<Checkbox size="small" checked={fields.showCode} onChange={(e) => setFields({ ...fields, showCode: e.target.checked })} />} label="Employee Code" />
          </FormGroup>
          <Box mt={2} textAlign="right">
            <Button size="small" onClick={() => { setCollapsedNodes(new Set()); setAnchorEl(null); }}>Expand All</Button>
          </Box>
        </Box>
      </Popover>

      {/* Confirmation Dialogs */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, source: null, target: null })}>
        <DialogTitle>Restructure Organization</DialogTitle>
        <DialogContent>
          <Typography>
            Move <b>{confirmDialog.source?.positionTitle || confirmDialog.source?.employeeName}</b> to report under <b>{confirmDialog.target?.positionTitle || confirmDialog.target?.employeeName}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, source: null, target: null })}>Cancel</Button>
          <Button variant="contained" onClick={confirmManagerChange}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addPosDialog.open} onClose={() => setAddPosDialog({ open: false, parentNode: null, positionTitle: '', departmentId: '' })} fullWidth maxWidth="sm">
        <DialogTitle>Create Vacant Position</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>Reporting to: {addPosDialog.parentNode?.positionTitle || addPosDialog.parentNode?.employeeName}</Typography>
          <Stack spacing={2}>
            <TextField fullWidth label="Position Title" value={addPosDialog.positionTitle} onChange={(e) => setAddPosDialog(p => ({ ...p, positionTitle: e.target.value }))} autoFocus />
            <Autocomplete
              options={departments}
              getOptionLabel={(opt) => opt.departmentName || ''}
              value={departments.find(d => String(d.id) === String(addPosDialog.departmentId)) || null}
              onChange={(e, val) => setAddPosDialog(p => ({ ...p, departmentId: val ? val.id : '' }))}
              renderInput={(params) => <TextField {...params} label="Department" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPosDialog({ open: false, parentNode: null, positionTitle: '', departmentId: '' })}>Cancel</Button>
          <Button variant="contained" onClick={confirmAddPosition} disabled={!addPosDialog.positionTitle}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, position: null, selectedEmployee: null })} fullWidth maxWidth="sm">
        <DialogTitle>Assign Employee to {assignDialog.position?.positionTitle}</DialogTitle>
        <DialogContent>
          <Autocomplete
            sx={{ mt: 1 }}
            fullWidth
            options={activeEmpList}
            getOptionLabel={(opt) => `${opt.employeeName || ''} (${opt.empCode || opt.oldEmpCode || ''})`}
            value={assignDialog.selectedEmployee}
            onChange={(e, val) => setAssignDialog(prev => ({ ...prev, selectedEmployee: val }))}
            renderInput={(params) => <TextField {...params} label="Select Employee" variant="outlined" autoFocus />}
            renderOption={(props, opt) => {
              const desig = designations.find(d => String(d.id) === String(opt.designationId))?.designationName || '';
              const dept = departments.find(d => String(d.id) === String(opt.departmentId))?.departmentName || '';
              const level = finalLevels.find(l => String(l.id || l.rowId) === String(opt.empLevelId));
              const levelName = level ? (level.levelName || level.level || '') : '';
              return (
                <Box component="li" {...props} key={opt.id}>
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {opt.employeeName || ''} ({opt.empCode || opt.oldEmpCode || ''})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[levelName, desig, dept].filter(Boolean).join(' | ')}
                    </Typography>
                  </Stack>
                </Box>
              );
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false, position: null, selectedEmployee: null })}>Cancel</Button>
          <Button variant="contained" onClick={confirmAssignEmployee} disabled={!assignDialog.selectedEmployee}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Filter Panel */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', zIndex: 10 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              size="small"
              options={flatPositions}
              getOptionLabel={(opt) => `${opt.positionTitle || ''} - ${opt.employeeName || 'Vacant'}`}
              value={flatPositions.find(p => String(p.id) === String(rootPositionId)) || null}
              onChange={(e, val) => setRootPositionId(val ? val.id : null)}
              renderInput={(params) => <TextField {...params} label="Select Root Position (Optional)" variant="outlined" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
             <Stack direction="row" spacing={1}>
               <Button variant="outlined" color="primary" onClick={() => {
                  axios.post('/api/master/hr/positions/migrate')
                    .then(r => { alert('Migration successful! Reloading...'); fetchData(); })
                    .catch(e => alert(e.response?.data || 'Migration failed.'));
               }}>
                  Migrate Old Mappings
               </Button>
               <Button variant="contained" color="secondary" startIcon={<IconPlus />} onClick={() => handleOpenAddPosition({ isCompanyNode: true })}>
                  Add Root Position
               </Button>
             </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Chart Canvas */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 4, pb: 8, bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>
        ) : !treeData ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" gap={2}>
            <Typography variant="h5" color="text.secondary">No hierarchy data available.</Typography>
            <Typography variant="body1" color="text.secondary">Click "Add Root Position" to start building your structure, or click "Migrate" to auto-generate.</Typography>
          </Box>
        ) : (
          <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
            <Tree lineWidth={'2px'} lineColor={theme.palette.mode === 'dark' ? '#334155' : '#CBD5E1'} lineBorderRadius={'4px'} label={<Box><StyledNode position={treeData} theme={theme} isRoot={true} fields={fields} collapsedNodes={collapsedNodes} toggleCollapse={toggleCollapse} handleDragStart={handleDragStart} handleDrop={handleDrop} handleDragOver={handleDragOver} isDraggingTarget={dragOverNodeId === treeData.id} onAddPosition={handleOpenAddPosition} onAssignEmployee={(pos) => setAssignDialog({ open: true, position: pos, selectedEmployee: null })} onUnassignEmployee={handleUnassignEmployee} onDeletePosition={handleDeletePosition} /></Box>}>
              {renderTreeNodes(treeData)}
            </Tree>
          </Box>
        )}
      </Box>
    </MainCard>
  );
}
