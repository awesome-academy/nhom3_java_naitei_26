import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "1.5rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <main style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              marginBottom: "1rem",
            }}
          >
            {/* Logo chiếc ví FinTrack Pro */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #004ac6, #2563eb)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 74, 198, 0.25)",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Viền ngoài ví */}
                <rect x="2" y="5" width="20" height="15" rx="3" />
                {/* Miệng nắp ví */}
                <path d="M2 9h20" />
                {/* Khóa ví */}
                <rect x="14" y="11" width="6" height="5" rx="1.5" fill="currentColor" />
                <circle cx="16.5" cy="13.5" r="0.75" fill="#004ac6" />
              </svg>
            </div>

            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#004ac6",
                letterSpacing: "-0.025em",
                margin: 0,
              }}
            >
              FinTrack Pro
            </h1>
          </div>
        </div>

        {/* Nội dung form các trang */}
        {children}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
            © 2026 FinTrack Pro. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}