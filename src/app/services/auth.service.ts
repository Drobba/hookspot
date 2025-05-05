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
    this.user$.subscribe((firebaseUser) => {
      // ⚠️ Ignorera tillfällig inloggning efter registrering
      if (this.isPostRegisterLogout) {
        this.isPostRegisterLogout = false;
        this.setCurrentUser(null);
        this.isAuthLoadedSubject.next(true);
        return;
      }

      // 👇 Endast verifierade användare tillåts vara "inloggade"
      if (firebaseUser && firebaseUser.emailVerified) {
        const userData: User = {
          email: firebaseUser.email!,
          userName: firebaseUser.displayName!,
          userId: firebaseUser.uid!,
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
            // Uppdatera namn och skicka verifieringsmail
            await updateProfile(response.user, { displayName: userName });
            await sendEmailVerification(response.user);

            const userData: User = {
              email: response.user.email!,
              userName: userName,
              userId: response.user.uid!,
            };

            await this.saveUserToFirestore(userData);

            // ⚠️ Undvik blinkande header
            this.isPostRegisterLogout = true;
            
            // Logga ut användaren efter registrering
            await signOut(this.firebaseAuth);
            this.setCurrentUser(null);
          } catch (error) {
            console.error('Error during registration process:', error);
            // Även om det blir fel i någon process efter att kontot skapats
            // vill vi inte markera hela registreringen som misslyckad
            // eftersom emailen redan är skickad
          }
        })
    ).pipe(
      catchError((error) => {
        // Här fångar vi fel i själva konto-skapandet
        console.error('Error creating account:', error);
        throw error;
      })
    );
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (response) => {
        const user = response.user;

        // 🛡️ Kontrollera verifiering
        if (user && user.emailVerified) {
          const userData: User = {
            email: user.email!,
            userName: user.displayName!,
            userId: user.uid!,
          };
          this.setCurrentUser(userData);
          await this.saveUserToFirestore(userData);
        } else {
          // Om användaren loggat in men ej verifierat
          await signOut(this.firebaseAuth);
          this.setCurrentUser(null);
          throw new Error('E-post ej verifierad. Vänligen kontrollera din inkorg.');
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
        throw new Error('Verifiera din e-postadress innan du loggar in.');
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
