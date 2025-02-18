# AI Resume Tailor

An AI-powered application that helps tailor your resume to specific job descriptions using OpenAI's GPT model.

## Features

- Upload or paste your resume (supports PDF and text formats)
- Upload or paste job descriptions
- Get AI-powered analysis of job requirements
- Receive tailored suggestions for your resume
- Download tailored resume in text format
- Modern, user-friendly interface

## Setup

### Prerequisites

- Node.js
- Python 3.x
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Install spaCy model:
```bash
python -m spacy download en_core_web_sm
```

5. Set up your OpenAI API key:
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Set it as an environment variable:
     ```bash
     $env:OPENAI_API_KEY = 'your-api-key'  # Windows PowerShell
     export OPENAI_API_KEY='your-api-key'   # Linux/Mac
     ```

6. Start the backend server:
```bash
node server.js
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Usage

1. Upload your resume or paste its content
2. Upload a job description or paste its content
3. Click "Analyze and Tailor Resume"
4. Review the job analysis and suggestions
5. Download your tailored resume

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - JavaScript

- Backend:
  - Node.js
  - Express
  - Python
  - OpenAI GPT
  - spaCy

## Contributing

Feel free to submit issues and enhancement requests!
