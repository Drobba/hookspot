import { InviteStatus } from "../enums/invite-status";

export interface Invite {
  userId: string;
  invitedBy: string;
  invitedAt: string;
  status: InviteStatus;
}
