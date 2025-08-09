# 🌟 Cloud AI Assistant - Complete Setup Guide for Beginners

## 📋 Prerequisites (Install These First)

### 1. Install Python 3.8+
```powershell
# Check if Python is installed
python --version

# If not installed, download from: https://www.python.org/downloads/
# During installation, check "Add Python to PATH"
```

### 2. Install Node.js 18+
```powershell
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from: https://nodejs.org/
```

### 3. Install Git
```powershell
# Check if Git is installed
git --version

# If not installed, download from: https://git-scm.com/downloads
```

## 🔑 Get Your Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (keep it secret!)

## 💻 Local Development Setup

### Step 1: Set Up the Backend (FastAPI)

```powershell
# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# 2. Install Python dependencies
pip install fastapi uvicorn python-multipart python-dotenv
pip install langchain langchain-google-genai langchain-community
pip install faiss-cpu PyPDF2 langchain-text-splitters

# 3. Create .env file
New-Item -ItemType File -Path ".env"
# Add this line to .env file:
# GOOGLE_API_KEY=your_api_key_here
```

### Step 2: Set Up the Frontend (Next.js)

```powershell
# Navigate to frontend directory
cd my-app

# Install dependencies
npm install

# Go back to root directory
cd ..
```

### Step 3: Run the Application

```powershell
# Terminal 1: Start Backend (from root directory)
venv\Scripts\activate
python app.py

# Terminal 2: Start Frontend (from my-app directory)
cd my-app
npm run dev
```

Visit: http://localhost:3000

## ☁️ Cloud Deployment Options (Choose Your Path)

### Option 1: Vercel (Easiest for Beginners) 🌟

**For Frontend:**
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd my-app
vercel

# Follow the prompts
```

**For Backend (using Vercel Functions):**
- Convert FastAPI to Vercel-compatible serverless functions
- Or use Railway/Render for backend

### Option 2: Google Cloud Platform (Recommended for AI projects)

```powershell
# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# Login to GCP
gcloud auth login

# Set project
gcloud config set project your-project-id

# Deploy backend to Cloud Run
gcloud run deploy cloud-ai-backend --source .

# Deploy frontend to Firebase Hosting or Cloud Run
```

### Option 3: AWS (Industry Standard)

```powershell
# Install AWS CLI
# Download from: https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure

# Deploy using AWS App Runner or Elastic Beanstalk
```

## 🐳 Containerization with Docker

Create these files for professional deployment:

**Dockerfile (Backend):**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "app.py"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
  
  frontend:
    build: ./my-app
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## 📚 Learning Path for Cloud Engineering

### Week 1-2: Foundations
- [ ] Complete this project setup locally
- [ ] Learn Docker basics
- [ ] Understand HTTP APIs and REST
- [ ] Basic Linux/command line skills

### Week 3-4: Cloud Fundamentals
- [ ] Choose a cloud provider (GCP recommended for AI)
- [ ] Learn about virtual machines, containers, and serverless
- [ ] Practice deploying simple applications
- [ ] Understand networking basics (DNS, load balancers)

### Month 2: Advanced Topics
- [ ] CI/CD pipelines (GitHub Actions)
- [ ] Monitoring and logging
- [ ] Security best practices
- [ ] Database management in the cloud
- [ ] Infrastructure as Code (Terraform)

### Month 3+: Specialization
- [ ] Kubernetes for container orchestration
- [ ] Microservices architecture
- [ ] Cloud-native patterns
- [ ] Cost optimization
- [ ] Multi-cloud strategies

## 🛠️ Recommended Tools to Install

```powershell
# Development tools
npm install -g @vercel/cli
npm install -g netlify-cli

# Code editors
# Download VS Code: https://code.visualstudio.com/
# Install extensions: Python, Docker, Cloud Code
```

## 🔍 Troubleshooting Common Issues

### Python Virtual Environment Issues
```powershell
# If activation fails
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Alternative activation method
venv\Scripts\Activate.ps1
```

### Port Already in Use
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F
```

### Module Import Errors
```powershell
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall requirements
pip install -r requirements.txt --upgrade
```

## 🎯 Next Steps After Local Setup

1. **Version Control**: Push to GitHub
2. **Containerize**: Create Docker images
3. **Deploy**: Choose a cloud platform
4. **Monitor**: Set up logging and monitoring
5. **Scale**: Learn about load balancing and auto-scaling
6. **Secure**: Implement authentication and HTTPS

## 📖 Recommended Learning Resources

### Free Resources:
- **AWS Free Tier**: 12 months free cloud resources
- **Google Cloud Free Tier**: $300 credit
- **Coursera**: Google Cloud and AWS courses
- **YouTube**: "Tech With Tim", "Traversy Media"
- **FreeCodeCamp**: Cloud computing tutorials

### Paid Resources:
- **Pluralsight**: Comprehensive cloud courses
- **A Cloud Guru**: Cloud certification prep
- **Udemy**: Practical cloud projects

## 🏆 Cloud Certifications to Consider

**Beginner Level:**
- AWS Cloud Practitioner
- Google Cloud Digital Leader
- Azure Fundamentals

**Intermediate Level:**
- AWS Solutions Architect Associate
- Google Cloud Associate Cloud Engineer
- Azure Administrator Associate

Remember: Start small, learn by doing, and don't be afraid to break things (that's how you learn)! 🚀

