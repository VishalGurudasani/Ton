// TonHelper.js
import TonWeb from 'tonweb';
import { Buffer } from 'buffer';

class TonHelper {
  constructor() {
    this.tonweb = new TonWeb(
      new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC')
    );
    this.jettonAddress = 'EQAl6tCdJrqlFiiLU0IZ72jQ7vtlVGGFx5twjNWEEWhsZwvc';
    this.jettonMinter = new TonWeb.token.jetton.JettonMinter(this.tonweb.provider, {
      address: this.jettonAddress
    });
  }

  async getJettonData() {
    try {
      const data = await this.jettonMinter.getJettonData();
      
      // Decode jetton content from cell
      const contentBuffer = Buffer.from(data.jetton_content.slice(2), 'hex');
      const decoder = new TextDecoder();
      const decodedContent = decoder.decode(contentBuffer);

      return {
        totalSupply: data.total_supply,
        mintable: data.mintable,
        adminAddress: data.admin_address,
        content: decodedContent,
        rawContent: data.jetton_content
      };
    } catch (error) {
      console.error('Error fetching jetton data:', error);
      throw new Error('Failed to fetch jetton data');
    }
  }

  // Format big numbers for display
  formatAmount(amount) {
    // Assuming 9 decimals for the token
    const decimals = 9;
    const bn = new TonWeb.utils.BN(amount);
    const wholePart = bn.div(new TonWeb.utils.BN(10).pow(new TonWeb.utils.BN(decimals))).toString();
    const fractionalPart = bn.mod(new TonWeb.utils.BN(10).pow(new TonWeb.utils.BN(decimals))).toString().padStart(decimals, '0');
    return `${wholePart}.${fractionalPart}`;
  }
}

export const tonHelper = new TonHelper();