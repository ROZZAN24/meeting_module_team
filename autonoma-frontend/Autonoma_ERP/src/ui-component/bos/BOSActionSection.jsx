import React from 'react';
import { Box, Stack, Tooltip, IconButton, Typography, Grid } from '@mui/material';
import { IconCloudUpload, IconEye, IconTrash } from '@tabler/icons-react';
import BOSTextField from './BOSTextField';

/**
 * BOSActionSection - A "Pattern Component" that combines a text area with 
 * context-specific side controls for file uploads and previews.
 * Reduces boilerplate and ensures perfect button alignment.
 */
const BOSActionSection = ({
    label,
    name,
    value,
    onChange,
    onFileSelect,
    onFilePreview,
    onFileRemove,
    hasFile,
    fileName,
    required = false,
    rows = 3,
    error,
    helperText,
    sx = {}
}) => {
    return (
        <Grid item xs={12} sx={sx}>
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <BOSTextField
                    required={required}
                    fullWidth
                    label={label}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    multiline
                    rows={rows}
                    error={!!error}
                    helperText={helperText}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                />
                <Stack direction="row" spacing={1.5} sx={{ mt: 3.5 }}>
                    <Tooltip title="Upload Evidence">
                        <IconButton 
                            component="label" 
                            size="small" 
                            color="primary" 
                            sx={{ border: '1px dashed', borderColor: 'divider', p: 1.5, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light' } }}
                        >
                            <IconCloudUpload size={20} />
                            <input type="file" hidden onChange={(e) => onFileSelect(e.target.files[0])} />
                        </IconButton>
                    </Tooltip>
                    {hasFile && (
                        <>
                            <Tooltip title="Preview">
                                <IconButton 
                                    size="small" 
                                    color="secondary" 
                                    onClick={onFilePreview}
                                    sx={{ border: '1px solid', borderColor: 'divider', p: 1.5 }}
                                >
                                    <IconEye size={20} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove">
                                <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={onFileRemove}
                                    sx={{ border: '1px solid', borderColor: 'divider', p: 1.5 }}
                                >
                                    <IconTrash size={20} />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Stack>
            </Box>
            {hasFile && fileName && (
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, mt: 1, ml: 0.5, display: 'block' }}>
                    Attachment: {fileName}
                </Typography>
            )}
        </Grid>
    );
};

// Note: Grid needs to be imported or handled. I'll use Box for maximum flexibility if not in a Grid container.
export default BOSActionSection;
