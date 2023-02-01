import { osmosis } from 'osmojs';
import Long from "long";

const { createRPCQueryClient } = osmosis.ClientFactory;
const client = await createRPCQueryClient({ rpcEndpoint: "https://osmosis-mainnet-rpc.allthatnode.com:26657" });

// const numPoolsResponse = await client.osmosis.gamm.v1beta1.numPools();
// const numPools = numPoolsResponse?.numPools?.getLowBits();
// console.log(numPools);

const poolDetailsResponse = await client.osmosis.gamm.v1beta1.pool({ poolId: new Long(678) });
console.dir(poolDetailsResponse);
console.dir(poolDetailsResponse.pool);
console.dir(poolDetailsResponse.pool?.poolAssets);