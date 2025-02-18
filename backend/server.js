const express = require('express');
const multer = require('multer');
const cors = require('cors');
const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.doc', '.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .txt, .doc, .docx, and .pdf files are allowed.'));
    }
  }
});

app.use(cors());

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.post("/uploads", upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'job_description', maxCount: 1 }
]), (req, res) => {
    const resumeFile = req.files?.resume?.[0]; 
    const jobDescriptionFile = req.files?.job_description?.[0]; 

    if (!resumeFile || !jobDescriptionFile) {
        return res.status(400).send({ message: "Both resume and job description files are required." });
    }

    console.log(`Resume file: ${resumeFile.originalname}`);
    console.log(`Job description file: ${jobDescriptionFile.originalname}`);

    const pythonProcess = spawn('python', ['keyword_script.py', resumeFile.path, jobDescriptionFile.path]);
    let pythonOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).send({ message: 'Error processing data.' });
        }

        res.json({
            success: true,
            message: 'Processing complete.',
            output: pythonOutput,
        });
    });
});

app.post('/api/tailor-resume', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescription', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files['resume'] || !req.files['jobDescription']) {
      return res.status(400).json({ error: 'Both resume and job description are required' });
    }

    const resumePath = req.files['resume'][0].path;
    const jobDescPath = req.files['jobDescription'][0].path;

    // Call Python script for tailoring
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'resume_tailor.py'),
      process.env.OPENAI_API_KEY,
      resumePath,
      jobDescPath
    ]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      // Clean up uploaded files
      try {
        fs.unlinkSync(resumePath);
        fs.unlinkSync(jobDescPath);
      } catch (err) {
        console.error('Error cleaning up files:', err);
      }

      if (code !== 0) {
        return res.status(500).json({ 
          error: 'Failed to process resume',
          details: errorOutput || 'Python script execution failed'
        });
      }

      try {
        const jsonResult = JSON.parse(result);
        if (jsonResult.error) {
          return res.status(500).json({ 
            error: 'Failed to process resume',
            details: jsonResult.error
          });
        }
        res.json(jsonResult);
      } catch (e) {
        res.status(500).json({ 
          error: 'Failed to parse result',
          details: 'Invalid JSON output from Python script'
        });
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message,
    details: 'Server encountered an error'
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
