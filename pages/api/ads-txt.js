/**
 * Serves /ads.txt dynamically so the Google AdSense publisher ID stays in an
 * environment variable instead of being hard-coded in a static file.
 *
 * The rewrite  /ads.txt → /api/ads-txt  is configured in next.config.js.
 *
 * Required environment variable:
 *   NEXT_PUBLIC_ADSENSE_CLIENT_ID  e.g.  ca-pub-1234567890123456
 */
export default function handler(req, res) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!clientId) {
    res.status(404).end();
    return;
  }

  // clientId is "ca-pub-XXXXXXXXXXXXXXXX"; ads.txt uses "pub-XXXXXXXXXXXXXXXX"
  const pubId = clientId.startsWith('ca-') ? clientId.slice(3) : clientId;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.end(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
}
