import React, { useState } from 'react';
import axios from 'axios';

const UploadResume = () => {

    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file){
            alert('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await axios.post('http://127.0.0.1:5000/uploads', formData);
            console.log('Server response:', response.data);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload the file.');
        
        };
    }

    return(
        <div className = "upload-container">
            <h2>Upload Resume</h2>
            <div className="upload-section">
                <input type = "file" onChange={handleFileChange} />
                <button onClick = {handleUpload}>Upload </button>
            </div>
        </div>
    );
};

export default UploadResume;