"use client";

import { RecoilRoot } from "recoil";
import { DeviceStatusProvider } from "@/Components/DeviceStatusContext/DeviceStatusContext";
import { getClientIpAddress } from "@/Utils/globalFunc";
import { useEffect } from "react";
import Script from "next/script";
import { Poppins ,Montserrat ,Geist ,Google_Sans } from 'next/font/google'
import "./globals.scss";

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display:'swap',
  fallback: ['Arial', 'sans-serif'],
});

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const googleSans = Google_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-google-sans',
  weight: [ '400', '500', '700'],
});




export default function RootLayout({ children }) {

  useEffect(() => {
    getClientIpAddress();
  }, []);

  return (
    <html lang="en"
      className={`${poppins.variable} ${geist.variable} ${googleSans.variable}`}
      >
      {/* // ${montserrat.variable} */}
      <head>
       
        <Script
          src="https://code.jquery.com/jquery-1.7.2.min.js"
          strategy="beforeInteractive"
        />
        <Script id="jquery-global" strategy="beforeInteractive">
          {`
            window.$ = window.jQuery;
          `}
        </Script>
        <Script id="safe-parent" strategy="beforeInteractive">
          {`
            try {
              if (window.parent && window.parent.$) {
                window.$ = window.parent.$;
              }
            } catch(e) {
              console.warn("Cross-origin blocked, using local jQuery");
            }
          `}
        </Script>

      </head>

      <body>
        <RecoilRoot>
          <DeviceStatusProvider>
            {children}
          </DeviceStatusProvider>
        </RecoilRoot>
      </body>
    </html>
  );
}