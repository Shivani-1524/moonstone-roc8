import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import 'react-toastify/dist/ReactToastify.css';

import { api } from "~/utils/api";
import { ToastContainer } from "react-toastify";
import "~/styles/globals.css";
import Head from "next/head";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`font-sans ${inter.variable}`}>
      <Head>
        <title>Moonshot Roc8</title>
        <meta name="description" content="This is a Moonshot Test by Shivani" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer
          position="top-right"
          autoClose={8000}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          theme="light"
      />
      <Component {...pageProps} />
      
    </main>
  );
};

export default api.withTRPC(MyApp);
