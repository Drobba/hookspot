import { Member } from './member';
import { Invite } from './invite';

export interface Team {
  teamId: string;
  name: string;

  // Valfria – används t.ex. om du laddar team + medlemmar i en vy
  members?: Member[];
  invites?: Invite[];
}
