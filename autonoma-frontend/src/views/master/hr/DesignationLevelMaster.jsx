import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconBriefcase, IconFileDownload, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import AddDesignationLevelDialog from './AddDesignationLevelDialog';
import { format } from 'date-fns';

const columns = [
    { id: 'index', label: '#', minWidth: 50 },
    { id: 'level', label: 'Level', minWidth: 150, bold: true },
    { id: 'basic', label: 'Basic', minWidth: 150 },
    { id: 'da', label: 'DA', minWidth: 120 },
    { id: 'hra', label: 'HRA', minWidth: 120 },
    { id: 'screeningLevel', label: 'Screening Level', minWidth: 150 },
    { id: 'createdBy', label: 'Created By', minWidth: 150 },
    { id: 'createdDate', label: 'Created Date', minWidth: 180 }
];

export default function DesignationLevelMaster() {
    const dispatch = useDispatch();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [selectedRow, setSelectedRow] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const globalQuery = useSelector((state) => state.search.query);

    useEffect(() => {
        dispatch(setFilterConfig([
            { id: 'level', label: 'Level', type: 'text', placeholder: 'Search level...', isConstant: true }
        ]));
        return () => dispatch(setFilterConfig(null));
    }, [dispatch]);

    const fetchDesignationLevels = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/master/hr/designationlevel');
            setRows(response.data || []);
        } catch (error) {
            console.error('Failed to fetch designation levels:', error);
            dispatch(openSnackbar({ open: true, message: 'Failed to fetch designation levels', severity: 'error', variant: 'alert' }));
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => { fetchDesignationLevels(); }, [fetchDesignationLevels]);

    const handleOpenAdd = () => { setSelectedRow(null); setDialogOpen(true); };
    const handleOpenEdit = (row) => { setSelectedRow(row); setDialogOpen(true); };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;
        try {
            await axios.delete(`/api/master/hr/designationlevel/${selectedRow.rowId}`);
            dispatch(openSnackbar({ open: true, message: 'Designation Level deleted successfully', severity: 'success', variant: 'alert' }));
            fetchDesignationLevels();
            setDeleteDialogOpen(false);
        } catch (err) {
            dispatch(openSnackbar({ open: true, message: 'Failed to delete', severity: 'error', variant: 'alert' }));
        }
    };

    const handleExport = () => {
        const exportData = filteredRows.map((r, i) => ({
            '#': i + 1,
            Level: r.level,
            Basic: r.basic,
            DA: r.da,
            HRA: r.hra,
            'Screening Level': r.screeningLevel,
            'Created By': r.createdBy,
            'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd-MM-yyyy HH:mm') : '-'
        }));
        exportToExcel(exportData, 'Designation_Level');
    };

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const matchesSearch = !globalQuery ||
                (row.level && row.level.toLowerCase().includes(globalQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [rows, globalQuery]);

    const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

    useKeyboardShortcuts({
        'ctrl+n': handleOpenAdd,
        'escape': () => setDialogOpen(false)
    });

    const renderCell = (col, row, idx) => {
        if (col.id === 'index') return idx + 1 + page * size;
        if (col.id === 'createdDate') return row.createdDate ? format(new Date(row.createdDate), 'dd-MM-yyyy HH:mm') : '-';
        const value = row[col.id];
        return (value !== undefined && value !== null && value !== '') ? value : '-';
    };

    return (
        <MainCard
            title={
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <IconBriefcase size={24} />
                    <Typography variant="h3">Designation Level Master</Typography>
                </Stack>
            }
            secondary={
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={fetchDesignationLevels}
                            color="primary"
                            size="small"
                            sx={{
                                border: '2px solid',
                                borderColor: 'divider',
                                borderRadius: '8px',
                                p: 1,
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
                            }}
                        >
                            <IconRefresh size={20} />
                        </IconButton>
                    </Tooltip>
                    <BOSExportButton
                        data={filteredRows}
                        filename="Designation_Level"
                        columns={[
                            { header: 'Level', key: 'level' },
                            { header: 'Basic', key: 'basic' },
                            { header: 'DA', key: 'da' },
                            { header: 'HRA', key: 'hra' }
                        ]}
                    />
                    <Tooltip title={shortcutTooltip('Create Designation Level', 'Ctrl + N')}>
                        <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
                            + New
                        </Button>
                    </Tooltip>
                </Stack>
            }
        >
            <BOSDataTable
                columns={columns}
                rows={paginatedRows}
                page={page}
                size={size}
                totalCount={filteredRows.length}
                loading={loading}
                onPageChange={setPage}
                onSizeChange={(s) => { setSize(s); setPage(0); }}
                onDoubleClickRow={handleOpenEdit}
                onEditRow={handleOpenEdit}
                onDeleteRow={(row) => { setSelectedRow(row); setDeleteDialogOpen(true); }}
                renderCell={renderCell}
            />

            <AddDesignationLevelDialog
                open={dialogOpen}
                handleClose={(refresh) => { setDialogOpen(false); if (refresh) fetchDesignationLevels(); }}
                initialData={selectedRow}
            />

            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Designation Level"
                message="Are you sure you want to delete this designation Level?"
                itemName={selectedRow?.level}
            />
        </MainCard>
    );
}
