import  { useState, useEffect } from 'react';
import { 
  TonConnectButton, 
  useTonAddress, 
  useTonConnectUI,
} from '@tonconnect/ui-react';
import { 
  Address, 
  beginCell, 
  toNano,
} from '@ton/core';
import { JettonMinter } from '../../Token/wrappers/Mycontract.ts'; // Matches your import path


const JETTON_CONTRACT_ADDRESS = 'EQAl6tCdJrqlFiiLU0IZ72jQ7vtlVGGFx5twjNWEEWhsZwvc';

const JettonDataDisplay = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [minterContract, setMinterContract] = useState(null);
  const [jettonData, setJettonData] = useState(null);
  
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // Initialize contract
  useEffect(() => {
    try {
      const minter = JettonMinter.createFromAddress(
        Address.parse(JETTON_CONTRACT_ADDRESS)
      );
      setMinterContract(minter);
    } catch (err) {
      setError('Failed to initialize contract: ' + err.message);
    }
  }, []);

  // Load jetton data
  const loadJettonData = async () => {
    if (!minterContract || !tonConnectUI.connected) return;
    
    try {
      const provider = tonConnectUI.provider;
      const data = await minterContract.getJettonData(provider);
      setJettonData(data);
    } catch (err) {
      setError('Failed to load jetton data: ' + err.message);
    }
  };

  useEffect(() => {
    loadJettonData();
  }, [minterContract, tonConnectUI.connected]);

  const handleMint = async () => {
    if (!userAddress || !minterContract) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Create the master message for minting
      const masterMessage = beginCell()
        .storeUint(0x178d4519, 32) // internal_transfer op
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(amount)) // amount
        .storeAddress(null) // from_address
        .storeAddress(Address.parse(userAddress)) // response_address
        .storeCoins(toNano('0.01')) // forward_amount
        .storeMaybeRef(null) // forward_payload
        .endCell();

      // Send mint transaction
      await minterContract.sendMint(
        tonConnectUI.provider,
        tonConnectUI.sender,
        Address.parse(userAddress),
        toNano(amount),
        masterMessage
      );

      setSuccess(`Successfully initiated minting of ${amount} MTK tokens`);
      
      // Reload jetton data after minting
      await loadJettonData();
    } catch (err) {
      setError('Failed to mint tokens: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-2">MyToken</h1>
        <p className="text-sm text-gray-600">Contract: {JETTON_CONTRACT_ADDRESS}</p>
      </div>

      <div className="mb-6">
        <TonConnectButton />
      </div>

      {userAddress && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Connected Address: {userAddress}
          </p>

          {jettonData && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md text-sm">
              <p className="mb-1">Total Supply: {jettonData.totalSupply.toString()} MTK</p>
              <p className="mb-1">Admin: {jettonData.adminAddress.toString()}</p>
              <p>Staking Enabled: {jettonData.stakingEnabled ? 'Yes' : 'No'}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Mint (MTK)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter amount"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleMint}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white ${
              loading 
                ? 'bg-gray-400' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Minting...' : 'Mint MTK Tokens'}
          </button>

          {error && (
            <p className="mt-4 text-red-600 text-sm">{error}</p>
          )}

          {success && (
            <p className="mt-4 text-green-600 text-sm">{success}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default JettonDataDisplay;