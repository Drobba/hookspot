import { TeamRole } from "../enums/team-role";

export interface Member {
    userId: string;
    userName: string;
    role: TeamRole;
    joinedAt: string;
}