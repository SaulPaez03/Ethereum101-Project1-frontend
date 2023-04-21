import "@/styles/globals.css";
import Head from "next/head";
import { ThemeProvider, createTheme } from "@mui/material";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>DAPP</title>
      </Head>
      <ThemeProvider
        theme={createTheme({
          palette: {
            mode: "dark",
          },
        })}
      >
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
