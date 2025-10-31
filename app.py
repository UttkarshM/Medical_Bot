from flask import Flask, jsonify, request
from flask_cors import CORS
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

uploaded_files = []
vector_store = None

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "app": "Flask Hello World"
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload file endpoint - receives files, saves them, and processes them"""
    global uploaded_files, vector_store

    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files provided"}), 400

    file_names = []
    upload_folder = 'uploads'
    os.makedirs(upload_folder, exist_ok=True)

    # Save all uploaded files
    for file in files:
        if file.filename == '':
            continue

        filename = file.filename
        file_names.append(filename)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

    uploaded_files.extend(file_names)

    # Automatically process the uploaded files
    try:
        # Step 1: Extract text from PDFs
        text = ""
        for filename in file_names:
            pdf_path = os.path.join(upload_folder, filename)
            pdf_reader = PdfReader(pdf_path)
            for page in pdf_reader.pages:
                text += page.extract_text()

        if not text.strip():
            return jsonify({"error": "No text extracted from PDFs"}), 400

        # Step 2: Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=10000,
            chunk_overlap=1000
        )
        chunks = text_splitter.split_text(text)

        # Step 3: Create embeddings and FAISS index
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )

        vector_store = FAISS.from_texts(chunks, embedding=embeddings)
        vector_store.save_local("faiss_index")

        return jsonify({
            "message": "Files uploaded and processed successfully",
            "files": file_names,
            "total_files": len(file_names),
            "chunks_created": len(chunks),
            "status": "FAISS index created"
        }), 200

    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


@app.route('/process', methods=['POST'])
def process_documents():
    """Process uploaded PDFs - extract text, chunk, and create FAISS index"""
    global vector_store

    # Check if files exist in uploads folder
    upload_folder = 'uploads'
    if not os.path.exists(upload_folder):
        return jsonify({"error": "No files uploaded yet"}), 400

    pdf_files = [f for f in os.listdir(upload_folder) if f.endswith('.pdf')]
    if not pdf_files:
        return jsonify({"error": "No PDF files found"}), 400

    try:
        # Step 1: Extract text from PDFs
        text = ""
        for pdf_file in pdf_files:
            pdf_path = os.path.join(upload_folder, pdf_file)
            pdf_reader = PdfReader(pdf_path)
            for page in pdf_reader.pages:
                text += page.extract_text()

        if not text.strip():
            return jsonify({"error": "No text extracted from PDFs"}), 400

        # Step 2: Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=10000,
            chunk_overlap=1000
        )
        chunks = text_splitter.split_text(text)

        # Step 3: Create embeddings and FAISS index
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )

        vector_store = FAISS.from_texts(chunks, embedding=embeddings)
        vector_store.save_local("faiss_index")

        return jsonify({
            "message": "Documents processed successfully",
            "files_processed": len(pdf_files),
            "chunks_created": len(chunks),
            "status": "FAISS index created"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/index-status', methods=['GET'])
def index_status():
    """Check if FAISS index exists and is ready"""
    index_exists = os.path.exists("faiss_index")
    return jsonify({
        "index_exists": index_exists,
        "vector_store_loaded": vector_store is not None,
        "uploaded_files": uploaded_files
    }), 200


@app.route('/chat', methods=['POST'])
def chat():
    """Chat endpoint - retrieves context from FAISS and queries Gemini"""
    try:
        # Get question from request
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"error": "Question is required"}), 400

        question = data.get('question', '').strip()
        if not question:
            return jsonify({"error": "Question cannot be empty"}), 400

        # Check if FAISS index exists
        if not os.path.exists("faiss_index"):
            return jsonify({"error": "No documents uploaded. Please upload PDF files first."}), 400

        # Load FAISS index with HuggingFace embeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )

        db = FAISS.load_local(
            "faiss_index",
            embeddings,
            allow_dangerous_deserialization=True
        )

        # Search for relevant documents
        docs = db.similarity_search(question, k=4)

        # Create context from retrieved documents
        context = "\n\n".join([doc.page_content for doc in docs])

        # Create prompt template
        prompt_template = ChatPromptTemplate.from_template("""
Answer the question as detailed as possible from the provided context. Make sure to provide all the details.
If the answer is not in the provided context, just say "answer is not available in the context".
Don't provide the wrong answer.

Context:
{context}

Question:
{question}

Answer:""")

        # Initialize Gemini model (using gemini-2.0-flash)
        model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.3,
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            convert_system_message_to_human=True
        )

        # Create chain and invoke
        chain = prompt_template | model
        response = chain.invoke({"context": context, "question": question})

        return jsonify({
            "answer": response.content,
            "source_documents": [doc.page_content[:200] + "..." for doc in docs[:3]]
        }), 200

    except Exception as e:
        return jsonify({"error": f"Chat failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
