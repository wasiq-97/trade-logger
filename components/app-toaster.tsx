"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 5000,
        className:
          "!rounded-xl !border !border-[var(--line)] !bg-[var(--surface)] !text-[var(--ink)] !text-sm !shadow-lg",
        style: {
          maxWidth: "420px",
          whiteSpace: "pre-wrap",
        },
        success: {
          iconTheme: {
            primary: "var(--teal)",
            secondary: "var(--surface)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--rose)",
            secondary: "var(--surface)",
          },
          duration: 7000,
        },
      }}
    />
  );
}
