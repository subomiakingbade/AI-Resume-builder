import spacy
from keyword_extraction import extract_keywords, extract_ranked_keywords
from typing import Dict, List, Tuple
import openai
import json
import os
import sys
from PyPDF2 import PdfReader

def read_file_content(file_path: str) -> str:
    """Read content from a file, supporting both PDF and text files."""
    try:
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            # Handle PDF files
            with open(file_path, 'rb') as file:
                pdf_reader = PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        else:
            # Handle text files
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
    except Exception as e:
        raise Exception(f"Error reading file {file_path}: {str(e)}")

class ResumeTailor:
    def __init__(self, api_key):
        try:
            self.nlp = spacy.load("en_core_web_sm")
            if not api_key:
                raise ValueError("OpenAI API key is required")
            openai.api_key = api_key
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

    def analyze_job_description(self, job_description: str) -> Dict:
        """Analyze job description to extract key requirements and skills."""
        try:
            # Get key skills and requirements
            ranked_keywords = extract_ranked_keywords(job_description)
            
            # Use GPT to extract more context
            prompt = f"""Analyze this job description and extract:
            1. Key technical skills required
            2. Soft skills mentioned
            3. Experience level required
            4. Main responsibilities
            
            Job Description:
            {job_description}
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            analysis = response.choices[0].message.content
                
            return {
                "keywords": ranked_keywords,
                "analysis": analysis
            }
        except Exception as e:
            return {"error": f"Error in job analysis: {str(e)}"}

    def tailor_resume(self, resume_text: str, job_description: str) -> Dict:
        """Tailor the resume for the specific job description."""
        try:
            # Analyze both texts
            job_analysis = self.analyze_job_description(job_description)
            if "error" in job_analysis:
                return job_analysis
                
            resume_keywords = extract_keywords(resume_text)
            
            # Generate tailoring suggestions
            prompt = f"""Given this job description and resume, suggest specific improvements to tailor the resume:
            
            Job Description:
            {job_description}
            
            Current Resume:
            {resume_text}
            
            Provide specific suggestions for:
            1. Skills to emphasize
            2. Experience to highlight
            3. Achievements to focus on
            4. Specific sections to modify
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            suggestions = response.choices[0].message.content
            
            # Generate tailored resume
            tailor_prompt = f"""Rewrite this resume to better match the job description while maintaining truthfulness:
            
            Job Description:
            {job_description}
            
            Original Resume:
            {resume_text}
            """
            
            tailor_response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": tailor_prompt}]
            )
            tailored_resume = tailor_response.choices[0].message.content
            
            return {
                "original_resume": resume_text,
                "tailored_resume": tailored_resume,
                "suggestions": suggestions,
                "job_analysis": job_analysis
            }
        except Exception as e:
            return {"error": f"Error in resume tailoring: {str(e)}"}

    def get_matching_score(self, resume_text: str, job_description: str) -> float:
        """Calculate how well the resume matches the job description."""
        try:
            resume_keywords = set(extract_keywords(resume_text))
            job_keywords = set(extract_keywords(job_description))
            
            if not job_keywords:
                return 0.0
                
            matching_keywords = resume_keywords.intersection(job_keywords)
            return len(matching_keywords) / len(job_keywords) * 100
        except Exception as e:
            print(json.dumps({"error": f"Error calculating matching score: {str(e)}"}))
            return 0.0

def main():
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Expected 3 arguments: api_key, resume_path, and job_description_path"}))
        sys.exit(1)

    try:
        api_key = sys.argv[1]
        resume_path = sys.argv[2]
        job_desc_path = sys.argv[3]

        # Read files with support for PDF
        resume_text = read_file_content(resume_path)
        job_desc_text = read_file_content(job_desc_path)

        tailor = ResumeTailor(api_key)
        result = tailor.tailor_resume(resume_text, job_desc_text)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
