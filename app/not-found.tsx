import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fafaf8" }}>
        <div style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "linear-gradient(160deg, #0f1c04 0%, #1e3209 60%, #2a4010 100%)",
        }}>
          <p style={{ color: "#f97316", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>
            IC IITP · Error 404
          </p>
          <h1 style={{ color: "#ffffff", fontSize: "clamp(5rem, 20vw, 10rem)", fontWeight: 900, lineHeight: 1, margin: 0 }}>
            404
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", marginTop: "1rem", marginBottom: "2.5rem", textAlign: "center", maxWidth: "36ch" }}>
            This page doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "#f97316", color: "#fff",
              padding: "0.75rem 1.75rem", borderRadius: "9999px",
              fontWeight: 700, fontSize: "0.875rem", textDecoration: "none",
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
