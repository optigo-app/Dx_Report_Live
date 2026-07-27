// app/page.js
"use client";

import { Suspense, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import RouterContent from "@/Components/RouterContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      }
    >
      <RouterContent />
    </Suspense>
  );
}

// find . -mindepth 1 -delete

// Dxreport - beta - 6006 - 29   
// npm run build && pm2 restart 29 && pm2 save 

// Dxreport - live - 6010  - 28  
// npm run build && pm2 restart 28 && pm2 save 


// LIVE BETA :-       5020
// LIVE LIVE :-       5021


// R76 - 5008
// R76BETA - 5009
// R76LIVE - 5012
// R77BETA - 5015