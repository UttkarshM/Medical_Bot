import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Forward the form data to the Flask backend
    const response = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error || "Upload failed" },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      fileNames: data.files,
      message: data.message,
      chunksCreated: data.chunks_created,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    )
  }
}
