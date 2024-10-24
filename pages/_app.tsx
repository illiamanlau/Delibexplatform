import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { TabStateProvider } from '../context/TabStateContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TabStateProvider>
      <Component {...pageProps} />
    </TabStateProvider>
  );
}

export default MyApp;