import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CaptchaStateService } from '../../services/captcha-state.service';
import { Challenge } from '../../models/captcha.model';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="captcha-card" *ngIf="currentChallenge as challenge">
      <div class="progress-bar">
        <span>Stage {{ currentIndex + 1 }} of {{ totalChallenges }}</span>
        <div class="track">
          <div class="fill" [style.width.%]="((currentIndex + 1) / totalChallenges) * 100"></div>
        </div>
      </div>

      <h2>{{ challenge.instruction }}</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Image Select Challenge -->
        <div *ngIf="challenge.type === 'image-select'" class="image-grid">
          <div 
            *ngFor="let img of challenge.images" 
            class="grid-item"
            [class.selected]="selectedImageIds.includes(img.id)"
            (click)="toggleImageSelection(img.id)"
          >
            <div class="img-placeholder">{{ img.id }}</div>
            <div class="checkmark" *ngIf="selectedImageIds.includes(img.id)">✓</div>
          </div>
        </div>

        <!-- Math Challenge -->
        <div *ngIf="challenge.type === 'math'" class="math-box">
          <p class="equation">{{ challenge.question }}</p>
          <input 
            type="number" 
            formControlName="mathAnswer" 
            placeholder="Enter answer"
            class="form-control"
          />
        </div>

        <!-- Text Input Challenge -->
        <div *ngIf="challenge.type === 'text-input'" class="text-box">
          <div class="captcha-badge">{{ challenge.codeToType }}</div>
          <input 
            type="text" 
            formControlName="textAnswer" 
            placeholder="Type code here"
            class="form-control"
          />
        </div>

        <!-- Validation Error Feedback -->
        <div class="error-banner" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <!-- Actions -->
        <div class="action-buttons">
          <button 
            type="button" 
            class="btn-secondary" 
            [disabled]="currentIndex === 0"
            (click)="goPrevious()"
          >
            Previous
          </button>
          
          <button type="submit" class="btn-primary">
            {{ currentIndex === totalChallenges - 1 ? 'Finish' : 'Next' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .captcha-card {
      max-width: 550px;
      margin: 3rem auto;
      padding: 2rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .progress-bar { margin-bottom: 1.5rem; font-size: 0.9rem; color: #64748b; }
    .track { height: 6px; background: #e2e8f0; border-radius: 3px; margin-top: 0.4rem; }
    .fill { height: 100%; background: #2563eb; border-radius: 3px; transition: width 0.3s ease; }
    .image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 1.5rem 0; }
    .grid-item {
      height: 100px; background: #f1f5f9; border: 2px solid transparent;
      border-radius: 8px; cursor: pointer; display: flex; align-items: center;
      justify-content: center; position: relative; font-weight: bold;
    }
    .grid-item.selected { border-color: #2563eb; background: #eff6ff; }
    .checkmark { position: absolute; top: 5px; right: 8px; color: #2563eb; }
    .math-box, .text-box { margin: 1.5rem 0; text-align: center; }
    .equation { font-size: 1.4rem; font-weight: bold; color: #0f172a; }
    .captcha-badge {
      display: inline-block; padding: 0.5rem 1.5rem; background: #cbd5e1;
      letter-spacing: 4px; font-weight: bold; font-size: 1.3rem; margin-bottom: 1rem;
    }
    .form-control {
      width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1;
      border-radius: 6px; box-sizing: border-box; margin-top: 0.5rem;
    }
    .error-banner { color: #dc2626; background: #fef2f2; padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem; }
    .action-buttons { display: flex; justify-content: space-between; margin-top: 1.5rem; }
    .btn-primary, .btn-secondary { padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; border: none; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class CaptchaComponent implements OnInit {
  form!: FormGroup;
  selectedImageIds: string[] = [];
  errorMessage: string = '';

  get currentChallenge(): Challenge | null {
    return this.stateService.currentChallenge();
  }

  get currentIndex(): number {
    return this.stateService.currentIndex();
  }

  get totalChallenges(): number {
    return this.stateService.totalChallenges();
  }

  constructor(
    private fb: FormBuilder,
    private stateService: CaptchaStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      mathAnswer: [''],
      textAnswer: ['']
    });
    this.selectedImageIds = [];
    this.errorMessage = '';
  }

  toggleImageSelection(imageId: string): void {
    if (this.selectedImageIds.includes(imageId)) {
      this.selectedImageIds = this.selectedImageIds.filter(id => id !== imageId);
    } else {
      this.selectedImageIds.push(imageId);
    }
  }

  goPrevious(): void {
    this.stateService.previousStage();
    this.buildForm();
  }

  onSubmit(): void {
    const challenge = this.currentChallenge;
    if (!challenge) return;

    let payload: any;
    if (challenge.type === 'image-select') {
      payload = this.selectedImageIds;
    } else if (challenge.type === 'math') {
      payload = this.form.value.mathAnswer;
    } else if (challenge.type === 'text-input') {
      payload = this.form.value.textAnswer;
    }

    const success = this.stateService.submitCurrentAnswer(payload);

    if (success) {
      this.errorMessage = '';
      if (this.stateService.isCompleted()) {
        this.router.navigate(['/result']);
      } else {
        this.buildForm();
      }
    } else {
      this.errorMessage = 'Incorrect validation response. Please try again.';
    }
  }
}