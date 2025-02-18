import React, { useState } from 'react';
import { Box, Button, Container, Paper, Typography, CircularProgress, TextField, Tab, Tabs, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#f8f9fa',
}));

const ResumeTailor = () => {
  const [files, setFiles] = useState({
    resume: null,
    jobDescription: null,
  });
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resumeInputMethod, setResumeInputMethod] = useState('file');
  const [jobInputMethod, setJobInputMethod] = useState('file');

  const handleFileChange = (type) => (event) => {
    if (event.target.files[0]) {
      setFiles(prev => ({
        ...prev,
        [type]: event.target.files[0]
      }));
    }
  };

  const handleResumeInputMethodChange = (event, newValue) => {
    setResumeInputMethod(newValue);
    if (newValue === 'file') {
      setResumeText('');
    } else {
      setFiles(prev => ({ ...prev, resume: null }));
    }
  };

  const handleJobInputMethodChange = (event, newValue) => {
    setJobInputMethod(newValue);
    if (newValue === 'file') {
      setJobDescriptionText('');
    } else {
      setFiles(prev => ({ ...prev, jobDescription: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      
      // Handle resume input
      if (resumeInputMethod === 'file' && files.resume) {
        formData.append('resume', files.resume);
      } else if (resumeInputMethod === 'text' && resumeText) {
        const resumeBlob = new Blob([resumeText], { type: 'text/plain' });
        formData.append('resume', resumeBlob, 'resume.txt');
      }
      
      // Handle job description input
      if (jobInputMethod === 'file' && files.jobDescription) {
        formData.append('jobDescription', files.jobDescription);
      } else if (jobInputMethod === 'text' && jobDescriptionText) {
        const jobDescBlob = new Blob([jobDescriptionText], { type: 'text/plain' });
        formData.append('jobDescription', jobDescBlob, 'job-description.txt');
      }

      const response = await fetch('http://localhost:5000/api/tailor-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to process resume. Please check if the backend server is running.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadText = () => {
    if (!result?.tailored_resume) return;
    
    const blob = new Blob([result.tailored_resume], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailored-resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const isSubmitDisabled = 
    (resumeInputMethod === 'file' && !files.resume) || 
    (resumeInputMethod === 'text' && !resumeText.trim()) ||
    (jobInputMethod === 'file' && !files.jobDescription) || 
    (jobInputMethod === 'text' && !jobDescriptionText.trim()) || 
    loading;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        AI Resume Tailor
      </Typography>
      
      <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
        Upload or paste your resume and job description to get personalized tailoring suggestions
      </Typography>

      <form onSubmit={handleSubmit}>
        <StyledPaper elevation={3}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            {/* Resume Input Section */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Resume
              </Typography>
              <Tabs value={resumeInputMethod} onChange={handleResumeInputMethodChange}>
                <Tab label="Upload Resume" value="file" />
                <Tab label="Paste Resume" value="text" />
              </Tabs>
            </Box>

            {resumeInputMethod === 'file' ? (
              <Box>
                <Button
                  component="label"
                  variant="contained"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Upload Resume
                  <VisuallyHiddenInput 
                    type="file" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange('resume')} 
                  />
                </Button>
                {files.resume && (
                  <Typography variant="body2" color="success.main">
                    ✓ {files.resume.name}
                  </Typography>
                )}
              </Box>
            ) : (
              <TextField
                multiline
                rows={8}
                fullWidth
                variant="outlined"
                placeholder="Paste your resume here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            )}

            {/* Job Description Input Section */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Job Description
              </Typography>
              <Tabs value={jobInputMethod} onChange={handleJobInputMethodChange}>
                <Tab label="Upload Job Description" value="file" />
                <Tab label="Paste Job Description" value="text" />
              </Tabs>
            </Box>

            {jobInputMethod === 'file' ? (
              <Box>
                <Button
                  component="label"
                  variant="contained"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Upload Job Description
                  <VisuallyHiddenInput 
                    type="file" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange('jobDescription')} 
                  />
                </Button>
                {files.jobDescription && (
                  <Typography variant="body2" color="success.main">
                    ✓ {files.jobDescription.name}
                  </Typography>
                )}
              </Box>
            ) : (
              <TextField
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                placeholder="Paste the job description here..."
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
              />
            )}

            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitDisabled}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze and Tailor Resume'}
            </Button>
          </Box>
        </StyledPaper>
      </form>

      {error && (
        <StyledPaper elevation={3}>
          <Typography color="error" gutterBottom>
            Error: {error}
          </Typography>
        </StyledPaper>
      )}

      {result && (
        <Box sx={{ mt: 4 }}>
          <StyledPaper elevation={3}>
            <Typography variant="h6" gutterBottom>
              Job Analysis
            </Typography>
            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {result.job_analysis.analysis}
            </Typography>
          </StyledPaper>

          <StyledPaper elevation={3}>
            <Typography variant="h6" gutterBottom>
              Tailoring Suggestions
            </Typography>
            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {result.suggestions}
            </Typography>
          </StyledPaper>

          <StyledPaper elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Tailored Resume
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownloadText}
                  sx={{ mr: 1 }}
                >
                  Download as Text
                </Button>
              </Box>
            </Box>
            <TextField
              multiline
              rows={15}
              fullWidth
              variant="outlined"
              value={result.tailored_resume}
              InputProps={{
                readOnly: true,
              }}
            />
          </StyledPaper>
        </Box>
      )}
    </Container>
  );
};

export default ResumeTailor;
