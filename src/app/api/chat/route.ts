import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages: await convertToModelMessages(messages),
    system: "Kamu adalah asisten AI untuk komunitas developer KodeRuang. Tugasmu membantu menjawab pertanyaan seputar coding, debugging, dan resource teknologi. Jawablah menggunakan bahasa Indonesia yang santai tapi profesional.",
  });

  return result.toUIMessageStreamResponse();
}
