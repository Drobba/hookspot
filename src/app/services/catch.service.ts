import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user';
import { Catch, CrtCatchInput } from '../models/catch';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
    providedIn: 'root'
})

export class CatchService{

    private catchesSubject = new BehaviorSubject<Catch[]>([]);
    catches$ = this.catchesSubject.asObservable();
    private firestore = inject(Firestore);
    private authService = inject(AuthService);
    private user?: User | null;

    constructor() {
      this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe(user => {
        this.user = user;
        if (user) {
          this.updateCatches(); // Hämta data när user ändras
        } else {
          this.catchesSubject.next([]); // Rensa datan om ingen user är inloggad
        }
      });
      
    }


    async addCatch(newCatch: CrtCatchInput): Promise<void> {
      if (!this.user) {
        console.error('Ingen användare är inloggad.');
        return;
      }
  
      try {
        // Lägg till fångsten i Firestore
        await addDoc(collection(this.firestore, 'catches'), newCatch);
  
        // Synkronisera lokala data efter att fångsten lagts till
        await this.updateCatches();
      } catch (error) {
        console.error('Error adding catch:', error);
      }
    }

    private async updateCatches(): Promise<void> {
    if (!this.user) {
      console.error('Ingen användare är inloggad.');
      return;
    }

    const q = query(collection(this.firestore, 'catches'), where('user.userId', '==', this.user.userId));
    try {
      const querySnapshot = await getDocs(q);
      const items: Catch[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ catchId: doc.id, ...(doc.data() as Omit<Catch, 'catchId'>) });
      });
      this.catchesSubject.next(items); // Uppdatera BehaviorSubject med den nya datan
    } catch (error) {
      console.error('Error loading data:', error);
      this.catchesSubject.next([]); // Om ett fel inträffar, skicka en tom lista
    }
  }


}