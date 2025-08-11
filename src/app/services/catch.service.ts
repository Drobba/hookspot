import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { User } from '../models/user';
import { Catch, CrtCatchInput } from '../models/catch';
import { AuthService } from './auth.service';
import { TeamService } from './team.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Service responsible for managing fishing catches.
 * Handles both personal catches and catches from team members.
 * Uses Firestore for data storage and real-time updates.
 */
@Injectable({
    providedIn: 'root'
})
export class CatchService {
    // BehaviorSubject to handle the stream of catches
    private catchesSubject = new BehaviorSubject<Catch[]>([]);
    catches$ = this.catchesSubject.asObservable();

    // Injectable dependencies
    private firestore = inject(Firestore);
    private authService = inject(AuthService);
    private teamService = inject(TeamService);
    private user?: User | null;

    constructor() {
      // Subscribe to user changes and update catches when user changes
      this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe(user => {
        this.user = user;
        if (user) {
          this.updateCatches();
        } else {
          // Clear catches when user logs out
          this.catchesSubject.next([]);
        }
      });

      // Subscribe to team changes and update catches when team composition changes
      this.teamService.teams$.pipe(takeUntilDestroyed()).subscribe(() => {
        if (this.user) {
          this.updateCatches();
        }
      });
    }

    /**
     * Adds a new catch to Firestore and updates the local catch list
     * @param newCatch The catch data to be added
     */
    async addCatch(newCatch: CrtCatchInput): Promise<void> {
      if (!this.user) {
        console.error('No user is logged in');
        return;
      }
  
      try {
        await addDoc(collection(this.firestore, 'catches'), newCatch);
        await this.updateCatches();
      } catch (error) {
        console.error('Error adding catch:', error);
      }
    }

    /**
     * Updates the local catch list with catches from:
     * 1. The current user
     * 2. All members of teams that the current user belongs to
     * 
     * Uses chunking to handle Firestore's limitation of maximum 10 values in 'in' queries
     */
    private async updateCatches(): Promise<void> {
      if (!this.user) {
        console.error('No user is logged in');
        return;
      }

      try {
        // Get all teams the user is a member of
        const teams = await firstValueFrom(this.teamService.teams$);
        
        // Create a Set of user IDs to avoid duplicates
        const teamMemberIds = new Set<string>();
        teamMemberIds.add(this.user.userId); // Add current user

        // Add all team members' IDs
        teams.forEach(team => {
          if (team.members) {
            team.members.forEach(member => {
              teamMemberIds.add(member.userId);
            });
          }
        });

        // Convert Set to Array for Firestore query
        const memberIdsArray = Array.from(teamMemberIds);

        // Split member IDs into chunks of 10 (Firestore 'in' query limitation)
        const chunkSize = 10;
        const chunks = [];
        for (let i = 0; i < memberIdsArray.length; i += chunkSize) {
          chunks.push(memberIdsArray.slice(i, i + chunkSize));
        }

        // Fetch catches for each chunk and combine results
        const allCatches: Catch[] = [];
        
        for (const chunk of chunks) {
          const catchesRef = collection(this.firestore, 'catches');
          const q = query(catchesRef, where('user.userId', 'in', chunk));
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((doc) => {
            allCatches.push({
              catchId: doc.id,
              ...(doc.data() as Omit<Catch, 'catchId'>)
            });
          });
        }

        // Update the BehaviorSubject with all fetched catches
        this.catchesSubject.next(allCatches);
      } catch (error) {
        console.error('Error loading catches:', error);
        this.catchesSubject.next([]);
      }
    }

    /**
     * Tar bort en catch från Firestore och uppdaterar listan
     */
    async deleteCatch(catchId: string): Promise<void> {
      try {
        await deleteDoc(doc(this.firestore, 'catches', catchId));
        await this.updateCatches();
      } catch (error) {
        console.error('Error deleting catch:', error);
      }
    }
}