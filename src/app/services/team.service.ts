/**
 * Service for managing team operations including creation, invites, and member management.
 */
import { Injectable, inject } from "@angular/core";
import { Firestore, collection, addDoc, doc, setDoc, collectionGroup, getDocs, getDoc, updateDoc, query, where } from '@angular/fire/firestore';
import { AuthService } from "./auth.service";
import { User } from "../models/user";
import { BehaviorSubject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Auth } from "@angular/fire/auth";
import { Team } from "../models/team";
import { TeamRole } from "../enums/team-role";
import { DateService } from "./date.service";
import { Invite } from "../models/invite";
import { InviteStatus } from "../enums/invite-status";
import { UserService } from "./user.service";

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    private firestore = inject(Firestore);
    private authService = inject(AuthService);
    private dateService = inject(DateService);
    private user?: User | null;
    private teamsSubject = new BehaviorSubject<Team[]>([]);
    teams$ = this.teamsSubject.asObservable();
    private userService = inject(UserService);

    constructor() {
        this.authService.currentUser$
          .pipe(takeUntilDestroyed())
          .subscribe(user => {
            this.user = user;
      
            if (user) {
              this.updateTeams();
            } else {
              this.teamsSubject.next([]); 
            }
          });
      }
      

    async createTeam(teamName: string): Promise<void> {
        if (!this.user) {
          return;
        }
      
        try {
          const teamDocRef = await addDoc(
            collection(this.firestore, 'teams'),
            {
              name: teamName
            }
          );
      
          await setDoc(
            doc(this.firestore, `teams/${teamDocRef.id}/members/${this.user.userId}`),
            {
              role: TeamRole.Member,
              joinedAt: this.dateService.getTodayAsIsoDate(),
              userName: this.user.userName
            }
          );
          await this.updateTeams();
        } catch (error) {
          console.error('Error could not create team', error);
        }
      }
    
      async updateTeams(): Promise<void> {
        if (!this.user) {
          console.error('No user is logged in.');
          return;
        }
      
        try {
          const q = collectionGroup(this.firestore, 'members');
          const querySnapshot = await getDocs(q);
      
          const teams: Team[] = [];
      
          for (const docSnap of querySnapshot.docs) {
            if (docSnap.id === this.user.userId) {
              const segments = docSnap.ref.path.split('/');
              const teamId = segments[1];
      
              const teamDocRef = doc(this.firestore, `teams/${teamId}`);
              const teamDocSnap = await getDoc(teamDocRef);
      
              if (teamDocSnap.exists()) {
                const teamData = teamDocSnap.data();
      
                // Get team members
                const membersSnapshot = await getDocs(collection(this.firestore, `teams/${teamId}/members`));
                const members = membersSnapshot.docs.map(doc => ({
                  userId: doc.id,
                  ...doc.data()
                }));
      
                teams.push({
                  teamId,
                  ...teamData,
                  members // Add members to team object
                } as Team);
              }
            }
          }
      
          this.teamsSubject.next(teams);
        } catch (error) {
          console.error('Error fetching teams:', error);
          this.teamsSubject.next([]);
        }
      }

    private async checkExistingInvite(userId: string, teamId: string): Promise<boolean> {
        const invitesRef = collection(this.firestore, `users/${userId}/invites`);
        const q = query(invitesRef, 
            where('teamId', '==', teamId),
            where('status', '==', InviteStatus.Pending)
        );
        
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    }

    async sendInvite(toUser: User, team: Team): Promise<void> {
        if (!this.user) {
            throw new Error('No user is logged in.');
        }

        // Check if user is trying to invite themselves
        if (toUser.userId === this.user.userId) {
            throw new Error('You cannot invite yourself to a team.');
        }

        // Check if an invite already exists
        const hasExistingInvite = await this.checkExistingInvite(toUser.userId, team.teamId);
        if (hasExistingInvite) {
            throw new Error('An invite for this team already exists for this user.');
        }

        const invite: Invite = {
            userId: toUser.userId,
            teamId: team.teamId,
            teamName: team.name,
            invitedByUserId: this.user.userId,
            invitedByUserName: this.user.userName,
            status: InviteStatus.Pending,
            createdAt: this.dateService.getTodayAsIsoDate(),
        };

        try {
            const inviteRef = doc(collection(this.firestore, `users/${toUser.userId}/invites`));
            await setDoc(inviteRef, invite);
            console.log('Invite sent successfully');
        } catch (error) {
            console.error('Error sending invite:', error);
            throw error;
        }
    }
      
      async acceptInvite(invite: Invite): Promise<void> {
        if (!this.user) {
          throw new Error('No user is logged in.');
        }

        try {
          // Update invite status to accepted
          const inviteRef = doc(this.firestore, `users/${this.user.userId}/invites/${invite.inviteId}`);
          await updateDoc(inviteRef, {
            status: InviteStatus.Accepted
          });

          // Add user as member to the team
          const memberRef = doc(this.firestore, `teams/${invite.teamId}/members/${this.user.userId}`);
          await setDoc(memberRef, {
            userName: this.user.userName,
            role: TeamRole.Member,
            joinedAt: this.dateService.getTodayAsIsoDate()
          });

          await this.updateTeams();
          await this.userService.updateInvites();
        } catch (error) {
          console.error('Error accepting invite:', error);
          throw error;
        }
      }

      async declineInvite(invite: Invite): Promise<void> {
        if (!this.user) {
          throw new Error('No user is logged in.');
        }

        try {
          const inviteRef = doc(this.firestore, `users/${this.user.userId}/invites/${invite.inviteId}`);
          await updateDoc(inviteRef, {
            status: InviteStatus.Declined
          });
          await this.userService.updateInvites();
        } catch (error) {
          console.error('Error declining invite:', error);
          throw error;
        }
      }
}