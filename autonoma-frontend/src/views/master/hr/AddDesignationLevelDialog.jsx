import { useState, useEffect } from 'react';
import { MenuItem, Box, Stack } from '@mui/material';
import { IconBriefcase } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';

const VALIDATION_RULES = [
    { field: 'level', label: 'Level', required: true },
    { field: 'basic', label: 'Basic', required: true },
    { field: 'da', label: 'DA', required: true },
    { field: 'hra', label: 'HRA', required: true },
    { field: 'screeningLevel', label: 'Screening Level', required: true }
];

const LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];

export default function AddDesignationLevelDialog({ open, handleClose, initialData }) {
    const dispatch = useDispatch();
    const { errors, validate, clearErrors } = useBOSValidation();
    const isEditing = Boolean(initialData);

    const [formData, setFormData] = useState({
        level: '',
        basic: '',
        da: '',
        hra: '',
        screeningLevel: ''
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    ...initialData
                });
            } else {
                setFormData({
                    level: '',
                    basic: '',
                    da: '',
                    hra: '',
                    screeningLevel: ''
                });
                fetchNextScreeningLevel();
            }
            clearErrors();
        }
    }, [open, initialData, clearErrors]);

    const fetchNextScreeningLevel = async () => {
        try {
            const res = await axios.get('/api/master/hr/designationlevel/next-screening-level');
            setFormData(prev => ({ ...prev, screeningLevel: res.data }));
        } catch (e) {
            console.error('Failed to fetch next screening level');
            setFormData(prev => ({ ...prev, screeningLevel: '1' }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!validate(formData, VALIDATION_RULES)) return;

        try {
            if (isEditing) {
                await axios.put(`/api/master/hr/designationlevel/${initialData.rowId}`, formData);
            } else {
                await axios.post('/api/master/hr/designationlevel', formData);
            }
            dispatch(openSnackbar({ open: true, message: `Designation Level ${isEditing ? 'updated' : 'saved'} successfully!`, severity: 'success', variant: 'alert' }));
            handleClose(true);
        } catch (error) {
            // Extract the real backend error message (e.g. "Designation level already exists")
            const msg = error?.response?.data?.message
                || (typeof error?.response?.data === 'string' ? error.response.data : null)
                || error?.message
                || 'Failed to save designation level';
            dispatch(openSnackbar({ open: true, message: msg, severity: 'error', variant: 'alert' }));
        }
    };

    const handleClear = () => {
        setFormData({
            level: '',
            basic: '',
            da: '',
            hra: '',
            screeningLevel: ''
        });
        if (!isEditing) fetchNextScreeningLevel();
        clearErrors();
    };

    return (
        <BOSFormDialog
            open={open}
            onClose={() => handleClose(false)}
            onSave={handleSave}
            onClear={handleClear}
            title={isEditing ? 'Edit Designation Level' : 'Add Designation Level'}
            maxWidth="md"
        >
            <Stack spacing={3}>
                <BOSFormSection icon={<IconBriefcase size={20} />} title="Primary Information">
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <BOSTextField select required label="Level" name="level" value={formData.level} onChange={handleChange} error={!!errors.level} helperText={errors.level}>
                            {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                        </BOSTextField>
                        <BOSTextField type="number" required label="Basic" name="basic" value={formData.basic} onChange={handleChange} error={!!errors.basic} helperText={errors.basic} />
                        <BOSTextField type="number" required label="DA" name="da" value={formData.da} onChange={handleChange} error={!!errors.da} helperText={errors.da} />
                        <BOSTextField type="number" required label="HRA" name="hra" value={formData.hra} onChange={handleChange} error={!!errors.hra} helperText={errors.hra} />
                        <BOSTextField type="number" required label="Screening Level" name="screeningLevel" value={formData.screeningLevel} onChange={handleChange} error={!!errors.screeningLevel} helperText={errors.screeningLevel} />
                    </Box>
                </BOSFormSection>
            </Stack>
        </BOSFormDialog>
    )
}
