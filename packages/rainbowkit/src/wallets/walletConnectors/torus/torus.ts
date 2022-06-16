import Torus from '@toruslabs/torus-embed';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';

export interface TorusConnectorArguments {
  chainId: number;
  loginOptions?: any;
}

export const torus = (chains: Chain[]): Wallet => {
  return {
    createConnector: () => {
      const connector = new TorusConnector(chains);

      return {
        connector,
        mobile: {
          getUri: undefined,
        },
      };
    },
    downloadUrls: {
      android: 'https://app.tor.us/',
      browserExtension: 'https://app.tor.us/',
      ios: 'https://app.tor.us/',
    },
    iconBackground: '#0c64fc',
    iconUrl: async () => (await import('./torus.svg')).default,
    id: 'torus',
    installed: true,
    name: 'Torus',
  };
};

export class TorusConnector extends InjectedConnector {
  private provider: any = undefined;
  private torus: any = undefined;
  chains: any = undefined;
  constructor(chains: any) {
    super();
    this.chains = chains;
  }
  async getProvider(): Promise<Ethereum | undefined> {
    return this.provider;
  }

  connect = async () => {
    if (this.torus === undefined) this.torus = new Torus();
    await this.torus.init({
      network: {
        chainId: this.chains[0].id,
        host: this.chains[0].network,
      },
    });
    await this.torus.ethereum.enable();
    this.provider = this.torus.ethereum;
    const accounts: string[] = await this.provider.request({
      method: 'eth_accounts',
    });
    const chainId = await this.provider.request({ method: 'eth_chainId' });
    return {
      account: accounts[0],
      chain: {
        id: chainId,
        unsupported: false,
      },
      provider: this.provider,
    };
  };

  async disconnect(): Promise<void> {
    return await this.torus.logout();
  }
}
