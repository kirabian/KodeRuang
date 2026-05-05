import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

import { getCloudflareContext } from '@opennextjs/cloudflare';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // In Cloudflare Pages via OpenNext, we need to read from the Cloudflare worker context
  let apiKey = process.env.GROQ_API_KEY;
  try {
    const { env } = getCloudflareContext();
    if (env && (env as any).GROQ_API_KEY) {
      apiKey = (env as any).GROQ_API_KEY;
    }
  } catch (e) {
    // Fallback to process.env if not running in Cloudflare context
  }

  const groq = createGroq({
    apiKey: apiKey,
  });

  const { messages } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    messages: await convertToModelMessages(messages),
    system: "Kamu adalah asisten AI untuk komunitas developer KodeRuang. Tugasmu membantu menjawab pertanyaan seputar coding, debugging, dan resource teknologi. Jawablah menggunakan bahasa Indonesia yang santai tapi profesional.",
  });

  return result.toUIMessageStreamResponse();
}
