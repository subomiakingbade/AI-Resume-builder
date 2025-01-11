const express = require('express');
const multer = require('multer');
const cors = require('cors');
const {spawn} = require('child_process');


const app = express();
const port = 5000;

const upload = multer({dest: 'uploads/'});

app.use(cors());

app.post("/uploads", upload.fields([{ name: 'resume', maxCount: 1 }]), (req, res) => {

    const jobDescription = req.body.job_description;
    const resumeFile = req.file;

    if (!resumeFile || !jobDescription){
        return res.status(400).send({message: "Both resume and job description are required"});
    }

    console.log(`Resume file: ${resumeFile.originalname}`);
    console.log(`Job description: ${jobDescription}`);

    //pass the file to the python script
    const pythonProcess = spawn('python', ['keyword_script.py', resumeFile.path, jobDescription]);
    let pythonOutput ='';

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

app.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});


