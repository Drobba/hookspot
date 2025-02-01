import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { take, map, filter } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    filter(user => user !== undefined), // ignorerar alla värden som är undefined och väntar tills vi får ett definitivt tillstånd (antingen null eller en användare).
    take(1), //vid första definitiva värdet (antingen null eller en användare) avslutas observablen. Detta gör att guarden inte fortsätter lyssna och slösar resurser.
    map(user => { // använder map för att omvandla det råa värdet från observablen (user) till en boolean (true eller false), som används för att besluta om användaren får gå vidare till sidan eller inte.
      if (user === null) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};
