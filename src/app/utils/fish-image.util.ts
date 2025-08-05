import { FishType } from '../enums/fish-type';


const fishImagePaths: Record<FishType, string> = {
  Gädda: 'assets/pike.png',
  Gös: 'assets/zander.png',
  Abborre: 'assets/perch.png',
  Lax: 'assets/salmon.png',
  Röding: 'assets/char.png',
  Regnbågslax: 'assets/rainbow-trout.png',
  Öring: 'assets/trout.png',
  Harr: 'assets/Harr.png',
  Sej: 'assets/pollock.png',
  Makrill: 'assets/mackerel.png',
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
