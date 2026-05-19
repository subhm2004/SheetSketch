import { NextRequest, NextResponse } from 'next/server';
import { AI_DRAW_SYSTEM_PROMPT, parseAiDrawResponse } from '@/lib/ai-shapes';
import { completeJsonForDraw } from '@/lib/ai-completion';

type Body = {
  prompt?: string;
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt || prompt.length > 800) {
    return NextResponse.json(
      { error: 'Prompt is required (max 800 characters).' },
      { status: 400 },
    );
  }

  const bounds = body.bounds ?? { minX: 80, minY: 80, maxX: 720, maxY: 520 };
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  const userContent = `Canvas bounds (use coordinates inside this box):
minX=${Math.round(bounds.minX)}, minY=${Math.round(bounds.minY)}, maxX=${Math.round(bounds.maxX)}, maxY=${Math.round(bounds.maxY)}
center≈(${Math.round(centerX)}, ${Math.round(centerY)})

User request: ${prompt}`;

  try {
    const result = await completeJsonForDraw([
      { role: 'system', content: AI_DRAW_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ]);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.content);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 });
    }

    const { shapes, message } = parseAiDrawResponse(parsed);
    return NextResponse.json({
      shapes,
      message: message ?? result.userHint,
      provider: result.provider,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to generate drawing';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
