import { http, createConfig } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { injected, safe, walletConnect } from "wagmi/connectors";

const projectId = "8c9412e7df78dfc213b9d88f87b1d6d6";

export const config = createConfig({
  chains: [avalanche, avalancheFuji],
  connectors: [injected(), walletConnect({ projectId }), safe()],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
});
