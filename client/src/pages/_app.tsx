import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AppShell } from '../components/layout/AppShell';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>CampusResolve - College Complaint Management System</title>
        <meta
          name="description"
          content="Centralized digital grievance redressal portal for college students, department heads, and campus administration."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
    </>
  );
}
