import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LocaleNotFound() {
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
      {/* Dot grid */}
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
          IC IITP · Error 404
        </p>

        <h1 style={{
          color: "#ffffff", fontWeight: 900, lineHeight: 1, margin: 0,
          fontSize: "clamp(5rem, 20vw, 9rem)",
        }}>
          404
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.75)", fontSize: "1.125rem",
          marginTop: "1.25rem", marginBottom: "0.5rem", fontWeight: 600,
        }}>
          Page not found
        </p>
        <p style={{
          color: "rgba(255,255,255,0.5)", fontSize: "0.9rem",
          marginBottom: "2.5rem", lineHeight: 1.6,
        }}>
          This page doesn&apos;t exist or may have been moved.<br />
          Check the URL or head back to the homepage.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "#f97316", color: "#fff",
              padding: "0.75rem 1.75rem", borderRadius: "9999px",
              fontWeight: 700, fontSize: "0.875rem", textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>
          <Link
            href="/contact"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)",
              padding: "0.75rem 1.75rem", borderRadius: "9999px",
              fontWeight: 600, fontSize: "0.875rem", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
