import OpenAI from 'openai';
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from './prompt.js';

interface GenerateRequest {
  raw_notes: string;
  meeting_date?: string;
  attendees?: string[];
  purpose?: string;
  style: 'short' | 'detailed';
}

interface MOMItem {
  title: string;
  discussion: string;
  action_item: string;
  pic: string;
}

interface MOMResponse {
  items: MOMItem[];
}

interface LLMResult {
  mom: MOMResponse;
  tokens: {
    input: number;
    output: number;
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMOM(request: GenerateRequest): Promise<LLMResult> {
  const userPrompt = USER_PROMPT_TEMPLATE(
    request.raw_notes,
    request.style,
    request.purpose
  );

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL_ID || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: parseInt(process.env.MAX_TOKENS || '700'),
      temperature: parseFloat(process.env.TEMPERATURE || '0.2'),
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from LLM');
    }

    const parsedResponse = JSON.parse(content) as MOMResponse;
    
    if (!parsedResponse.items || !Array.isArray(parsedResponse.items)) {
      throw new Error('Invalid response format from LLM');
    }

    return {
      mom: parsedResponse,
      tokens: {
        input: completion.usage?.prompt_tokens || 0,
        output: completion.usage?.completion_tokens || 0
      }
    };
  } catch (error) {
    console.error('LLM generation error:', error);
    throw new Error(`Failed to generate MOM: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}