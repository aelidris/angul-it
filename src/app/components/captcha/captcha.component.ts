import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaptchaStateService } from '../../services/captcha-state.service';
import { Challenge } from '../../models/captcha.model';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (captchaService.currentChallenge(); as challenge) {
      <div class="captcha-wrapper">
        <div class="captcha-card">
          <div class="stage-header">
            <span class="stage-label">
              Stage {{ captchaService.currentIndex() + 1 }} of {{ captchaService.totalChallenges() }}
            </span>
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="((captchaService.currentIndex() + 1) / captchaService.totalChallenges()) * 100"
              ></div>
            </div>
          </div>

          <h2 class="instruction">{{ challenge.instruction }}</h2>

          @switch (challenge.type) {
            @case ('image-select') {
              <div class="image-grid">
                @for (img of challenge.images; track img.id) {
                  <button
                    type="button"
                    class="image-tile"
                    [class.selected]="isImageSelected(img.id)"
                    (click)="toggleImage(img.id)"
                    [attr.aria-pressed]="isImageSelected(img.id)"
                  >
                    <img [src]="img.url" [alt]="challenge.targetCategory" loading="lazy" />
                    <span class="selection-dot" aria-hidden="true"></span>
                  </button>
                }
              </div>
            }

            @case ('math') {
              <div class="input-group">
                <label class="math-question" for="mathInput">{{ challenge.question }}</label>
                <input
                  id="mathInput"
                  type="number"
                  class="text-field"
                  [ngModel]="mathAnswer()"
                  (ngModelChange)="mathAnswer.set($event)"
                  placeholder="Enter your answer"
                />
              </div>
            }

            @case ('text-input') {
              <div class="input-group">
                <div class="code-box">{{ challenge.codeToType }}</div>
                <input
                  id="textInput"
                  type="text"
                  class="text-field"
                  [ngModel]="textAnswer()"
                  (ngModelChange)="textAnswer.set($event)"
                  placeholder="Type the characters shown above"
                  autocomplete="off"
                />
              </div>
            }
          }

          @if (errorMessage()) {
            <div class="error-banner" role="alert">
              {{ errorMessage() }}
            </div>
          }

          <div class="actions">
            <button
              type="button"
              class="btn btn-secondary"
              [disabled]="captchaService.currentIndex() === 0"
              (click)="onPrevious()"
            >
              Previous
            </button>

            <button
              type="button"
              class="btn btn-primary"
              (click)="onNext()"
            >
              {{ captchaService.currentIndex() === captchaService.totalChallenges() - 1 ? 'Finish' : 'Next' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .captcha-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: #f5f7fb;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .captcha-card {
      width: 100%;
      max-width: 540px;
      background: #ffffff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    }

    .stage-header {
      margin-bottom: 1.25rem;
    }

    .stage-label {
      display: block;
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #2563eb;
      transition: width 0.25s ease;
    }

    .instruction {
      margin: 0 0 1.5rem;
      font-size: 1.35rem;
      color: #0f172a;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .image-tile {
      position: relative;
      padding: 0;
      border: 3px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      background: #f1f5f9;
      aspect-ratio: 4 / 3;
    }

    .image-tile.selected {
      border-color: #2563eb;
    }

    .image-tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .selection-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.75);
      border: 2px solid #2563eb;
    }

    .image-tile.selected .selection-dot {
      background: #2563eb;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .math-question {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .code-box {
      padding: 0.75rem 1rem;
      background: #f1f5f9;
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      font-family: monospace;
      font-size: 1.25rem;
      letter-spacing: 0.2em;
      text-align: center;
      color: #0f172a;
    }

    .text-field {
      width: 100%;
      box-sizing: border-box;
      padding: 0.7rem 0.9rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 1rem;
    }

    .text-field:focus {
      outline: none;
      border-color: #2563eb;
    }

    .error-banner {
      margin-bottom: 1.25rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      font-size: 0.925rem;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #2563eb;
      color: #ffffff;
      margin-left: auto;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #1e293b;
    }
  `]
})
export class CaptchaComponent {
  protected readonly captchaService = inject(CaptchaStateService);
  private readonly router = inject(Router);

  protected readonly selectedImageIds = signal<string[]>([]);
  protected readonly mathAnswer = signal<string>('');
  protected readonly textAnswer = signal<string>('');
  protected readonly errorMessage = signal<string>('');

  constructor() {
    effect(() => {
      const challenge = this.captchaService.currentChallenge();
      const answers = this.captchaService.userAnswers();
      this.errorMessage.set('');
      this.restoreAnswerForChallenge(challenge, answers[challenge?.id ?? '']);
    });
  }

  protected isImageSelected(imageId: string): boolean {
    return this.selectedImageIds().includes(imageId);
  }

  protected toggleImage(imageId: string): void {
    this.errorMessage.set('');
    this.selectedImageIds.update((ids) =>
      ids.includes(imageId) ? ids.filter((id) => id !== imageId) : [...ids, imageId]
    );
  }

  protected onPrevious(): void {
    this.errorMessage.set('');
    this.captchaService.previousStage();
  }

  protected onNext(): void {
    const challenge = this.captchaService.currentChallenge();
    if (!challenge) {
      return;
    }

    const answer = this.getCurrentAnswer(challenge);
    const isValid = this.captchaService.submitCurrentAnswer(answer);

    if (!isValid) {
      this.errorMessage.set('Incorrect validation response. Please try again.');
      return;
    }

    this.errorMessage.set('');
    if (this.captchaService.isCompleted()) {
      this.router.navigate(['/result']);
    }
  }

  private restoreAnswerForChallenge(challenge: Challenge | null, savedAnswer: unknown): void {
    if (!challenge) {
      this.selectedImageIds.set([]);
      this.mathAnswer.set('');
      this.textAnswer.set('');
      return;
    }

    if (challenge.type === 'image-select') {
      this.selectedImageIds.set(Array.isArray(savedAnswer) ? [...savedAnswer] : []);
      this.mathAnswer.set('');
      this.textAnswer.set('');
    } else if (challenge.type === 'math') {
      this.mathAnswer.set(savedAnswer !== undefined && savedAnswer !== null ? String(savedAnswer) : '');
      this.selectedImageIds.set([]);
      this.textAnswer.set('');
    } else if (challenge.type === 'text-input') {
      this.textAnswer.set(savedAnswer !== undefined && savedAnswer !== null ? String(savedAnswer) : '');
      this.selectedImageIds.set([]);
      this.mathAnswer.set('');
    }
  }

  private getCurrentAnswer(challenge: Challenge): unknown {
    switch (challenge.type) {
      case 'image-select':
        return this.selectedImageIds();
      case 'math':
        return this.mathAnswer();
      case 'text-input':
        return this.textAnswer();
    }
  }
}