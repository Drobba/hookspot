import { Injectable, inject } from "@angular/core";
import { Firestore, collection, addDoc, doc, setDoc, collectionGroup, getDocs, getDoc } from '@angular/fire/firestore';
import { AuthService } from "./auth.service";
import { User } from "../models/user";
import { BehaviorSubject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Auth } from "@angular/fire/auth";
import { Team } from "../models/team";
import { TeamRole } from "../enums/team-role";
import { DateService } from "./date.service";

@Injectable({
    providedIn: 'root'
})
export class TeamSerivce {
    private firestore = inject(Firestore);
    private authService = inject(AuthService);
    private dateService = inject(DateService);
    private user?: User | null;
    private teamsSubject = new BehaviorSubject<Team[]>([]);
    teams$ = this.teamsSubject.asObservable();

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
          console.error('Ingen användare är inloggad.');
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
      
                // 🔥 Hämta medlemmar i teamet
                const membersSnapshot = await getDocs(collection(this.firestore, `teams/${teamId}/members`));
                const members = membersSnapshot.docs.map(doc => ({
                  userId: doc.id,
                  ...doc.data()
                }));
      
                teams.push({
                  teamId,
                  ...teamData,
                  members // 👈 lägg till medlemmar i team-objektet
                } as Team);
              }
            }
          }
      
          this.teamsSubject.next(teams);
        } catch (error) {
          console.error('Fel vid hämtning av teams:', error);
          this.teamsSubject.next([]);
        }
      }
      
      
      

}