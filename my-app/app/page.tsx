'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Upload, FileText, Cloud, AlertCircle, CloudUpload, Brain, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sourceDocuments?: string[];
}

export default function MedicalBotInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Validate that all files are PDFs
    for (const file of selectedFiles) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed');
        return;
      }
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append('files', file);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const result = await response.json();
      setUploadedFiles(prev => [...prev, ...Array.from(selectedFiles).map(f => f.name)]);
      
      // Add a system message about successful upload
      const uploadMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Successfully uploaded ${selectedFiles.length} PDF file(s). You can now ask questions about the content.`,
      };
      setMessages(prev => [...prev, uploadMessage]);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || data.answer,
        sourceDocuments: data.sourceDocuments || data.source_documents,
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sendMessage(input);
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cloud-50 to-blue-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="relative">
              <Cloud className="h-8 w-8 text-sky-600" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Cloud AI Assistant</h1>
          </div>
          <p className="text-gray-600">Upload documents to the cloud and ask questions powered by AI</p>
        </div>

        {/* File Upload Section */}
        <Card className="mb-4 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudUpload className="h-5 w-5 text-sky-600" />
              Cloud Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  multiple
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {isUploading ? 'Uploading...' : 'Select PDF Files'}
                </Button>
                <span className="text-sm text-gray-500">
                  Upload documents to the cloud (PDF only)
                </span>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Uploaded Files:</h4>
                  <ul className="space-y-1">
                    {uploadedFiles.map((filename, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {filename}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[60vh] flex flex-col shadow-xl">
          <CardHeader className="border-b bg-white/50 backdrop-blur">
            <CardTitle className="flex items-center gap-2">
              <div className="relative">
                <Cloud className="h-5 w-5 text-sky-600" />
                <Brain className="h-3 w-3 text-purple-500 absolute -bottom-1 -right-1" />
              </div>
              Cloud AI Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="relative mb-4">
                    <Cloud className="h-12 w-12 text-gray-400" />
                    <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Welcome to Cloud AI Assistant!
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Upload your documents to the cloud above, then ask me questions about their content.
                    I can help analyze, summarize, and provide insights from your documents using powerful AI.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 bg-sky-600">
                          <AvatarFallback>
                            <Cloud className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="max-w-[80%] min-w-0 space-y-2">
                        <div
                          className={`rounded-lg px-4 py-2 break-words overflow-wrap-anywhere ${
                            message.role === 'user'
                              ? 'bg-sky-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {message.content}
                          </p>
                        </div>
                        
                        {message.sourceDocuments && message.sourceDocuments.length > 0 && (
                          <div className="bg-sky-50 p-3 rounded-lg border-l-4 border-sky-200">
                            <p className="text-xs font-medium text-sky-800 mb-1">Source Documents:</p>
                            {message.sourceDocuments.map((doc, index) => (
                              <p key={index} className="text-xs text-sky-700 italic">
                                "{doc}"
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8 bg-gray-600">
                          <AvatarFallback>
                            <User className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8 bg-sky-600">
                        <AvatarFallback>
                          <Cloud className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">Processing in the cloud...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t bg-white/50 backdrop-blur p-4">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask questions about your documents..."
                disabled={isLoading}
                className="flex-1"
                autoFocus
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-sky-600 hover:bg-sky-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-500">
          ☁️ Powered by Cloud AI and RAG Technology ☁️
        </div>
      </div>
    </div>
  );
}
