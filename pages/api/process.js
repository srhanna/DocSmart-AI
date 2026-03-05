export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text field is required' });
  }

  // ── Entity extraction ────────────────────────────────────────────────────
  const entities = [];

  // Dates: MM/DD/YYYY, MM-DD-YYYY, Month D YYYY, D Month YYYY
  const datePatterns = [
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b/gi,
  ];
  const seenDates = new Set();
  for (const pattern of datePatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      const norm = match.trim();
      if (!seenDates.has(norm)) {
        seenDates.add(norm);
        entities.push({ type: 'DATE', value: norm });
      }
    }
  }

  // Monetary amounts: $1,234.56 / USD 1234 / £99 / €50.00
  const amountMatches = text.match(/(?:[$£€¥])\s*\d[\d,]*(?:\.\d{1,2})?|\b\d[\d,]*(?:\.\d{1,2})?\s*(?:USD|EUR|GBP|CAD|AUD)\b/g) || [];
  const seenAmounts = new Set();
  for (const match of amountMatches) {
    const norm = match.trim();
    if (!seenAmounts.has(norm)) {
      seenAmounts.add(norm);
      entities.push({ type: 'AMOUNT', value: norm });
    }
  }

  // Email addresses
  const emailMatches = text.match(/\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g) || [];
  const seenEmails = new Set();
  for (const match of emailMatches) {
    const norm = match.trim();
    if (!seenEmails.has(norm)) {
      seenEmails.add(norm);
      entities.push({ type: 'EMAIL', value: norm });
    }
  }

  // Phone numbers: common North American and international formats
  const phoneMatches = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g) || [];
  const seenPhones = new Set();
  for (const match of phoneMatches) {
    const norm = match.trim();
    if (!seenPhones.has(norm)) {
      seenPhones.add(norm);
      entities.push({ type: 'PHONE', value: norm });
    }
  }

  // URLs
  const urlMatches = text.match(/https?:\/\/[^\s<>"{}|\\^\[\]`]+/g) || [];
  const seenUrls = new Set();
  for (const match of urlMatches) {
    const norm = match.replace(/[.,;:!?)]+$/, '');
    if (!seenUrls.has(norm)) {
      seenUrls.add(norm);
      entities.push({ type: 'URL', value: norm });
    }
  }

  // ── Statistics ───────────────────────────────────────────────────────────
  const trimmed = text.trim();
  const words = trimmed.length > 0 ? trimmed.split(/\s+/).filter(Boolean) : [];
  // Split on sentence-ending punctuation followed by whitespace.
  // The lookbehind keeps the punctuation with the preceding sentence.
  const sentences = trimmed.length > 0
    ? trimmed.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0)
    : [];
  const paragraphs = trimmed.length > 0
    ? trimmed.split(/\n{2,}/).filter((p) => p.trim().length > 0)
    : [];

  const stats = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgWordsPerSentence:
      sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
  };

  // ── Keyword extraction ───────────────────────────────────────────────────
  // Strip common English stop-words, count word frequency, return top 10
  const stopWords = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with',
    'by','from','is','are','was','were','be','been','have','has','had',
    'do','does','did','will','would','could','should','may','might','shall',
    'that','this','these','those','it','its','he','she','they','we','you',
    'i','me','him','her','us','them','my','your','his','our','their',
    'what','which','who','whom','when','where','why','how','all','each',
    'not','no','so','if','as','up','out','about','into','than','then',
    'can','just','more','also','some','other','only','any','such','very',
  ]);
  const freq = {};
  for (const word of words) {
    // Skip tokens that look like emails or URLs before stripping — they produce
    // garbled keywords (e.g. "billingexamplecom" from "billing@example.com")
    if (/@/.test(word) || /^https?:\/\//i.test(word)) continue;
    const clean = word.toLowerCase().replace(/[^a-z'-]/g, '').replace(/^['-]+|['-]+$/g, '');
    // Skip pure stop-words, very short tokens, strings with no letters, and
    // overly long tokens (likely stripped emails/URLs losing their delimiters)
    if (clean.length > 2 && clean.length <= 20 && !stopWords.has(clean) && /[a-z]/.test(clean)) {
      freq[clean] = (freq[clean] || 0) + 1;
    }
  }
  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // ── Summary ──────────────────────────────────────────────────────────────
  // Return the first 3 complete sentences (up to 300 chars)
  let summary = '';
  if (sentences.length > 0) {
    const firstThree = sentences.slice(0, 3).map((s) => s.trim()).join(' ');
    summary = firstThree.length > 300 ? firstThree.substring(0, 300) + '...' : firstThree;
  }
  if (summary.length < 20 && trimmed.length > 0) {
    summary = trimmed.length > 300 ? trimmed.substring(0, 300) + '...' : trimmed;
  }

  return res.status(200).json({ entities, stats, keywords, summary });
}
