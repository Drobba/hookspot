import { User } from "./user";
import { Location } from "./location";

export interface Catch {
    user: User,
    catchId: string,
    fishType: string,
    fishWeight: number,
    fishLength: number,
    bait: string,
    date: string,
    location: Location,
}

export type CrtCatchInput = Omit<Catch, 'catchId'>