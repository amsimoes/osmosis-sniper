import { osmosis } from 'osmojs';
import Long from "long";
import { chains } from 'chain-registry';
import * as dotenv from 'dotenv';
import { getOfflineSignerAmino as getOfflineSigner } from 'cosmjs-utils';
import { 
  getWalletFromMnemonic, getSigningOsmosisClient, signAndBroadcast, lookupRoutesForTrade, getPoolsPricesPairs, calculateAmountWithSlippage
} from '@cosmology/core';
import { FEES } from 'osmojs';
import { coin } from '@cosmjs/amino';

const {
  swapExactAmountIn
} = osmosis.gamm.v1beta1.MessageComposer.withTypeUrl;

const fee = FEES.osmosis.swapExactAmountIn('high'); // low, medium, high

dotenv.config();

const mnemonic = process.env.MNEMONIC;

const signer = await getWalletFromMnemonic({mnemonic, token: 'OSMO'});
const rpcClient = await osmosis.ClientFactory.createRPCQueryClient({ rpcEndpoint: "https://rpc.osmosis.zone" });
const client = await getSigningOsmosisClient({
  rpcEndpoint: "https://rpc.osmosis.zone",
  signer
});

const {
  pools,
  prices,
  pairs,
  prettyPools
} = await getPoolsPricesPairs(rpcClient);

// const routes = lookupRoutesForTrade({
//   pools,
//   trade: {
//     sell: {
//       denom: tokenIn.denom,
//       amount: tokenInAmount
//     },
//     buy: {
//       denom: tokenOut.denom,
//       amount: tokenOutAmount
//     },
//     beliefValue: value
//   },
//   pairs
// }).map((tradeRoute) => {
//   const {
//     poolId,
//     tokenOutDenom
//   } = tradeRoute;
//   return {
//     poolId,
//     tokenOutDenom
//   };
// });

// const OSMO_USDC_POOL_ID = 678;
// const ATOM_OSMO_POOL_ID = 1;

// async function getOsmosisUsdPrice () {
//   const osmoUsd = await client.osmosis.gamm.v2.spotPrice({
//     poolId: new Long(678), 
//     baseAssetDenom: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858", 
//     quoteAssetDenom: "uosmo"
//   });
  
//   return osmoUsd.spotPrice ?? null;
// }

// async function getAssetPoolPrice (poolId) {
//   const response2 = await client.osmosis.gamm.v2.spotPrice({
//     poolId: new Long(1), 
//     baseAssetDenom: "uosmo", 
//     quoteAssetDenom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
//   });
// }

// async function getPoolInfo (poolId) {
//   const poolDetailsResponse = await client.osmosis.gamm.v1beta1.pool({ 
//     poolId: new Long(poolId) 
//   });
//   console.dir(poolDetailsResponse.pool.poolAssets);
// }

// function main () {
//   console.log(pools);
//   console.log(prices);
// }

// main();