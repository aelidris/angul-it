import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CaptchaStateService } from '../../services/captcha-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home-container">
      <h1>Welcome to Angul-It CAPTCHA</h1>
      <p>Demonstrate you are human by solving a series of dynamic visual and logical verification stages.</p>
      <button class="btn-primary" (click)="startChallenge()">Begin Verification</button>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 600px;
      margin: 4rem auto;
      text-align: center;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      background: #ffffff;
    }
    h1 { color: #1e293b; margin-bottom: 1rem; }
    p { color: #64748b; margin-bottom: 2rem; font-size: 1.1rem; }
    .btn-primary {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #1d4ed8; }
  `]
})
export class HomeComponent {
  constructor(private stateService: CaptchaStateService, private router: Router) {}

  startChallenge(): void {
    if (this.stateService.isCompleted()) {
      this.stateService.restart();
    }
    this.router.navigate(['/captcha']);
  }
}