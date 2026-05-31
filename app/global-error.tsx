"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

// Catches errors in the root layout itself — must include <html> and <body>
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[IC IITP] Root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "linear-gradient(160deg, #0f1c04 0%, #1e3209 60%, #2a4010 100%)",
          textAlign: "center",
        }}>
          <p style={{
            color: "#fdba74", fontSize: "0.7rem", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem",
          }}>
            IC IITP · Critical Error
          </p>

          <h1 style={{ color: "#ffffff", fontWeight: 900, fontSize: "clamp(4rem, 16vw, 8rem)", lineHeight: 1, margin: 0 }}>
            500
          </h1>

          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", margin: "1.25rem 0 2rem", maxWidth: "36ch" }}>
            A critical error occurred. Please try refreshing the page.
            {error.digest && (
              <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
                Ref: {error.digest}
              </span>
            )}
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#f97316", color: "#fff",
                padding: "0.75rem 1.75rem", borderRadius: "9999px",
                fontWeight: 700, fontSize: "0.875rem",
                border: "none", cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)",
                padding: "0.75rem 1.75rem", borderRadius: "9999px",
                fontWeight: 600, fontSize: "0.875rem", textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
