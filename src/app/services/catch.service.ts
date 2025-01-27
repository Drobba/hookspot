import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user';
import { Catch } from '../models/catch';

@Injectable({
    providedIn: 'root'
})

export class CatchService{
    private catchesSubject = new BehaviorSubject<Catch[]>([]);
    catches$ = this.catchesSubject.asObservable();

    private firestore = inject(Firestore);

    async loadData(user: User): Promise<void> {
        const q = query(collection(this.firestore, 'catches'), where('user.userId', '==', user.userId));
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

      async addCatch(newCatch: Catch): Promise<void> {
        try {
          await addDoc(collection(this.firestore, 'catches'), newCatch);
          const currentCatches = this.catchesSubject.value;
          this.catchesSubject.next([...currentCatches, newCatch]); // Uppdatera med den nya fångsten
        } catch (error) {
          console.error('Error adding catch:', error);
        }
      }

}