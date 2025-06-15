import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user';
import { CollectionReference } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { Invite } from '../models/invite';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InviteStatus } from '../enums/invite-status';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private currentUserId?: string;

  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();
  private invitesSubject = new BehaviorSubject<Invite[]>([]);
  invites$ = this.invitesSubject.asObservable();

  constructor() {
    this.authService.currentUser$
    .pipe(takeUntilDestroyed())
    .subscribe((user: User | null | undefined) => {
      if (user) {
        this.currentUserId = user.userId;
        this.loadInvitesForUser(user.userId);
      } else {
        this.currentUserId = undefined;
        this.invitesSubject.next([]);
      }
    });
    this.loadUsers();
    console.log('Här är invites!', this.invites$);
  }

  private loadUsers() {
    const usersRef = collection(this.firestore, 'users') as CollectionReference<User>;

    collectionData(usersRef, { idField: 'userId' }).subscribe((users) => {
      this.usersSubject.next(users);
    });
  }

  getAllUsersSnapshot(): User[] {
    return this.usersSubject.getValue();
  }

  async updateInvites(): Promise<void> {
    if (this.currentUserId) {
      await this.loadInvitesForUser(this.currentUserId);
    }
  }

  private async loadInvitesForUser(userId: string): Promise<void> {
    const invitesRef = collection(this.firestore, `users/${userId}/invites`);
  
    try {
      const snapshot = await getDocs(invitesRef);
      const invites = snapshot.docs
        .map(doc => ({
          inviteId: doc.id,
          ...doc.data()
        })) as Invite[];
  
      // Filter to only show pending invites
      const pendingInvites = invites.filter(invite => invite.status === InviteStatus.Pending);
      this.invitesSubject.next(pendingInvites);
    } catch (error) {
      this.invitesSubject.next([]);
    }
  }
  
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const storage = getStorage();
    const filePath = `avatars/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    // Uppdatera användarens avatarUrl i Firestore
    const userRef = doc(this.firestore, `users/${userId}`);
    await updateDoc(userRef, { avatarUrl: downloadURL });
    return downloadURL;
  }
}
