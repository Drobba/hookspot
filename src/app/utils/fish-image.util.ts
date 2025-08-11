import { FishType } from '../enums/fish-type';


const fishImagePaths: Record<FishType, string> = {
  Gädda: 'assets/fish-images/pike.png',
  Gös: 'assets/fish-images/zander.png',
  Abborre: 'assets/fish-images/perch.png',
  Lax: 'assets/fish-images/salmon.png',
  Röding: 'assets/fish-images/char.png',
  Regnbågslax: 'assets/fish-images/rainbow-trout.png',
  Öring: 'assets/fish-images/trout.png',
  Harr: 'assets/fish-images/Harr.png',
  Sej: 'assets/fish-images/pollock.png',
  Makrill: 'assets/fish-images/mackerel.png',
};

/**
 * Returns the image path for a given fish type.
 *
 * @param fishType - The type of fish (FishType) to get the image for.
 * @returns The relative path to the image asset for the specified fish type.
 *          If the fish type is not recognized, returns the default fish image path.
 */
export function getFishImagePath(fishType: FishType): string {
  return fishImagePaths[fishType] ?? 'assets/default-fish.png';
}
