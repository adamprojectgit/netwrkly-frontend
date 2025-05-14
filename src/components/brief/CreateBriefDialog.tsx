import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Stepper,
    Step,
    StepLabel,
    Typography,
} from '@mui/material';
import { CreateBriefData } from '../../types/brief';

interface CreateBriefDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (briefData: CreateBriefData) => void;
}

const STEPS = ['Background', 'The Ask', 'Deliverables'];

export const CreateBriefDialog: React.FC<CreateBriefDialogProps> = ({ open, onClose, onSubmit }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [briefData, setBriefData] = useState<CreateBriefData>({
        title: '',
        background: '',
        ask: '',
        deliverables: '',
        budget: '',
    });

    const handleNext = async () => {
        if (activeStep === STEPS.length - 1) {
            try {
                await onSubmit(briefData);
                // Reset form
                setBriefData({ title: '', background: '', ask: '', deliverables: '', budget: '' });
                setActiveStep(0);
                // Close dialog
                onClose();
            } catch (error) {
                console.error('Error submitting brief:', error);
                // Keep dialog open if there's an error
            }
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleChange = (field: keyof CreateBriefData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setBriefData((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const isStepValid = () => {
        switch (activeStep) {
            case 0:
                return briefData.title?.trim() !== '' && briefData.background?.trim() !== '';
            case 1:
                return briefData.ask?.trim() !== '';
            case 2:
                return briefData.deliverables?.trim() !== '' && briefData.budget?.trim() !== '';
            default:
                return false;
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Brief Title"
                            fullWidth
                            value={briefData.title}
                            onChange={handleChange('title')}
                            required
                        />
                        <TextField
                            label="Background"
                            fullWidth
                            multiline
                            rows={4}
                            value={briefData.background}
                            onChange={handleChange('background')}
                            required
                            helperText="Provide context about your company and the project"
                        />
                    </Box>
                );
            case 1:
                return (
                    <TextField
                        label="The Ask"
                        fullWidth
                        multiline
                        rows={6}
                        value={briefData.ask}
                        onChange={handleChange('ask')}
                        required
                        helperText="Describe what you're looking for in detail"
                    />
                );
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Deliverables"
                            fullWidth
                            multiline
                            rows={4}
                            value={briefData.deliverables}
                            onChange={handleChange('deliverables')}
                            required
                            helperText="List the specific deliverables you expect"
                        />
                        <TextField
                            label="Budget Range"
                            fullWidth
                            value={briefData.budget}
                            onChange={handleChange('budget')}
                            required
                            helperText="e.g., $5,000 - $10,000"
                        />
                    </Box>
                );
            default:
                return null;
        }
    };

    const handleCancel = () => {
        setBriefData({ title: '', background: '', ask: '', deliverables: '', budget: '' });
        setActiveStep(0);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
            <DialogTitle>Create New Brief</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 4, mt: 2 }}>
                    <Stepper activeStep={activeStep}>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
                {renderStepContent()}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cancel</Button>
                {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!isStepValid()}
                >
                    {activeStep === STEPS.length - 1 ? 'Create Brief' : 'Next'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 