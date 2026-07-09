import React from "react";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";

export default function ScanStatusPage() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") || "error";
  const name = params.get("name") || "Visitor";
  const msg = params.get("msg") || "An unknown scan error occurred.";

  const isSuccess = status === "checked_in" || status === "checked_out";
  const isCheckIn = status === "checked_in";

  const scanTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "radial-gradient(circle at top, #1e1b4b, #0f172a)",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <div style={{
        background: "rgba(30, 41, 59, 0.7)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${isSuccess ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 40px ${isSuccess ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}`,
        borderRadius: "16px",
        padding: "36px 24px",
        maxWidth: "440px",
        width: "100%",
        textAlign: "center",
        boxSizing: "border-box"
      }}>
        {isSuccess ? (
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              marginBottom: "24px"
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h1 style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 8px 0",
              letterSpacing: "-0.025em"
            }}>
              {isCheckIn ? "Checked In Successfully!" : "Checked Out Successfully!"}
            </h1>
            <p style={{
              fontSize: "14px",
              color: "#94a3b8",
              margin: "0 0 32px 0",
              lineHeight: 1.5
            }}>
              Welcome to the premises. Your visitor pass has been verified.
            </p>

            <div style={{
              background: "rgba(15, 23, 42, 0.6)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              textAlign: "left"
            }}>
              <div style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>Visitor</span>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#f1f5f9" }}>{name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>Status</span>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: isCheckIn ? "#10b981" : "#38bdf8",
                    background: isCheckIn ? "rgba(16, 185, 129, 0.1)" : "rgba(56, 189, 248, 0.1)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    display: "inline-block",
                    marginTop: "4px",
                    textTransform: "uppercase"
                  }}>
                    {isCheckIn ? "Onsite" : "Completed"}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>Scan Time</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#e2e8f0", display: "inline-block", marginTop: "4px" }}>{scanTime}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              marginBottom: "24px"
            }}>
              <XCircle size={36} />
            </div>

            <h1 style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 12px 0",
              letterSpacing: "-0.025em"
            }}>
              Scan Validation Error
            </h1>
            
            <div style={{
              background: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "12px",
              padding: "20px",
              color: "#fca5a5",
              fontSize: "14px",
              lineHeight: 1.6,
              textAlign: "left",
              display: "flex",
              gap: "12px"
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0, color: "#f87171" }} />
              <div>
                <span style={{ fontWeight: 600, display: "block", marginBottom: "4px", color: "#f87171" }}>Validation Failed</span>
                {msg}
              </div>
            </div>

            <p style={{
              fontSize: "12px",
              color: "#64748b",
              margin: "24px 0 0 0",
              lineHeight: 1.5
            }}>
              If you scanned the code twice by accident, wait at least 30 seconds before attempting another check-out scan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
