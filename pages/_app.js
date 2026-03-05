import '../styles/globals.css';
import Script from 'next/script';

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function App({ Component, pageProps }) {
  return (
    <>
      {ADS_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ADS_ID}');
            `}
          </Script>
        </>
      )}
      <Component {...pageProps} />
    </>
  );
}