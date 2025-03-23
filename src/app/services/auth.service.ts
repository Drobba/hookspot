import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { from, BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';
import {
  Firestore,
  doc,
  setDoc,
  getDoc
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  private firestore = inject(Firestore);

  private currentUserSubject = new BehaviorSubject<User | null | undefined>(undefined);
  currentUser$ = this.currentUserSubject.asObservable();

  user$ = user(this.firebaseAuth);

  constructor() {
    this.user$.subscribe((firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          email: firebaseUser.email!,
          userName: firebaseUser.displayName!,
          userId: firebaseUser.uid!,
        };
        this.setCurrentUser(userData);
        // this.saveUserToFirestore(userData);
      } else {
        this.setCurrentUser(null);
      }
    });
  }

  private async saveUserToFirestore(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.userId}`);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, user);
    }
  }

  loginWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.firebaseAuth, provider).then(async (response) => {
      const user = response.user;
      if (user) {
        const userData: User = {
          email: user.email!,
          userName: user.displayName!,
          userId: user.uid!,
        };
        this.setCurrentUser(userData);
        await this.saveUserToFirestore(userData);
      }
    });

    return from(promise);
  }

  register(email: string, userName: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (response) => {
        await updateProfile(response.user, { displayName: userName });
  
        const userData: User = {
          email: response.user.email!,
          userName: userName, // <-- direkt från input
          userId: response.user.uid!,
        };
  
        this.setCurrentUser(userData);
        await this.saveUserToFirestore(userData);
      });
  
    return from(promise);
  }
  
  

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (response) => {
        const user = response.user;
        if (user) {
          const userData: User = {
            email: user.email!,
            userName: user.displayName!,
            userId: user.uid!,
          };
          this.setCurrentUser(userData);
          await this.saveUserToFirestore(userData);
        }
      });

    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth).then(() => {
      this.currentUserSubject.next(null);
    });
    return from(promise);
  }

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }
}
