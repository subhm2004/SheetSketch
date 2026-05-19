type ChatMessage = { role: 'system' | 'user'; content: string };

type CompletionResult =
  | { ok: true; content: string; provider: 'openai' | 'groq' }
  | { ok: false; status: number; error: string };

function trimKey(raw: string | undefined) {
  const key = raw?.trim();
  return key || undefined;
}

export function getConfiguredProviders(): ('openai' | 'groq')[] {
  const list: ('openai' | 'groq')[] = [];
  if (trimKey(process.env.OPEN_AI_API_KEY) || trimKey(process.env.OPENAI_API_KEY)) {
    list.push('openai');
  }
  if (trimKey(process.env.GROQ_API_KEY)) list.push('groq');
  return list;
}

function parseOpenAiError(status: number, body: string): string {
  try {
    const data = JSON.parse(body) as {
      error?: { message?: string; code?: string; type?: string };
    };
    const msg = data.error?.message;
    const code = data.error?.code ?? data.error?.type;

    if (status === 401 || code === 'invalid_api_key') {
      return 'Invalid OpenAI API key. Update OPEN_AI_API_KEY in .env and restart the dev server.';
    }
    if (status === 429 || code === 'insufficient_quota') {
      return 'insufficient_quota';
    }
    if (msg) return msg;
  } catch {
    /* ignore */
  }
  return `OpenAI error (${status})`;
}

async function callOpenAI(
  apiKey: string,
  messages: ChatMessage[],
): Promise<CompletionResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: parseOpenAiError(res.status, body),
    };
  }

  try {
    const data = JSON.parse(body) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return { ok: false, status: 502, error: 'Empty OpenAI response' };
    }
    return { ok: true, content, provider: 'openai' };
  } catch {
    return { ok: false, status: 502, error: 'Invalid OpenAI response' };
  }
}

async function callGroq(apiKey: string, messages: ChatMessage[]): Promise<CompletionResult> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    let err = `Groq error (${res.status})`;
    try {
      const data = JSON.parse(body) as { error?: { message?: string } };
      if (data.error?.message) err = data.error.message;
    } catch {
      /* ignore */
    }
    return { ok: false, status: res.status, error: err };
  }

  try {
    const data = JSON.parse(body) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return { ok: false, status: 502, error: 'Empty Groq response' };
    }
    return { ok: true, content, provider: 'groq' };
  } catch {
    return { ok: false, status: 502, error: 'Invalid Groq response' };
  }
}

export async function completeJsonForDraw(
  messages: ChatMessage[],
): Promise<CompletionResult & { userHint?: string }> {
  const openaiKey =
    trimKey(process.env.OPEN_AI_API_KEY) ?? trimKey(process.env.OPENAI_API_KEY);
  const groqKey = trimKey(process.env.GROQ_API_KEY);

  if (!openaiKey && !groqKey) {
    return {
      ok: false,
      status: 503,
      error:
        'No AI key configured. Set OPEN_AI_API_KEY or free GROQ_API_KEY in .env, then restart npm run dev.',
    };
  }

  if (openaiKey) {
    const openai = await callOpenAI(openaiKey, messages);
    if (openai.ok) return openai;

    const quotaBlocked =
      openai.error === 'insufficient_quota' || openai.status === 429;

    if (quotaBlocked && groqKey) {
      const groq = await callGroq(groqKey, messages);
      if (groq.ok) {
        return {
          ...groq,
          userHint: 'Used Groq (free) — OpenAI has no API credits on this account.',
        };
      }
      return {
        ok: false,
        status: groq.status,
        error: `${groq.error} OpenAI also has no credits (add billing at platform.openai.com/settings/billing).`,
      };
    }

    if (quotaBlocked) {
      return {
        ok: false,
        status: 429,
        error:
          'Your OpenAI key is valid, but this account has no API credits for chat (429 insufficient_quota). ChatGPT Plus is separate from API billing — add payment at platform.openai.com/settings/billing, or add a free GROQ_API_KEY from console.groq.com/keys',
      };
    }

    return openai;
  }

  return callGroq(groqKey!, messages);
}
