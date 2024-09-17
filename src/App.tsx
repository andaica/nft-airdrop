import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./config";
import "./App.css";

import XLSXReaderPreview from "./components/XlsxPreview";
import WalletOptions from "./components/WalletOption";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="flex justify-end">
          <WalletOptions />
        </div>
        <XLSXReaderPreview />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
