import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user';
import { CollectionReference } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);

  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    const usersRef = collection(this.firestore, 'users') as CollectionReference<User>;

    collectionData(usersRef, { idField: 'userId' }).subscribe((users) => {
      this.usersSubject.next(users);
      console.log('Här är users', this.users$);
    });
  }

  getAllUsersSnapshot(): User[] {
    return this.usersSubject.getValue();
  }
}
