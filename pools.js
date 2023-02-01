import { osmosis } from 'osmojs';
import Long from "long";

const { createRPCQueryClient } = osmosis.ClientFactory;
const client = await createRPCQueryClient({ rpcEndpoint: "https://rpc.osmosis.zone" });

// const numPoolsResponse = await client.osmosis.gamm.v1beta1.numPools();
// const numPools = numPoolsResponse?.numPools?.getLowBits();
// console.log(numPools);

const poolDetailsResponse = await client.osmosis.gamm.v1beta1.pool({ poolId: new Long(678) });
console.dir(poolDetailsResponse.pool?.poolAssets);