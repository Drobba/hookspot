import { InviteStatus } from "../enums/invite-status";

export interface Invite {
  userId: string; 
  teamId: string;
  teamName: string;
  invitedByUserId: string;
  invitedByUserName: string;
  status: InviteStatus
  createdAt: string;
  inviteId?: string;
}
