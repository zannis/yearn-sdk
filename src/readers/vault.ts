import { Apy } from "../services/apy";
import { Position, Vault } from "../types";
import { ChainId } from "../chain";
import { Address, Reader, SdkError } from "../common";

export class VaultReader<T extends ChainId> extends Reader<T> {
  async get(): Promise<Vault[]> {
    const adapters = Object.values(this.yearn.services.lens.adapters.vaults);
    return await Promise.all(
      adapters.map(async adapter => {
        const assetsStatic = await adapter.assetsStatic();
        const assetsDynamic = await adapter.assetsDynamic();
        const assets = new Array<Vault>();
        for (const asset of assetsStatic) {
          const dynamic = assetsDynamic.find(({ id }) => asset.id === id);
          if (!dynamic) {
            throw new SdkError(`Dynamic asset does not exist for ${asset.id}`);
          }
          assets.push({ ...asset, ...dynamic });
        }
        return assets;
      })
    ).then(arr => arr.flat());
  }

  async positionsOf(address: Address): Promise<Position[]> {
    const adapters = Object.values(this.yearn.services.lens.adapters.vaults);
    return await Promise.all(
      adapters.map(adapter => {
        return adapter.positionsOf(address);
      })
    ).then(arr => arr.flat());
  }

  async apy(address: Address): Promise<Apy | undefined> {
    return this.yearn.services.apy.get(address);
  }
}