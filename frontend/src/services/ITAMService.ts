import { AssetService } from './AssetService'

export const ITAMService = {
  async getAssetContext(assetId: string) {
    const assets = await AssetService.getAll()
    return assets.find(asset => asset.id === assetId)
  }
}
