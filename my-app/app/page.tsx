"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2, FileText, AlertCircle, Database, Upload, Activity, FileSearch } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sourceDocuments?: Array<{ name: string; page?: number }>
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }))
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      setUploadedFiles((prev) => [...prev, ...data.fileNames])
      setError("")
    } catch (err) {
      setError("Failed to upload files. Please try again.")
      console.error(err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          uploadedFiles,
        }),
      })

      if (!response.ok) {
        throw new Error("Chat request failed")
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        sourceDocuments: data.sourceDocuments,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError("Failed to get response. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="relative space-y-3 pt-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Database className="h-10 w-10 text-indigo-600" />
                  <Activity className="absolute -bottom-1 -right-1 h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Medical Document Analysis System</h1>
                  <p className="text-sm text-indigo-600 font-medium">Retrieval-Augmented Generation Pipeline</p>
                </div>
              </div>
              <p className="mt-3 text-gray-600 max-w-2xl">
                Cloud-based RAG implementation for intelligent healthcare documentation processing using Google Gemini and FAISS vector store
              </p>
            </div>
            <FileSearch className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-2 rounded-lg bg-red-50 p-4 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Document Upload Card */}
        <Card className="border-indigo-200 shadow-lg bg-gradient-to-br from-white to-indigo-50/30">
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Upload className="h-5 w-5 text-indigo-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Document Ingestion Module</h2>
                <p className="text-xs text-gray-600">Upload medical PDF documents for RAG processing</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Documents...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Medical Documents (PDF)
                </>
              )}
            </Button>

            <div className="flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">RAG Pipeline Features:</p>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  <li>Automatic text extraction and chunking (10k chars, 1k overlap)</li>
                  <li>HuggingFace embeddings (sentence-transformers/all-MiniLM-L6-v2)</li>
                  <li>FAISS vector store for efficient similarity search</li>
                </ul>
              </div>
            </div>

            {/* Success Indicator */}
            {uploadedFiles.length > 0 && (
              <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-semibold text-green-900">
                    Vector Store Active - {uploadedFiles.length} document{uploadedFiles.length !== 1 ? "s" : ""} indexed
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {uploadedFiles.map((file, idx) => (
                    <li key={file} className="text-sm text-green-700 flex items-center gap-2">
                      <span className="font-mono text-xs bg-green-100 px-2 py-0.5 rounded">Doc {idx + 1}</span>
                      <span>{file}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Chat Interface Card */}
        <Card className="border-indigo-200 shadow-lg">
          <div className="flex h-[60vh] flex-col">
            {/* Chat Header */}
            <div className="border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Database className="h-5 w-5 text-indigo-600" />
                    <Activity className="absolute -bottom-1 -right-1 h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Query Processing Interface</h3>
                    <p className="text-xs text-gray-600">Gemini-1.5-Flash with RAG</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1">
              <div className="space-y-4 p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 py-12">
                    <div className="relative">
                      <Database className="h-16 w-16 text-indigo-200" />
                      <FileSearch className="absolute -bottom-2 -right-2 h-8 w-8 text-indigo-400" />
                    </div>
                    <div className="text-center max-w-md">
                      <h4 className="text-lg font-semibold text-gray-900">Medical Document Analysis Ready</h4>
                      <p className="mt-2 text-sm text-gray-600">
                        Upload medical documents above and ask questions. The RAG pipeline will retrieve relevant information and generate accurate responses.
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" /> FAISS
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" /> Gemini
                        </span>
                        <span>•</span>
                        <span>RAG Pipeline</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600">
                            <Database className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-md rounded-lg px-4 py-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                            : "bg-gray-100 text-gray-900 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.role === "assistant" && message.sourceDocuments && message.sourceDocuments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <p className="text-xs font-medium text-gray-600 mb-1">Sources:</p>
                            <div className="text-xs text-gray-500 space-y-0.5">
                              {message.sourceDocuments.slice(0, 2).map((doc, idx) => (
                                <div key={idx} className="truncate">• {doc.name}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gray-700">U</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600">
                        <Database className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <div className="text-sm">
                        <span className="text-indigo-900 font-medium">Processing query...</span>
                        <p className="text-xs text-gray-600">Retrieving from vector store</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 backdrop-blur p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter medical query for RAG processing..."
                  disabled={isLoading}
                  className="flex-1 border-indigo-200 focus:border-indigo-400"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 pb-8 space-y-1">
          <p className="font-medium">Powered by Google Gemini-1.5-Flash • FAISS Vector Store • RAG Pipeline</p>
          <p className="text-xs text-gray-500">
            Cloud-Based Medical Document Analysis System | Dayananda Sagar College of Engineering
          </p>
        </div>
      </div>
    </div>
  )
}
