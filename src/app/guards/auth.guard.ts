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
        // Logga ut användaren om e-post inte är verifierad
        authService.logout().subscribe(() => {
          router.navigate(['/login'], { 
            queryParams: { 
              error: 'email-not-verified',
              message: 'Vänligen verifiera din e-postadress innan du fortsätter.'
            }
          });
        });
        return false;
      }

      return true;
    })
  );
};
