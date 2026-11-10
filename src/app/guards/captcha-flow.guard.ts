import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CaptchaStateService } from '../services/captcha-state.service';

export const resultAccessGuard: CanActivateFn = () => {
  const stateService = inject(CaptchaStateService);
  const router = inject(Router);

  if (stateService.canAccessResults()) {
    return true;
  }

  router.navigate(['/captcha']);
  return false;
};