import "@/styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={createTheme({
      palette:{
        mode:"dark"
      }
    })}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
