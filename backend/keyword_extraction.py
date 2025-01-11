import sys
import spacy
import json
from collections import Counter
from operator import itemgetter

#File path passed as a command line argument
file_path = sys.argv[1]

# Load spaCy English model
try:
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    print(json.dumps({"error": "Failed to load spaCy model", "details": str(e)}))
    sys.exit(1)


# Extract keywords from text
def extract_keywords(text):
    doc = nlp(text)
    keywords = [token.text.lower() for token in doc if token.is_alpha and not token.is_stop]
    return keywords


def compare_keywords(job_keywords, resume_keywords):
    
    job_count = Counter(job_keywords)
    resume_count = Counter(resume_keywords)
    matched = {word: resume_count[word] for word in job_count if word in resume_count}
    missing = [word for word in job_count if word not in resume_count]
    return matched, missing

def extract_ranked_keywords(text, top_n=10):
    
    doc = nlp(text)
    
    words = [
        token.text.lower() for token in doc
        if token.is_alpha and not token.is_stop
    ]
    
    word_frequencies = Counter(words)
    ranked_keywords = sorted(word_frequencies.items(), key=itemgetter(1), reverse=True)
    return ranked_keywords[:top_n]

# Process the file
def process_file(file_path, job_description):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            resume_text = file.read()
    except Exception as e:
        return{"error": "Failed to read file", "details": str(e)}


    job_keywords = extract_keywords(job_description)
    resume_keywords = extract_keywords(resume_text)
    ranked_keywords = extract_ranked_keywords(job_description, top_n=10)
    matched_keywords, missing_keywords = compare_keywords(job_keywords, resume_keywords)
    
    return {
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "ranked_keywords": ranked_keywords,
    }

# Main execution
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "File path argument missing"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    job_description = """
    We are seeking a software engineer skilled in Python, machine learning, and data analysis. 
    The candidate should have experience in developing scalable backend systems and working with APIs.
    """  # This can be replaced with another argument for flexibility

    result = process_file(file_path, job_description)
    print(json.dumps(result))