/**
 * Route guard that protects routes by checking if the user is authenticated and has verified their email.
 * Redirects unauthenticated users to login and logs out users with unverified emails.
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { take, map, filter, tap } from 'rxjs';
import { Auth, user } from '@angular/fire/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const firebaseAuth = inject(Auth);
  
  return user(firebaseAuth).pipe(
    filter((firebaseUser) => firebaseUser !== undefined),
    map((firebaseUser) => {
      if (!firebaseUser) {
        router.navigate(['/login']);
        return false;
      }

      if (!firebaseUser.emailVerified) {
        // Log out the user if email is not verified
        authService.logout().subscribe(() => {
          router.navigate(['/login'], { 
            queryParams: { 
              error: 'email-not-verified',
              message: 'Please verify your email address before continuing.'
            }
          });
        });
        return false;
      }

      return true;
    })
  );
};
