
const res = await signAndBroadcast({
  client: stargateClient,
  chainId: argv.chainId, // e.g. 'osmosis-1'
  address,
  msg,
  fee,
  memo: ''
});

const { createRPCQueryClient } = osmosis.ClientFactory;
const client = await createRPCQueryClient({ rpcEndpoint: "https://rpc.osmosis.zone" });
const chain = chains.find(({ chain_name }) => chain_name === 'osmosis');
const signer = await getOfflineSigner({
  mnemonic,
  chain
});

POOL 1
const response = await client.osmosis.gamm.v1beta1.pools();
console.dir(response);