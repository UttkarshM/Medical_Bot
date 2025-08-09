from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import tempfile
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain.chains.question_answering import load_qa_chain
from dotenv import load_dotenv
import uvicorn
import logging

load_dotenv()

app = FastAPI(title="Cloud AI Assistant API", description="Cloud-powered RAG chatbot API for document analysis", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuestionRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    source_documents: Optional[List[str]] = None

class UploadResponse(BaseModel):
    message: str
    files_processed: int

vector_store = None
conversation_chain = None

def get_pdf_text(pdf_files: List[str]) -> str:
    """Extract text from PDF files"""
    text = ""
    for pdf_path in pdf_files:
        try:
            pdf_reader = PdfReader(pdf_path)
            for page in pdf_reader.pages:
                text += page.extract_text()
        except Exception as e:
            logger.error(f"Error reading PDF {pdf_path}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")
    return text

def get_text_chunks(text: str) -> List[str]:
    """Split text into chunks"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=10000, 
        chunk_overlap=1000
    )
    chunks = text_splitter.split_text(text)
    return chunks

def create_vector_store(text_chunks: List[str]) -> FAISS:
    """Create FAISS vector store from text chunks"""
    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
        vector_store.save_local("faiss_index")
        return vector_store
    except Exception as e:
        logger.error(f"Error creating vector store: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating vector store: {str(e)}")

def get_conversational_chain():
    """Create conversational chain"""
    prompt_template = """
    Answer the question as detailed as possible from the provided context. Make sure to provide all the details. 
    If the answer is not in the provided context, just say "answer is not available in the context". 
    Don't provide the wrong answer.

    Context:
    {context}

    Question: 
    {question}

    Answer:
    """

    try:
        model = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.3,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        prompt = PromptTemplate(
            template=prompt_template, 
            input_variables=["context", "question"]
        )
        chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
        return chain
    except Exception as e:
        logger.error(f"Error creating conversational chain: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating conversational chain: {str(e)}")

def process_user_input(user_question: str) -> dict:
    """Process user question and return response"""
    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        
        if not os.path.exists("faiss_index"):
            raise HTTPException(status_code=404, detail="No documents uploaded. Please upload PDF files first.")
        
        new_db = FAISS.load_local(
            "faiss_index", 
            embeddings, 
            allow_dangerous_deserialization=True
        )
        docs = new_db.similarity_search(user_question)
        
        chain = get_conversational_chain()
        response = chain(
            {"input_documents": docs, "question": user_question}, 
            return_only_outputs=True
        )
        
        return {
            "answer": response["output_text"],
            "source_documents": [doc.page_content[:200] + "..." for doc in docs[:3]]
        }
    except Exception as e:
        logger.error(f"Error processing user input: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Cloud AI Assistant API is running", "status": "healthy"}

@app.post("/upload", response_model=UploadResponse)
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload and process PDF files"""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    pdf_files = []
    temp_files = []
    
    try:
        # Save uploaded files temporarily
        for file in files:
            if not file.filename.endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"Only PDF files are allowed. Got: {file.filename}")
            
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_files.append(temp_file.name)
            
            content = await file.read()
            temp_file.write(content)
            temp_file.close()
            
            pdf_files.append(temp_file.name)
        
        # Process PDFs
        text = get_pdf_text(pdf_files)
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF files")
        
        chunks = get_text_chunks(text)
        global vector_store
        vector_store = create_vector_store(chunks)
        
        return UploadResponse(
            message="Files uploaded and processed successfully",
            files_processed=len(files)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing files: {str(e)}")
    
    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass

@app.post("/chat", response_model=ChatResponse)
async def chat(request: QuestionRequest):
    """Chat with the cloud AI assistant"""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    try:
        response = process_user_input(request.question)
        return ChatResponse(
            answer=response["answer"],
            source_documents=response["source_documents"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "vector_store_loaded": os.path.exists("faiss_index"),
        "google_api_configured": bool(os.getenv("GOOGLE_API_KEY"))
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

