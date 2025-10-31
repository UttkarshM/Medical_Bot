import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Forward the question to the Flask backend
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error || "Chat request failed" },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      response: data.answer,
      sourceDocuments: data.source_documents?.map((doc: string, idx: number) => ({
        name: `Source ${idx + 1}`,
        content: doc,
      })) || [],
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
}
