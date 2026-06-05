import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import Logo from 'ui-component/Logo';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  'Personal & Family',
  'Habits & Health',
  'Goals & Reflection',
  'Career & Salary',
  'Previous Job Details',
  'Work & Ratings'
];

export default function CandidateAssessment() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [candidate, setCandidate] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    q1_native: '',
    q2_present_address: '',
    q3_permanent_address: '',
    q4_father_occupation: '',
    q5_mother_occupation: '',
    q6_marital_status: '',
    q7_spouse_occupation: '',
    q8_children: '',
    q9_has_relatives: 'NO',
    q10_relatives_details: '',
    q11_siblings_occupations: '',
    q12_has_two_wheeler: 'NO',
    q13_has_android_phone: 'NO',
    q14_knows_car_driving: 'NO',
    q15_willing_to_travel: 'NO',
    q16_covid_vaccination: 'NO',
    q17_positive_points: '',
    q18_negative_points: '',
    q19_life_goals: '',
    q20_improvement_suggestions: '',
    q21_is_experienced: 'NO',
    q22_total_experience: '',
    q23_core_experience: '',
    q24_prev_net_salary: '',
    q25_prev_gross_salary: '',
    q26_expected_net_salary: '',
    q27_expected_gross_salary: '',
    q28_pf_higher_pension: 'NO',
    q29_pf_deduction_amount: '',
    q30_alternative_department: '',
    q31_prev_location: '',
    q32_prev_shift: '',
    q33_reason_for_leaving: '',
    q34_notice_period: '',
    q35_prev_dept_position: '',
    q36_prev_dept_count: '',
    q37_prev_reporting_to: '',
    q38_handle_mistake: '',
    q39_handle_opinion_difference: '',
    q40_computer_self_rating: 'AVERAGE'
  });

  useEffect(() => {
    const sessionToken = sessionStorage.getItem('candidateSessionToken');
    const details = sessionStorage.getItem('candidateDetails');

    if (!sessionToken || !details) {
      // Clear storage and redirect
      sessionStorage.removeItem('candidateSessionToken');
      sessionStorage.removeItem('candidateDetails');
      navigate('/candidate/login');
    } else {
      setCandidate(JSON.parse(details));
    }
  }, [navigate]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    const sessionToken = sessionStorage.getItem('candidateSessionToken');
    if (!sessionToken) {
      setError('Your session has expired. Please log in again.');
      navigate('/candidate/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/hra/applicants/portal/submit', {
        token: sessionToken,
        ...formData
      });
      setSubmitted(true);
      sessionStorage.removeItem('candidateSessionToken');
      sessionStorage.removeItem('candidateDetails');
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to submit self assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Personal & Family Details
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="q1_native"
                label="1. Native Place"
                value={formData.q1_native}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="q6_marital_status"
                label="6. Marital Status"
                value={formData.q6_marital_status}
                onChange={handleTextChange}
              >
                <MenuItem value="SINGLE">SINGLE</MenuItem>
                <MenuItem value="MARRIED">MARRIED</MenuItem>
                <MenuItem value="DIVORCED">DIVORCED</MenuItem>
                <MenuItem value="WIDOWED">WIDOWED</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                name="q2_present_address"
                label="2. Present Address"
                value={formData.q2_present_address}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                name="q3_permanent_address"
                label="3. Permanent Address"
                value={formData.q3_permanent_address}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="q4_father_occupation"
                label="4. Father's Occupation"
                value={formData.q4_father_occupation}
                onChange={handleTextChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="q5_mother_occupation"
                label="5. Mother's Occupation"
                value={formData.q5_mother_occupation}
                onChange={handleTextChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="q7_spouse_occupation"
                label="7. Spouse's Occupation"
                value={formData.q7_spouse_occupation}
                onChange={handleTextChange}
                disabled={formData.q6_marital_status !== 'MARRIED'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="q8_children"
                label="8. Children details (count / ages)"
                value={formData.q8_children}
                onChange={handleTextChange}
                disabled={formData.q6_marital_status !== 'MARRIED'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="q9_has_relatives"
                label="9. Any relative or friend working in this company?"
                value={formData.q9_has_relatives}
                onChange={handleTextChange}
              >
                <MenuItem value="NO">NO</MenuItem>
                <MenuItem value="YES">YES</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="q10_relatives_details"
                label="10. Relative / Friend details"
                value={formData.q10_relatives_details}
                onChange={handleTextChange}
                disabled={formData.q9_has_relatives !== 'YES'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                name="q11_siblings_occupations"
                label="11. Siblings & their occupations"
                value={formData.q11_siblings_occupations}
                onChange={handleTextChange}
              />
            </Grid>
          </Grid>
        );
      case 1: // Habits & Health
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="q12_has_two_wheeler"
                label="12. Do you have a two wheeler?"
                value={formData.q12_has_two_wheeler}
                onChange={handleTextChange}
              >
                <MenuItem value="NO">NO</MenuItem>
                <MenuItem value="YES">YES</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="q13_has_android_phone"
                label="13. Do you have an Android phone?"
                value={formData.q13_has_android_phone}
                onChange={handleTextChange}
              >
                <MenuItem value="NO">NO</MenuItem>
                <MenuItem value="YES">YES</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="q14_knows_car_driving"
                label="14. Do you know car driving?"
                value={formData.q14_knows_car_driving}
                onChange={handleTextChange}
              >
                <MenuItem value="NO">NO</MenuItem>
                <MenuItem value="YES">YES</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="q15_willing_to_travel"
                label="15. Willing to travel for company work?"
                value={formData.q15_willing_to_travel}
                onChange={handleTextChange}
              >
                <MenuItem value="NO">NO</MenuItem>
                <MenuItem value="YES">YES</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                name="q16_covid_vaccination"
                label="16. COVID-19 vaccination completed with booster dose?"
                value={formData.q16_covid_vaccination}
                onChange={handleTextChange}
              >
                <MenuItem value="NO">NO</MenuItem>
                <MenuItem value="YES">YES</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
      case 2: // Goals & Reflection
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="q17_positive_points"
                label="17. Brief details about your positive points / strengths"
                value={formData.q17_positive_points}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="q18_negative_points"
                label="18. Brief details about your negative points / weaknesses"
                value={formData.q18_negative_points}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="q19_life_goals"
                label="19. What are your life goals?"
                value={formData.q19_life_goals}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="q20_improvement_suggestions"
                label="20. Ideas/suggestions for department productivity improvement"
                value={formData.q20_improvement_suggestions}
                onChange={handleTextChange}
              />
            </Grid>
          </Grid>
        );
      case 3: // Career & Salary
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                name="q21_is_experienced"
                label="21. Are you experienced?"
                value={formData.q21_is_experienced}
                onChange={handleTextChange}
              >
                <MenuItem value="NO">NO</MenuItem>
                <MenuItem value="YES">YES</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                name="q22_total_experience"
                label="22. Total years of experience"
                value={formData.q22_total_experience}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                name="q23_core_experience"
                label="23. Core department experience (years)"
                value={formData.q23_core_experience}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>Salary Details (in INR)</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="q24_prev_net_salary"
                label="24. Previous Net Salary"
                value={formData.q24_prev_net_salary}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="q25_prev_gross_salary"
                label="25. Previous Gross Salary"
                value={formData.q25_prev_gross_salary}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="q26_expected_net_salary"
                label="26. Expected Net Salary"
                value={formData.q26_expected_net_salary}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="q27_expected_gross_salary"
                label="27. Expected Gross Salary"
                value={formData.q27_expected_gross_salary}
                onChange={handleTextChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="q28_pf_higher_pension"
                label="28. PF higher pension required?"
                value={formData.q28_pf_higher_pension}
                onChange={handleTextChange}
              >
                <MenuItem value="NO">NO</MenuItem>
                <MenuItem value="YES">YES</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="q29_pf_deduction_amount"
                label="29. PF deduction amount (if applicable)"
                value={formData.q29_pf_deduction_amount}
                onChange={handleTextChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="q30_alternative_department"
                label="30. If not selected for this position, which alternate department would you prefer?"
                value={formData.q30_alternative_department}
                onChange={handleTextChange}
              />
            </Grid>
          </Grid>
        );
      case 4: // Previous Employment Details
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="q31_prev_location"
                label="31. Previous / Current company location"
                value={formData.q31_prev_location}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="q32_prev_shift"
                label="32. Previously worked shift details"
                value={formData.q32_prev_shift}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                name="q33_reason_for_leaving"
                label="33. Reason for leaving previous job"
                value={formData.q33_reason_for_leaving}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="q34_notice_period"
                label="34. Notice period in previous company (days)"
                value={formData.q34_notice_period}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="q37_prev_reporting_to"
                label="37. Previous Manager name / Reporting to designaton"
                value={formData.q37_prev_reporting_to}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                name="q35_prev_dept_position"
                label="35. Details of previous department & designation"
                value={formData.q35_prev_dept_position}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                name="q36_prev_dept_count"
                label="36. Employee count in previous department"
                value={formData.q36_prev_dept_count}
                onChange={handleTextChange}
                disabled={formData.q21_is_experienced !== 'YES'}
              />
            </Grid>
          </Grid>
        );
      case 5: // Work & Ratings
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="q38_handle_mistake"
                label="38. How do you handle your mistakes during work?"
                value={formData.q38_handle_mistake}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="q39_handle_opinion_difference"
                label="39. How do you resolve opinion differences within the team?"
                value={formData.q39_handle_opinion_difference}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                name="q40_computer_self_rating"
                label="40. Self-rating on Computer Skills (MS-Office, Excel, Outlook)"
                value={formData.q40_computer_self_rating}
                onChange={handleTextChange}
              >
                <MenuItem value="EXCELLENT">EXCELLENT</MenuItem>
                <MenuItem value="GOOD">GOOD</MenuItem>
                <MenuItem value="AVERAGE">AVERAGE</MenuItem>
                <MenuItem value="POOR">POOR</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown Step';
    }
  };

  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)',
          p: 2
        }}
      >
        <Container maxWidth="sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card
              sx={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Box sx={{ mb: 3 }}>
                  <Logo height={80} />
                </Box>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Submission Successful!
                </Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 4 }}>
                  Thank you, <strong>{candidate?.employeeName || 'Candidate'}</strong>. Your Self-Assessment answers have been successfully uploaded.
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Our HR department has been notified. You may now close this browser tab.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)',
        py: 4,
        px: 2
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3} sx={{ mb: 4, alignItems: 'center' }}>
          <Logo height={60} />
          <Typography variant="h3" sx={{ color: '#f8fafc', fontWeight: 'bold', textAlign: 'center' }}>
            Self-Assessment Form
          </Typography>
          {candidate && (
            <Typography variant="subtitle1" sx={{ color: '#94a3b8', mt: -1 }}>
              Applicant: <strong>{candidate.employeeName}</strong> | ID: {candidate.empCode}
            </Typography>
          )}
        </Stack>

        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 4 },
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}
        >
          {/* Stepper */}
          <Box sx={{ mb: 4, width: '100%' }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                '& .MuiStepLabel-label': { color: '#64748b' },
                '& .MuiStepLabel-label.Mui-active': { color: '#3b82f6', fontWeight: 'bold' },
                '& .MuiStepLabel-label.Mui-completed': { color: '#10b981' },
                '& .MuiStepIcon-root': { color: '#334155' },
                '& .MuiStepIcon-root.Mui-active': { color: '#3b82f6' },
                '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' }
              }}
            >
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
              {error}
            </Alert>
          )}

          {/* Form Content */}
          <Box
            sx={{
              mt: 2,
              mb: 4,
              color: '#f8fafc',
              // Customize child standard textfields to look premium in dark mode
              '& .MuiTextField-root': {
                '& .MuiInputLabel-root': { color: '#94a3b8' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                '& .MuiOutlinedInput-root': {
                  color: '#f8fafc',
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                },
                '& .MuiSelect-icon': { color: '#94a3b8' }
              }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
              >
                {renderStepContent(activeStep)}
              </motion.div>
            </AnimatePresence>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Actions */}
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{
                color: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { borderColor: 'rgba(255, 255, 255, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }
              }}
              variant="outlined"
            >
              Back
            </Button>
            {activeStep === STEPS.length - 1 ? (
              <Button
                disabled={loading}
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  backgroundColor: '#10b981',
                  '&:hover': { backgroundColor: '#059669' },
                  px: 4,
                  fontWeight: 'bold'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Assessment'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                sx={{
                  backgroundColor: '#3b82f6',
                  '&:hover': { backgroundColor: '#2563eb' },
                  px: 4,
                  fontWeight: 'bold'
                }}
              >
                Next
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
