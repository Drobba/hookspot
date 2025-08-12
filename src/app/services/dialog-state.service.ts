/**
 * Service for managing global dialog state across the application.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogStateService {
  public addCatchDialogOpen$ = new BehaviorSubject<boolean>(false);
} 