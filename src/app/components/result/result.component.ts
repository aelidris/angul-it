import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CaptchaStateService } from '../../services/captcha-state.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="result-card">
      <div class="success-icon">✓</div>
      <h1>Verification Complete</h1>
      <p class="subtitle">You have successfully passed all CAPTCHA challenges.</p>

      <div class="summary-list">
        <h3>Summary of Passed Stages:</h3>
        <ul>
          <li *ngFor="let c of challenges; let i = index">
            <strong>Stage {{ i + 1 }} ({{ c.type }}):</strong> Verified
          </li>
        </ul>
      </div>

      <button class="btn-restart" (click)="onRestart()">Restart Challenge</button>
    </div>
  `,
  styles: [`
    .result-card {
      max-width: 500px;
      margin: 4rem auto;
      padding: 2.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      text-align: center;
    }
    .success-icon {
      width: 60px; height: 60px; background: #dcfce7; color: #16a34a;
      border-radius: 50%; font-size: 2rem; display: flex; align-items: center;
      justify-content: center; margin: 0 auto 1rem auto;
    }
    h1 { color: #0f172a; margin-bottom: 0.5rem; }
    .subtitle { color: #64748b; margin-bottom: 2rem; }
    .summary-list { text-align: left; background: #f8fafc; padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
    .summary-list h3 { margin-top: 0; font-size: 1rem; color: #334155; }
    .summary-list ul { padding-left: 1.2rem; margin-bottom: 0; color: #475569; }
    .btn-restart {
      background: #2563eb; color: white; border: none; padding: 0.8rem 2rem;
      border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%;
    }
    .btn-restart:hover { background: #1d4ed8; }
  `]
})
export class ResultComponent {
  get challenges() {
    return this.stateService.allChallenges();
  }

  constructor(private stateService: CaptchaStateService, private router: Router) {}

  onRestart(): void {
    this.stateService.restart();
    this.router.navigate(['/home']);
  }
}