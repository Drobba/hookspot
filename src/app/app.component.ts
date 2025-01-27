import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { LoginRegisterPageComponent } from './components/login-register-page/login-register-page.component';
import { Firestore, collection, addDoc, collectionData, query, where, getDoc, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CrtCatchInput } from './models/catch';
import { User } from './models/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    HeaderComponent,
    MatButtonModule,
    FormsModule,
    CommonModule,
    MatCardModule,
    MatTabsModule,
    LoginRegisterPageComponent
  ], // Lägg till HeaderComponent här
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Ändrat till styleUrls
})
export class AppComponent {
  title = 'hookspot';

  authService = inject(AuthService);
  private firestore = inject(Firestore);
  fiskArt = '';
  vikt = '';
  items$: Observable<any[]> = new Observable<any[]>();
  user?: User | null;

  constructor() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.authService.setCurrentUser({
          email: user.email!,
          userName: user.displayName!,
          userId: user.uid!,
        });
      } else {
        this.authService.setCurrentUser(null); //Sätter till null om vi inte har loggat in än. Vill bara spara värdet av en user om vi loggat in.
      }
    });
    this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe(user => this.user = user);
    console.log('Här är user!', this.user);
    this.authService.user$.subscribe((user) => {
      if (user) {
        const itemsCollection = collection(this.firestore, 'catches');
        const userItemsQuery = query(collection(this.firestore, 'catches'), where('user.userId', '==', user.uid));
        this.items$ = collectionData(userItemsQuery, { idField: 'id' });
      }
    });
  }

  ngOnInit(): void {

  }




  async addItem(): Promise<void> {
    console.log('Här är user igen:', this.user);
    if (!this.user) {
      return;
    }
    const newCatch: CrtCatchInput = {
      fishType: this.fiskArt,
      fishWeight: parseFloat(this.vikt),
      user: {
        email: this.user.email,
        userName: this.user.userName,
        userId: this.user.userId
      }
    }
    try {
      const docRef = await addDoc(collection(this.firestore, "catches"), newCatch);
      this.fiskArt = '';
      this.vikt = '';
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async loadData(user: any) {
    const q = query(collection(this.firestore, "catches"), where("userId", "==", user.userId));
    try {
      const querySnapshot = await getDocs(q);
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() }); // Hämta varje dokument och dess data
      });
  
      // Uppdatera en lokal lista
      return items; // Antar att du har deklarerat en lokal variabel "items"
    } catch (error) {
      console.error("Error loading data: ", error);
      return []; // Return an empty array in case of error
    }
  }
  

  logout(): void {
    this.authService.logout();
  }
}
