import { Injectable, inject, signal } from '@angular/core';
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
import { from } from 'rxjs';
import { User } from '../models/user';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthSerivce {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  private currentUserSubject = new BehaviorSubject<User | null | undefined>(undefined);
  currentUser$ = this.currentUserSubject.asObservable();

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.firebaseAuth, provider).then(() => {});
    return from(promise);
  }

  //Firebase returnerar Promises och inte Observables. Vill konvertera det som returneras till Observables för att hålla intakt med att vi jobbar med observables i angular.
  register(email: string, userName: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((response) =>
      updateProfile(response.user, { displayName: userName }).then(() => 
        response.user.reload() // Ladda om användardata
      )
    );
    return from(promise);
  }
  

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {});
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
