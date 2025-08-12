import { Member } from './member';
import { Invite } from './invite';

export interface Team {
  teamId: string;
  name: string;

  // Optional – used e.g. when loading team + members in a view
  members?: Member[];
  invites?: Invite[];
}
