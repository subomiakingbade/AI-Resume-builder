import React, { useState } from 'react';
import axios from 'axios';

const UploadJobDescription = () => {

    const [jobDescription, setJobDescription] = useState('');

    const handleUpload = async () => {
        if (!jobDescription){
            alert('Please enter a job description before uploading');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/uploads', {
                job_description: jobDescription, // Send job description as text
            });
            console.log('Server response:', response.data);
            alert('Job description uploaded successfully!');
        } catch (error) {
            console.error('Error uploading job description:', error);
            alert('Failed to upload the job description.');
        }
    };

    return(
        <div className = "upload-container">
            <h2>Enter Job Description</h2>
            <div className="upload-section">
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows="10"
                    cols="50"
                    style={{ marginBottom: '10px', padding: '10px', fontSize: '1rem' }}
                ></textarea>
                <button onClick={handleUpload}>Submit Job Description</button>
            </div>
        </div>
    );
};

export default UploadJobDescription;