"use client";

import { RecoilRoot } from "recoil";
import { DeviceStatusProvider } from "@/Components/DeviceStatusContext/DeviceStatusContext";
import { getClientIpAddress } from "@/Utils/globalFunc";
import { useEffect } from "react";
import Script from "next/script";
import { Poppins ,Montserrat } from 'next/font/google'
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

export default function RootLayout({ children }) {

  useEffect(() => {
    getClientIpAddress();
  }, []);

  return (
    <html lang="en"
      className={`${poppins.variable}
      `}
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
        <Script
          src="/js/flexigrid_advance.js"
          strategy="afterInteractive"
        />

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