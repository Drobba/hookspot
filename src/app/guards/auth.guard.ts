import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { take, map, filter, tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // return authService.currentUser$.pipe(
  //   filter((currentUser) => currentUser !== undefined),
  //   map((currentUser) => {
  //     if (!currentUser) {
  //       router.navigate(['/login']);
  //       return false;
  //     }

  //     return true;
  //   })
  // )

  return authService.currentUser$.pipe(
    tap(user => console.log('1. Initial stream value:', user)),
    filter((currentUser) => currentUser !== undefined),
    tap(user => console.log('2. After filter:', user)),
    map((currentUser) => {
      console.log('3. Inside map, deciding on:', currentUser);
      if (!currentUser) {
        console.log('4. No user, redirecting to login');
        router.navigate(['/login']);
        return false;
      }
      console.log('4. User exists, allowing navigation');
      return true;
    }),
    tap(result => console.log('5. Final guard decision:', result))
  );
};
