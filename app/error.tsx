"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[IC IITP] Unhandled error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100svh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)",
    }}>
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div style={{ position: "relative", textAlign: "center", maxWidth: "480px" }}>
        <p style={{
          color: "#fdba74", fontSize: "0.7rem", fontWeight: 700,
          letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem",
        }}>
          IC IITP · Error 500
        </p>

        <h1 style={{
          color: "#ffffff", fontWeight: 900, lineHeight: 1, margin: 0,
          fontSize: "clamp(5rem, 20vw, 9rem)",
        }}>
          500
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.75)", fontSize: "1.125rem",
          marginTop: "1.25rem", marginBottom: "0.5rem", fontWeight: 600,
        }}>
          Something went wrong
        </p>
        <p style={{
          color: "rgba(255,255,255,0.5)", fontSize: "0.9rem",
          marginBottom: "2.5rem", lineHeight: 1.6,
        }}>
          An unexpected error occurred. You can try again<br />
          or return to the homepage.
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
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "#f97316", color: "#fff",
              padding: "0.75rem 1.75rem", borderRadius: "9999px",
              fontWeight: 700, fontSize: "0.875rem",
              border: "none", cursor: "pointer",
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)",
              padding: "0.75rem 1.75rem", borderRadius: "9999px",
              fontWeight: 600, fontSize: "0.875rem", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
