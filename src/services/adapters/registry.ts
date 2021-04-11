import { ChainId } from "../../chain";
import { Address, ContractService } from "../../common";
import { Context } from "../../context";
import { structArray } from "../../struct";

import {
  Position,
  VaultStatic,
  VaultDynamic,
  VaultV2Static,
  VaultV2Dynamic
} from "../../types";

export interface IRegistryAdapter {
  assetsStatic(): Promise<VaultStatic[]>;
  assetsDynamic(): Promise<VaultDynamic[]>;
  positionsOf(address: Address): Promise<Position[]>;
}

export const RegistryV2AdapterAbi = [
  "function assetsStatic() public view returns (" +
    "tuple(address id, string typeId, string name, string version," +
    "tuple(address id, string name, string symbol, uint256 decimals) token" +
    ")[] memory" +
    ")",
  "function assetsDynamic() public view returns (" +
    "tuple(address id, address tokenId," +
    "tuple(uint256 amount, uint256 amountUsdc) underlyingTokenBalance," +
    "tuple(string symbol, uint256 pricePerShare, bool migrationAvailable, address latestVaultAddress, uint256 depositLimit, bool emergencyShutdown) metadata" +
    ")[] memory" +
    ")",
  "function positionsOf(address) public view returns (" +
    "tuple(address assetId, address tokenId, string typeId, uint256 balance," +
    "tuple(uint256 amount, uint256 amountUsdc) accountTokenBalance," +
    "tuple(uint256 amount, uint256 amountUsdc) underlyingTokenBalance," +
    "tuple(address owner, address spender, uint256 amount)[] assetAllowances," +
    "tuple(address owner, address spender, uint256 amount)[] allowances" +
    ")[] memory" +
    ")"
];

export class RegistryV2Adapter<T extends ChainId> extends ContractService
  implements IRegistryAdapter {
  static abi = RegistryV2AdapterAbi;

  constructor(chainId: T, ctx: Context) {
    super(
      ctx.address("registryV2Adapter") ??
        RegistryV2Adapter.addressByChain(chainId),
      chainId,
      ctx
    );
  }

  static addressByChain(chainId: ChainId): string {
    switch (chainId) {
      case 1: // FIXME: doesn't actually exist
      case 250:
        return "0xce29d34C8e88A2E1eDde10AD4eEE4f3e379fc041";
    }
    throw new TypeError(
      `RegistryV2Adapter does not have an address for chainId ${chainId}`
    );
  }

  async assetsStatic(): Promise<VaultV2Static[]> {
    return await this.contract.assetsStatic().then(structArray);
  }

  async assetsDynamic(): Promise<VaultV2Dynamic[]> {
    return await this.contract.assetsDynamic().then(structArray);
  }

  async positionsOf(address: Address): Promise<Position[]> {
    return await this.contract.positionsOf(address).then(structArray);
  }
}