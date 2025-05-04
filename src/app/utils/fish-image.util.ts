import { FishType } from '../models/fish-type';

/**
 * Returns the image path for a given fish type.
 *
 * @param fishType - The type of fish (FishType) to get the image for.
 * @returns The relative path to the image asset for the specified fish type.
 *          If the fish type is not recognized, returns the default fish image path.
 */
export function getFishImagePath(fishType: FishType): string {
  switch (fishType) {
    case 'Gädda':
      return 'assets/pike.png';
    case 'Gös':
      return 'assets/zander.png';
    case 'Abborre':
      return 'assets/perch.png';
    case 'Lax':
      return 'assets/salmon.png';
    case 'Röding':
      return 'assets/char.png';
    case 'Regnbågslax':
      return 'assets/rainbow-trout.png';
    case 'Öring':
      return 'assets/trout.png';
    default:
      return 'assets/default-fish.png';
  }
} 