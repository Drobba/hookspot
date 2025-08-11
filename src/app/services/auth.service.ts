import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
  user,
} from '@angular/fire/auth';
import { from, BehaviorSubject, Observable, catchError } from 'rxjs';
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

  private isAuthLoadedSubject = new BehaviorSubject<boolean>(false);
  isAuthLoaded$ = this.isAuthLoadedSubject.asObservable();

  private isPostRegisterLogout = false;

  user$ = user(this.firebaseAuth);

  constructor() {
    this.user$.subscribe(async (firebaseUser) => {
      // Ignore temporary login after registration
      if (this.isPostRegisterLogout) {
        this.isPostRegisterLogout = false;
        this.setCurrentUser(null);
        this.isAuthLoadedSubject.next(true);
        return;
      }

      // Only verified users are allowed to be "logged in"
      if (firebaseUser && firebaseUser.emailVerified) {
        const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
        const docSnap = await getDoc(userRef);
        const data = docSnap.data();
        const userData: User = {
          email: firebaseUser.email!,
          userName: firebaseUser.displayName!,
          userId: firebaseUser.uid!,
          avatarUrl: data ? data['avatarUrl'] : undefined
        };
        this.setCurrentUser(userData);
      } else {
        this.setCurrentUser(null);
      }

      this.isAuthLoadedSubject.next(true);
    });
  }

  private async saveUserToFirestore(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.userId}`);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, user);
    }
  }

  register(email: string, userName: string, password: string): Observable<void> {
    return from(
      createUserWithEmailAndPassword(this.firebaseAuth, email, password)
        .then(async (response) => {
                  try {
          // Update name and send verification email
          await updateProfile(response.user, { displayName: userName });
          await sendEmailVerification(response.user);

          const userData: User = {
            email: response.user.email!,
            userName: userName,
            userId: response.user.uid!,
          };

          await this.saveUserToFirestore(userData);

          // Avoid flickering header
          this.isPostRegisterLogout = true;
          
          // Log out user after registration
          await signOut(this.firebaseAuth);
          this.setCurrentUser(null);
        } catch (error) {
          console.error('Error during registration process:', error);
          // Even if there's an error in some process after the account is created
          // mark the entire registration as failed since the email has already been sent
        }
        })
    ).pipe(
      catchError((error) => {
        // Catch errors in the actual account creation
        console.error('Error creating account:', error);
        throw error;
      })
    );
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (response) => {
        const user = response.user;

        // Check verification
        if (user && user.emailVerified) {
          const userData: User = {
            email: user.email!,
            userName: user.displayName!,
            userId: user.uid!,
          };
          this.setCurrentUser(userData);
          await this.saveUserToFirestore(userData);
        } else {
          // If user logged in but not verified
          await signOut(this.firebaseAuth);
          this.setCurrentUser(null);
          throw new Error('Email not verified. Please check your inbox.');
        }
      });

    return from(promise);
  }

  loginWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.firebaseAuth, provider).then(async (response) => {
      const user = response.user;
      if (user && user.emailVerified) {
        const userData: User = {
          email: user.email!,
          userName: user.displayName!,
          userId: user.uid!,
        };
        this.setCurrentUser(userData);
        await this.saveUserToFirestore(userData);
      } else {
        await signOut(this.firebaseAuth);
        this.setCurrentUser(null);
        throw new Error('Verify your email address before logging in.');
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
