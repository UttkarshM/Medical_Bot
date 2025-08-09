# 🏥 Medical Bot - Cloud AI Assistant ☁️

A powerful cloud-based AI assistant designed for medical document analysis and healthcare query processing. Built with Next.js frontend and FastAPI backend, leveraging Google's Gemini AI for intelligent document understanding and question answering through RAG (Retrieval-Augmented Generation) technology.

## Features

- ☁️ **Cloud Document Analysis**: Upload PDF documents to the cloud and ask questions about their content
- 🤖 **AI-Powered Responses**: Powered by Google Gemini Pro for intelligent document insights
- 📚 **RAG Technology**: Uses FAISS vector database for efficient document retrieval
- 🧠 **Smart Analysis**: Specialized in analyzing, summarizing, and extracting insights from various document types
- 🔒 **Secure Upload**: PDF-only file uploads with validation
- 📱 **Modern UI**: Clean, responsive interface with cloud theming

## Tech Stack

### Backend (FastAPI)
- **FastAPI**: Modern Python web framework
- **Google Gemini Pro**: Large language model for AI responses
- **FAISS**: Vector database for document similarity search
- **LangChain**: Framework for building LLM applications
- **PyPDF2**: PDF text extraction

### Frontend (Next.js)
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **Lucide React**: Icon library

## Setup Instructions

### Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- Google AI API key (from Google AI Studio)

### Backend Setup (FastAPI)

1. **Create a virtual environment:**
   ```bash
   cd Cloud_AI_Assistant
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file
   copy .env.example .env
   
   # Edit .env and add your Google API key:
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. **Run the FastAPI server:**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup (Next.js)

1. **Navigate to the frontend directory:**
   ```bash
   cd my-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Usage

1. **Start both servers:**
   - Backend: `python app.py` (port 8000)
   - Frontend: `npm run dev` (port 3000)

2. **Upload PDF documents:**
   - Click "Select PDF Files" to upload documents to the cloud
   - Only PDF files are accepted
   - Multiple files can be uploaded at once

3. **Ask questions:**
   - Type questions about your documents in the chat interface
   - Examples:
     - "What are the key points mentioned in the document?"
     - "Can you summarize the main content?"
     - "What recommendations are provided?"
     - "Extract the important information from the document"

4. **Review responses:**
   - AI responses include source document references
   - Responses are based on the uploaded documents using RAG technology

## API Endpoints

### FastAPI Backend (`http://localhost:8000`)

- `GET /` - Health check
- `POST /upload` - Upload PDF files
- `POST /chat` - Send chat messages
- `GET /health` - Detailed health check

### Next.js API Routes (`http://localhost:3000/api`)

- `POST /api/upload` - Proxy to FastAPI upload endpoint
- `POST /api/chat` - Proxy to FastAPI chat endpoint

## Environment Variables

### Backend (.env)
```
GOOGLE_API_KEY=your_google_api_key_here
```

### Getting a Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

## File Structure

```
Cloud_AI_Assistant/
├── app.py                 # FastAPI backend application
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── README.md             # This file
├── my-app/               # Next.js frontend
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main page component
│   ├── components/       # UI components
│   ├── lib/             # Utility functions
│   ├── package.json     # Node.js dependencies
│   └── tailwind.config.js # Tailwind configuration
└── faiss_index/         # Generated FAISS vector database
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   - Make sure you've activated the virtual environment
   - Install all requirements: `pip install -r requirements.txt`

2. **Google API errors:**
   - Verify your API key is correct in the `.env` file
   - Ensure you have billing enabled on your Google account
   - Check API quotas and limits

3. **File upload errors:**
   - Only PDF files are supported
   - Ensure files are not corrupted
   - Check file permissions

4. **Connection errors:**
   - Make sure both servers are running
   - Check that ports 3000 and 8000 are available
   - Verify firewall settings

### Performance Tips

- Upload smaller PDF files for faster processing
- Use clear, specific questions for better responses
- Allow time for document processing after upload

## Security Considerations

- Never upload sensitive personal information in a production environment
- This is a demonstration application - add proper authentication and authorization for production use
- Consider implementing rate limiting and input validation
- Store sensitive data securely and comply with relevant data protection regulations

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## License

This project is for educational and demonstration purposes. Please ensure compliance with all applicable laws and regulations when handling document data.

