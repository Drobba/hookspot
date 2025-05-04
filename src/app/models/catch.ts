import { User } from "./user";
import { Location } from "./location";
import { FishType } from "./fish-type";

export interface Catch {
    user: User,
    catchId: string,
    fishType: FishType,
    fishWeight: number,
    fishLength: number,
    bait: string,
    date: string,
    location: Location,
    imageUrl?: string,
}

export type CrtCatchInput = Omit<Catch, 'catchId'>