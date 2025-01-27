import { User } from "./user";

export interface Catch {
    user: User,
    catchId: string,
    fishType: string,
    fishWeight: number,
}

export type CrtCatchInput = Omit<Catch, 'catchId'>