import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CaptchaComponent } from './components/captcha/captcha.component';
import { ResultComponent } from './components/result/result.component';
import { resultAccessGuard } from './guards/captcha-flow.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'captcha', component: CaptchaComponent },
  { 
    path: 'result', 
    component: ResultComponent, 
    canActivate: [resultAccessGuard] 
  },
  { path: '**', redirectTo: 'home' }
];