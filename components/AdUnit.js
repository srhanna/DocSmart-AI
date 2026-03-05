import { useEffect, useRef } from 'react';

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const ADSENSE_SLOT_ID = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

/**
 * AdUnit renders a single Google AdSense display ad.
 *
 * It is only shown when both NEXT_PUBLIC_ADSENSE_CLIENT_ID and
 * NEXT_PUBLIC_ADSENSE_SLOT_ID are set.  The component calls
 * (adsbygoogle = window.adsbygoogle || []).push({}) once after mount so that
 * the ad is filled by the AdSense script loaded in _app.js.
 *
 * Props:
 *   format   – AdSense format string, defaults to "auto"
 *   style    – inline style object merged into the <ins> element
 *   className – extra CSS class names
 */
export default function AdUnit({ format = 'auto', style = {}, className = '' }) {
  const insRef = useRef(null);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || !ADSENSE_SLOT_ID) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn('[AdUnit] adsbygoogle.push failed:', err);
    }
  }, []);

  if (!ADSENSE_CLIENT_ID || !ADSENSE_SLOT_ID) return null;

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle${className ? ` ${className}` : ''}`}
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={ADSENSE_SLOT_ID}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
