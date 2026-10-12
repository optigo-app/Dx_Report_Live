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

// Dxreport - beta - 6006 - 33   
// npm run build && pm2 restart 33 && pm2 save 

// LIVE BETA :-       5020
// LIVE LIVE :-       5021

// R76 - 5008
// R76BETA - 5009
// R76LIVE - 5012
// R77BETA - 5015


// exec sp_Generate_DynamicReport_MasterPatch_beta
// @pageid=18362