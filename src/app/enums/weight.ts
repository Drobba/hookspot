export enum Weight {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  ELEVEN = 11,
  TWELVE = 12,
  THIRTEEN = 13,
  FOURTEEN = 14,
  FIFTEEN = 15,
  SIXTEEN = 16,
  SEVENTEEN = 17,
  EIGHTEEN = 18,
  NINETEEN = 19,
  TWENTY = 20,
  TWENTY_ONE = 21,
  TWENTY_TWO = 22,
  TWENTY_THREE = 23,
  TWENTY_FOUR = 24,
  TWENTY_FIVE = 25
}

export const WEIGHT_NAMES: Record<Weight, string> = {
  [Weight.ONE]: '1 kg',
  [Weight.TWO]: '2 kg',
  [Weight.THREE]: '3 kg',
  [Weight.FOUR]: '4 kg',
  [Weight.FIVE]: '5 kg',
  [Weight.SIX]: '6 kg',
  [Weight.SEVEN]: '7 kg',
  [Weight.EIGHT]: '8 kg',
  [Weight.NINE]: '9 kg',
  [Weight.TEN]: '10 kg',
  [Weight.ELEVEN]: '11 kg',
  [Weight.TWELVE]: '12 kg',
  [Weight.THIRTEEN]: '13 kg',
  [Weight.FOURTEEN]: '14 kg',
  [Weight.FIFTEEN]: '15 kg',
  [Weight.SIXTEEN]: '16 kg',
  [Weight.SEVENTEEN]: '17 kg',
  [Weight.EIGHTEEN]: '18 kg',
  [Weight.NINETEEN]: '19 kg',
  [Weight.TWENTY]: '20 kg',
  [Weight.TWENTY_ONE]: '21 kg',
  [Weight.TWENTY_TWO]: '22 kg',
  [Weight.TWENTY_THREE]: '23 kg',
  [Weight.TWENTY_FOUR]: '24 kg',
  [Weight.TWENTY_FIVE]: '25 kg'
};

export function getWeightName(weight: Weight): string {
  return WEIGHT_NAMES[weight];
}

export function getWeightByValue(value: number): Weight | undefined {
  if (value >= 1 && value <= 25) {
    return value as Weight;
  }
  return undefined;
} 