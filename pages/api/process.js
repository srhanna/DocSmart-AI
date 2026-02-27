const AI_GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1';
const AI_GATEWAY_MODEL = process.env.AI_GATEWAY_MODEL || 'openai/gpt-4o-mini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'No text provided for analysis' });
  }

  if (!process.env.AI_GATEWAY_API_KEY) {
    return res.status(500).json({ error: 'AI Gateway API key is not configured' });
  }

  let response;
  try {
    response = await fetch(`${AI_GATEWAY_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_GATEWAY_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a document analysis assistant. Extract and structure key information from document text. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: `Analyze the following document text. Return a JSON object with these fields:
- "summary": a concise one-paragraph summary
- "entities": an array of objects with "type" (DATE, AMOUNT, NAME, ORGANIZATION, or OTHER) and "value" fields
- "keyPoints": an array of strings listing the most important points

Document text:
${text}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });
  } catch (err) {
    console.error('AI Gateway network error:', err);
    return res.status(502).json({ error: 'Could not reach AI Gateway' });
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error('AI Gateway error response:', response.status, errorBody);
    return res.status(502).json({ error: `AI Gateway returned ${response.status}` });
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    console.error('AI Gateway invalid JSON response:', err);
    return res.status(502).json({ error: 'AI Gateway returned invalid response' });
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return res.status(502).json({ error: 'AI Gateway returned no content' });
  }

  let analysis;
  try {
    analysis = JSON.parse(content);
  } catch {
    analysis = { summary: content, entities: [], keyPoints: [] };
  }

  return res.status(200).json({ analysis });
}
