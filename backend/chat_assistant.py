from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from typing import Dict, List, Optional
import json
import os

class JobSearchAssistant:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.llm = ChatOpenAI(
            api_key=api_key,
            model_name="gpt-3.5-turbo",
            temperature=0.7
        )
        
        # Initialize conversation memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Initialize the conversation chain
        self.conversation = ConversationChain(
            llm=self.llm,
            memory=self.memory,
            prompt=self._get_chat_prompt()
        )
        
        # Initialize RAG components
        self.embeddings = OpenAIEmbeddings(api_key=api_key)
        self.initialize_knowledge_base()

    def _get_chat_prompt(self) -> PromptTemplate:
        """Create the chat prompt template."""
        template = """You are an expert career advisor and resume specialist. 
        Use your knowledge to help users with their job search, resume writing, and career questions.
        
        Current conversation:
        {chat_history}
        
        Human: {input}
        AI Assistant: """
        
        return PromptTemplate(
            input_variables=["chat_history", "input"],
            template=template
        )

    def initialize_knowledge_base(self):
        """Initialize the RAG knowledge base with resume and job search best practices."""
        # Load knowledge base files
        knowledge_files = [
            "knowledge_base/resume_tips.txt",
            "knowledge_base/job_search.txt"
        ]
        
        documents = []
        for file_path in knowledge_files:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                documents.append(content)
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n## ", "\n### ", "\n- ", "\n"]
        )
        texts = text_splitter.create_documents(documents)
        
        # Create vector store
        self.vector_store = FAISS.from_documents(
            documents=texts,
            embedding=self.embeddings
        )
        
        # Initialize QA chain with source documents
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(
                search_kwargs={"k": 5}  # Retrieve top 5 most relevant chunks
            )
        )

    async def chat(self, user_input: str, context: Optional[Dict] = None) -> Dict:
        """Process user input and return AI response with relevant information."""
        try:
            # Get response from conversation chain
            response = self.conversation.predict(input=user_input)
            
            # If context contains resume or job description, use them for better responses
            if context and ('resume' in context or 'job_description' in context):
                enhanced_response = self._enhance_response_with_context(response, context)
                return {
                    "response": enhanced_response,
                    "type": "detailed_advice"
                }
            
            return {
                "response": response,
                "type": "general_advice"
            }
        except Exception as e:
            return {
                "error": f"Error processing chat: {str(e)}"
            }

    def _enhance_response_with_context(self, response: str, context: Dict) -> str:
        """Enhance the response using the provided resume and job context."""
        if 'resume' in context and 'job_description' in context:
            # Use RAG to get relevant advice based on the specific context
            query = f"Given this response: {response}\n"
            query += f"And this resume: {context['resume']}\n"
            query += f"And this job description: {context['job_description']}\n"
            query += "What specific advice can you provide?"
            
            enhanced_response = self.qa_chain.run(query)
            return f"{response}\n\nSpecific Recommendations:\n{enhanced_response}"
        
        return response

    def get_skill_gaps(self, resume: str, job_description: str) -> Dict:
        """Analyze skill gaps between resume and job description."""
        try:
            prompt = f"""Analyze the skill gaps between this resume and job description:
            
            Resume:
            {resume}
            
            Job Description:
            {job_description}
            
            Identify:
            1. Missing critical skills
            2. Areas where experience level doesn't match
            3. Recommendations for skill development
            """
            
            response = self.llm.predict(prompt)
            return {
                "analysis": response,
                "success": True
            }
        except Exception as e:
            return {
                "error": f"Error analyzing skill gaps: {str(e)}",
                "success": False
            }

    def generate_achievement_bullets(self, experience: str) -> Dict:
        """Generate achievement-oriented bullet points from experience description."""
        try:
            prompt = f"""Transform this experience into achievement-oriented bullet points:
            
            Experience:
            {experience}
            
            Focus on:
            - Quantifiable results
            - Action verbs
            - Impact and outcomes
            - Technical skills demonstrated
            """
            
            response = self.llm.predict(prompt)
            return {
                "bullets": response.split('\n'),
                "success": True
            }
        except Exception as e:
            return {
                "error": f"Error generating bullets: {str(e)}",
                "success": False
            }
