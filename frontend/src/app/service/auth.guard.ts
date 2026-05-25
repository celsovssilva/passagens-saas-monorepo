import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    return true; // Usuário autenticado, pode passar
  } else {
    router.navigate(['/login']); // Sem token? Chuta de volta pro login
    return false;
  }
};
