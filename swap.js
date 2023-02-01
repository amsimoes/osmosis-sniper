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
const USDC_TOKEN_DENOM = "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858";

const mnemonic = process.env.MNEMONIC;
const chain = chains.find(({ chain_name }) => chain_name === 'osmosis');
const signer = await getOfflineSignerAmino({
  mnemonic,
  chain
});

// console.log(`wtf0`);
const rpcClient = await osmosis.ClientFactory.createRPCQueryClient({ rpcEndpoint: "https://osmosis-mainnet-rpc.allthatnode.com:26657" });
const signClient = await getSigningOsmosisClient({
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
// const msg = swapExactAmountIn({
//   sender: OSMOSIS_WALLET_ADDRESS,
//   routes: [{ poolId: new Long(1), tokenOutDenom: ATOM_TOKEN_DENOM }],
//   tokenIn: coin(1000000, OSMO_TOKEN_DENOM),
//   tokenOutMinAmount: "1"
// });
// console.log(`wtf2`);

async function getPoolDetails (poolId) {
  const poolDetailsResponse = await rpcClient.osmosis.gamm.v1beta1.pool({ poolId: new Long(poolId) });
  console.dir(poolDetailsResponse?.pool?.poolAssets);
  return poolDetailsResponse?.pool;
}

// defaults to pool #1 ATOM/OSMO
async function calcAssetPoolPrice (poolId = 1, baseAssetDenom = "uosmo", quoteAssetDenom = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2") {
  const response = await rpcClient.osmosis.gamm.v2.spotPrice({
    poolId: new Long(poolId), 
    baseAssetDenom: quoteAssetDenom,
    quoteAssetDenom: baseAssetDenom
  });
  return response?.spotPrice;
}

async function getOsmoUsdPrice (poolId = 678) {
  const response = await rpcClient.osmosis.gamm.v2.spotPrice({
    poolId: new Long(poolId), 
    baseAssetDenom: USDC_TOKEN_DENOM, 
    quoteAssetDenom: "uosmo"
  });
  console.log(`OSMO PRICE = ${1/response.spotPrice}`);

  return response?.spotPrice ? 1 / response.spotPrice : 1;
}

// calc Price in OSMO
async function calcPoolPrice (poolAssets, tokenQuoteDenom = OSMO_TOKEN_DENOM) {
  if (poolAssets[0].token.denom == tokenQuoteDenom) { return poolAssets[0].token.amount / poolAssets[1].token.amount }
  if (poolAssets[1].token.denom == tokenQuoteDenom) { return poolAssets[1].token.amount / poolAssets[0].token.amount }
}

async function calcSlippage (poolId, tokenInAmount, tokenInDenom, slippageValue = 10) {
  let poolDetails = await getPoolDetails(poolId);
  let poolPrice = await calcPoolPrice(poolDetails.poolAssets, tokenInDenom);
  console.log(poolPrice);
}

async function buildSwapMessage (poolId, tokenInAmount, tokenInDenom, tokenOutDenom) {
  // let tokenOutMinAmount = calcSlippage(poolId, tokenInAmount, tokenInDenom); // slippage
  let tokenOutMinAmount = "1";  // virtually = 0

  const msg = swapExactAmountIn({
    sender: OSMOSIS_WALLET_ADDRESS,
    routes: [{ poolId: new Long(poolId), tokenOutDenom: tokenOutDenom }],
    tokenIn: coin(tokenInAmount, tokenInDenom),
    tokenOutMinAmount: tokenOutMinAmount  // string
  });
  return msg;
}

async function fireTx (txMsg) {
  const res = await signAndBroadcast({
    signClient, // SigningStargateClient
    chainId: 'osmosis-1', // use 'osmo-test-4' for testnet
    address: OSMOSIS_WALLET_ADDRESS,
    msgs: [txMsg],
    fee,
    memo: ''
  });
  console.log(res);
}

async function calcPriceImpact (tokenInAmount, tokenInShares, tokenOutShares, tokenOutPrice) {
  // constant product x = y*k
  let constantProduct = tokenInShares * tokenOutShares;
  // let tokenOutPrice = tokenOutPrice;

  // simulate / after swap
  let tokenInSharesAfter = tokenInShares + tokenInAmount;
  let tokenOutSharesAfter = constantProduct / tokenInSharesAfter;
  let tokenOutReceived = tokenOutShares - tokenOutSharesAfter;

  let tokenOutPricePaid = tokenInAmount / tokenOutReceived;
  
  // in %
  let priceImpact = (tokenOutPricePaid/tokenOutPrice)*100;
  console.log(priceImpact);
}

async function getSwapAmountInOsmo (marsPrice) {
  let p = marsPrice;
  if (p < 0.03) return 100;
  if (p < 0.05) return 80;
  if (p < 0.1) return 70;
  if (p < 0.2) return 60;
  if (p < 0.3) return 50;
  if (p < 0.4) return 40;
  if (p < 0.5) return 30;
  // else
  return 50;
}

async function main () {
  const MARS_DENOM = "";
  const MARS_POOL_ID = "";

  let poolDetails = await getPoolDetails(MARS_POOL_ID);
  let assetPrice = await calcAssetPoolPrice(1);
  console.log(assetPrice);

  let marsPriceInOsmo = await calcAssetPoolPrice(1);
  // let marsPriceInUsd = marsPriceInOsmo * osmoPriceInUsd
  let osmoSwapAmount = await getSwapAmountInOsmo(marsPriceInOsmo);

  let poolTokenShares = poolDetails.poolAssets[0].token.amount;
  let poolOsmoShares = poolDetails.poolAssets[1].token.amount;
  let uosmoToSwap = osmoSwapAmount * 1000000;
  let priceImpact = await calcPriceImpact(uosmoToSwap, poolOsmoShares, poolTokenShares, assetPrice);

  if (priceImpact <= 0.1) {
    let txMsg = await buildTxMessage(MARS_POOL_ID, uosmoToSwap, "uosmo", MARS_DENOM);
    await fireTx(txMsg);
  }
}

main();