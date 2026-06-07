import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { AppRouter } from "@/routes/AppRouter";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
              fontSize: "14px",
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#dc2626", secondary: "#fff" },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
