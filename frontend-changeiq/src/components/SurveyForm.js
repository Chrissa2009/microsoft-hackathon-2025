import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Checkbox,
  Divider,
  Select,
  InputLabel
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import SaveIcon from '@mui/icons-material/Save';

// Import or define your survey questions
import { surveyQuestions } from './surveyQuestions';

function SurveyForm({ onSubmit, initialResponses = {}, onChange }) {
  const [activeStep, setActiveStep] = useState(0);
  const [responses, setResponses] = useState(initialResponses);
  const [errors, setErrors] = useState({});

  // Initialize responses from props when component mounts or initialResponses changes
  useEffect(() => {
    setResponses(initialResponses);
  }, [initialResponses]);

  // Notify parent component when responses change
  useEffect(() => {
    if (onChange) {
      onChange(responses);
    }
  }, [responses, onChange]);

  const handleInputChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
    
    // Clear any error for this question
    if (errors[questionId]) {
      setErrors({
        ...errors,
        [questionId]: ''
      });
    }
  };

  const validateStep = (stepIndex) => {
    const currentSection = surveyQuestions[stepIndex];
    if (!currentSection) return true;

    const newErrors = {};
    let isValid = true;

    currentSection.questions.forEach((question) => {
      if (question.required && (!responses[question.id] || 
         (Array.isArray(responses[question.id]) && responses[question.id].length === 0) ||
         (typeof responses[question.id] === 'string' && responses[question.id].trim() === ''))) {
        newErrors[question.id] = 'This field is required';
        isValid = false;
      }
      
      // Number validation
      if (responses[question.id] && question.type === 'number') {
        const numValue = Number(responses[question.id]);
        if (isNaN(numValue)) {
          newErrors[question.id] = 'Please enter a valid number';
          isValid = false;
        } else if (question.min !== undefined && numValue < question.min) {
          newErrors[question.id] = `Value must be at least ${question.min}`;
          isValid = false;
        } else if (question.max !== undefined && numValue > question.max) {
          newErrors[question.id] = `Value must not exceed ${question.max}`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      onSubmit(responses);
    }
  };

  const handleSaveProgress = () => {
    // Save current progress even if the current step isn't fully validated
    onSubmit(responses);
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'text':
      case 'number':
      case 'email':
        return (
          <TextField
            id={question.id}
            label={question.label}
            type={question.type || 'text'}
            value={responses[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            fullWidth
            required={question.required}
            multiline={question.multiline}
            rows={question.multiline ? 4 : 1}
            error={!!errors[question.id]}
            helperText={errors[question.id] || question.helpText}
            size="medium"
            sx={{ 
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }
            }}
            margin="normal"
          />
        );

      case 'select':
        return (
          <FormControl 
            fullWidth 
            error={!!errors[question.id]} 
            required={question.required}
            sx={{ mt: 2, mb: 1 }}
          >
            <InputLabel id={`${question.id}-label`}>{question.label}</InputLabel>
            <Select
              labelId={`${question.id}-label`}
              id={question.id}
              value={responses[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              label={question.label}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {question.options?.map((option, idx) => (
                <MenuItem key={idx} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {(errors[question.id] || question.helpText) && (
              <FormHelperText>{errors[question.id] || question.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl 
            component="fieldset" 
            error={!!errors[question.id]} 
            required={question.required}
            sx={{ width: '100%', mt: 2, mb: 1 }}
          >
            <FormLabel component="legend">{question.label}</FormLabel>
            <RadioGroup
              value={responses[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
            >
              {question.options?.map((option, idx) => (
                <FormControlLabel 
                  key={idx} 
                  value={option} 
                  control={<Radio />} 
                  label={option} 
                />
              ))}
            </RadioGroup>
            {(errors[question.id] || question.helpText) && (
              <FormHelperText>{errors[question.id] || question.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl 
            component="fieldset" 
            error={!!errors[question.id]} 
            required={question.required}
            sx={{ width: '100%', mt: 2, mb: 1 }}
          >
            <FormLabel component="legend">{question.label}</FormLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2, mt: 1 }}>
              {question.options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={responses[question.id]?.includes(option.value) || false}
                      onChange={(e) => {
                        const currentValues = responses[question.id] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(value => value !== option.value);
                        handleInputChange(question.id, newValues);
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </Box>
            {(errors[question.id] || question.helpText) && (
              <FormHelperText>{errors[question.id] || question.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  const renderQuestions = () => {
    if (surveyQuestions.length === 0 || !surveyQuestions[activeStep]) return null;
    
    const currentSection = surveyQuestions[activeStep];
    
    return (
      <Box 
        sx={{ 
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%'
        }}
      >
        {currentSection.questions.map((question) => (
          <Box key={question.id}>
            {renderQuestion(question)}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 },  // More padding on larger screens
        width: '100%',               // Use full available width
        maxWidth: '100%',            // Ensure it doesn't exceed parent width
        overflowX: 'hidden'          // Prevent horizontal scrolling
      }}
    >
      <Stepper 
        activeStep={activeStep} 
        sx={{ 
          mb: 4,
          display: { xs: 'none', md: 'flex' }, // Hide on small screens
          overflowX: 'auto',  // Allow horizontal scrolling if needed
          pb: 2,             // Padding to show scrollbar
          '& .MuiStepConnector-line': {
            display: 'none'  // Hide the connector lines
          },
          '& .MuiStepLabel-label': {
            fontSize: { md: '0.8rem', lg: '0.9rem' }, // Smaller font size for step labels
            whiteSpace: 'nowrap'  // Prevent text wrapping
          }
        }}
        alternativeLabel // Use alternative label layout for better spacing
      >
        {surveyQuestions.map((section) => (
          <Step key={section.section}>
            <StepLabel>{section.section}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Mobile section indicator (only shows on small screens) */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Step {activeStep + 1} of {surveyQuestions.length}
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          {surveyQuestions[activeStep]?.section}
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: { xs: 'none', md: 'block' } }}>
          {surveyQuestions[activeStep]?.section}
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderQuestions()}
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
          >
            Back
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* Save Progress Button */}
            <Button
              variant="outlined"
              color="primary"
              onClick={handleSaveProgress}
              startIcon={<SaveIcon />}
            >
              Save Progress
            </Button>
            
            <Button
              variant="contained"
              onClick={activeStep === surveyQuestions.length - 1 ? handleSubmit : handleNext}
              endIcon={activeStep === surveyQuestions.length - 1 ? null : <NavigateNextIcon />}
              color="primary"
            >
              {activeStep === surveyQuestions.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </Box>

        {/* Pagination information */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Page {activeStep + 1} of {surveyQuestions.length}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default SurveyForm;
