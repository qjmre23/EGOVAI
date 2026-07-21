import {
  assistantResponseSchema,
  canTransition,
  fallbackForState,
  isActionAllowed,
  type AssistantResponse,
  type ConversationState,
} from '@egovai/core';
import { config } from '../config.js';
import { DFA_SYSTEM_PROMPT } from './dfaSystemPrompt.js';

const TRANSIENT_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON object in AI response');
  return JSON.parse(trimmed.slice(start, end + 1));
}

function validateAiResponse(raw: string, currentState: ConversationState): AssistantResponse {
  const parsed = assistantResponseSchema.parse(extractJson(raw));
  if (!canTransition(currentState, parsed.state)) {
    throw new Error('AI proposed an invalid state transition');
  }
  if (!isActionAllowed(currentState, parsed.proposedAction.type)) {
    throw new Error('AI proposed an action that is not allowed in this state');
  }
  return parsed;
}

async function callUpstream(appContext: Record<string, unknown>): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${config.ABSK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ABSK_API_KEY}`,
      },
      body: JSON.stringify({
        model: config.ABSK_MODEL,
        messages: [
          { role: 'system', content: DFA_SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(appContext) },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error('Upstream AI request failed') as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Upstream AI response had no content');
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateAssistantResponse(
  currentState: ConversationState,
  appContext: Record<string, unknown>,
  forceGuided = false,
): Promise<{ response: AssistantResponse; mode: 'ai' | 'guided' }> {
  if (forceGuided || !config.ABSK_API_KEY) {
    return { response: fallbackForState(currentState), mode: 'guided' };
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = await callUpstream(appContext);
      return { response: validateAiResponse(raw, currentState), mode: 'ai' };
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      if (attempt === 0 && status !== undefined && TRANSIENT_STATUSES.has(status)) continue;
      if (process.env.NODE_ENV === 'development') {
        console.warn('AI response unavailable; using guided mode.', {
          reason: error instanceof Error ? error.name : 'UnknownError',
        });
      }
      break;
    }
  }

  return { response: fallbackForState(currentState), mode: 'guided' };
}

export const aiInternals = { extractJson, validateAiResponse };
