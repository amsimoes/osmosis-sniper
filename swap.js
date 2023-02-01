import { osmosis, FEES, getSigningOsmosisClient } from 'osmojs';
import { coin } from '@cosmjs/amino';
import { getOfflineSignerAmino, signAndBroadcast } from 'cosmjs-utils';
import Long from "long";
import { chains } from 'chain-registry';
import * as dotenv from 'dotenv';
dotenv.config();

const fee = FEES.osmosis.swapExactAmountIn('high'); // low, medium, high

const OSMOSIS_WALLET_ADDRESS = "osmo139gy38lxk6szezfew7734u0p0xmf0z04myply7";
const OSMO_TOKEN_DENOM = "uosmo";
const ATOM_TOKEN_DENOM = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
// const MARS_DENOM = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

const mnemonic = process.env.MNEMONIC;
const chain = chains.find(({ chain_name }) => chain_name === 'osmosis');
const signer = await getOfflineSignerAmino({
  mnemonic,
  chain
});

// console.log(`wtf0`);
const client = await getSigningOsmosisClient({
  rpcEndpoint: "https://osmosis-mainnet-rpc.allthatnode.com:26657",
  signer // OfflineSigner
});
// console.log(`wtf00`);

const {
  exitSwapExternAmountOut, exitSwapShareAmountIn,
  joinSwapExternAmountIn, joinSwapShareAmountOut,
  swapExactAmountIn, swapExactAmountOut
} = osmosis.gamm.v1beta1.MessageComposer.withTypeUrl;

// 1 osmo = 1,000,000 uosmo
const msg = swapExactAmountIn({
  sender: OSMOSIS_WALLET_ADDRESS,
  routes: [{ poolId: new Long(1), tokenOutDenom: ATOM_TOKEN_DENOM }],
  tokenIn: coin(1000000, OSMO_TOKEN_DENOM),
  tokenOutMinAmount: "1"
});
// console.log(`wtf2`);

const res = await signAndBroadcast({
  client, // SigningStargateClient
  chainId: 'osmosis-1', // use 'osmo-test-4' for testnet
  address: OSMOSIS_WALLET_ADDRESS,
  msgs: [msg],
  fee,
  memo: ''
});
console.log(res);