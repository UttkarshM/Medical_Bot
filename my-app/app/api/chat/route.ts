import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const userQuestion = lastMessage?.content || lastMessage?.parts?.find((part: any) => part.type === 'text')?.text;
    
    if (!userQuestion) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    // Call the FastAPI backend
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: userQuestion }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        error: errorData.detail || 'Failed to get response from medical bot' 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Return the response in the expected format for the chat interface
    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: data.answer,
        sourceDocuments: data.source_documents
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ 
      error: 'Internal server error. Make sure the FastAPI backend is running on http://localhost:8000' 
    }, { status: 500 });
  }
}
