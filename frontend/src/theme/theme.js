import { createTheme } from "@mui/material/styles";

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#6366f1",
        light: "#818cf8",
        dark: "#4f46e5",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#ec4899",
        light: "#f472b6",
        dark: "#db2777",
      },
      success: { main: "#10b981" },
      warning: { main: "#f59e0b" },
      error: { main: "#ef4444" },
      info: { main: "#3b82f6" },
      background: {
        default: mode === "dark" ? "#0f172a" : "#f8fafc",
        paper: mode === "dark" ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#f1f5f9" : "#0f172a",
        secondary: mode === "dark" ? "#94a3b8" : "#64748b",
      },
      divider: mode === "dark" ? "rgba(148,163,184,0.12)" : "rgba(0,0,0,0.08)",
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: "none" },
    },
    shape: { borderRadius: 12 },
    shadows: [
      "none",
      "0px 1px 3px rgba(0,0,0,0.08)",
      "0px 2px 8px rgba(0,0,0,0.10)",
      "0px 4px 16px rgba(0,0,0,0.10)",
      "0px 8px 24px rgba(0,0,0,0.12)",
      ...Array(20).fill("0px 8px 32px rgba(0,0,0,0.14)"),
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, padding: "10px 22px", fontSize: "0.9rem" },
          contained: {
            boxShadow: "0 4px 14px 0 rgba(99,102,241,0.39)",
            "&:hover": { boxShadow: "0 6px 20px rgba(99,102,241,0.45)", transform: "translateY(-1px)" },
            transition: "all 0.2s ease",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: mode === "dark" ? "1px solid rgba(148,163,184,0.1)" : "1px solid rgba(0,0,0,0.06)",
            boxShadow: mode === "dark" ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.07)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 2 },
            },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } } },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
              fontWeight: 700,
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              backgroundColor: mode === "dark" ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.05)",
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": { backgroundColor: mode === "dark" ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.03)" },
            transition: "background-color 0.15s ease",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: "none",
            boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          },
        },
      },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 8, height: 6 } } },
    },
  });

export default getTheme;
