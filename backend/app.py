from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import os
from dotenv import load_dotenv
from chat_assistant import JobSearchAssistant

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI assistant
assistant = JobSearchAssistant(api_key=os.getenv("OPENAI_API_KEY"))

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict] = None

class SkillGapsRequest(BaseModel):
    resume: str
    job_description: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response = await assistant.chat(request.message, request.context)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-skills")
async def analyze_skills_endpoint(request: SkillGapsRequest):
    try:
        analysis = assistant.get_skill_gaps(request.resume, request.job_description)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
