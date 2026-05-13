import React from 'react';
import { Stack, Typography, Avatar, Box } from '@mui/material';
import { IconUser } from '@tabler/icons-react';

/**
 * BOSPersonnelCard - Standardized card for Auditor/Auditee/Approver information.
 * Handles layout and metadata display with a premium aesthetic.
 */
const BOSPersonnelCard = ({ 
    title, 
    name, 
    empCode, 
    department, 
    photo, 
    color = 'primary.main',
    bgcolor = 'grey.50'
}) => {
    return (
        <Stack spacing={2} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: bgcolor, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: color, borderBottom: '1px solid', borderColor: 'divider', pb: 0.5, letterSpacing: '0.5px' }}>
                {title?.toUpperCase()}
            </Typography>
            <Stack direction="row" spacing={2.5} alignItems="center">
                <Avatar 
                    variant="rounded" 
                    src={photo}
                    sx={{ width: 60, height: 75, bgcolor: 'white', border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                >
                    <IconUser size={30} color="#aaa" />
                </Avatar>
                <Stack spacing={0.5}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>{name || '-'}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', gap: 1 }}>
                        <strong>Code:</strong> {empCode || '-'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', gap: 1 }}>
                        <strong>Dept:</strong> {department || '-'}
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default BOSPersonnelCard;
