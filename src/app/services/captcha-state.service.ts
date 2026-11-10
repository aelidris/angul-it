import { Injectable, signal, computed } from '@angular/core';
import { Challenge, SessionState } from '../models/captcha.model';

const STORAGE_KEY = 'angul_it_session_v1';

@Injectable({
  providedIn: 'root'
})
export class CaptchaStateService {
  private state = signal<SessionState>(this.loadInitialState());

  public readonly currentChallenge = computed(() => {
    const s = this.state();
    return s.challenges[s.currentIndex] || null;
  });

  public readonly currentIndex = computed(() => this.state().currentIndex);
  public readonly totalChallenges = computed(() => this.state().challenges.length);
  public readonly isCompleted = computed(() => this.state().completed);
  public readonly canAccessResults = computed(() => this.state().completed);
  public readonly allChallenges = computed(() => this.state().challenges);

  constructor() {
    if (this.state().challenges.length === 0) {
      this.initNewSession();
    }
  }

  public initNewSession(): void {
    const challenges = this.generateRandomChallenges();
    const newState: SessionState = {
      challenges,
      currentIndex: 0,
      completed: false,
      userAnswers: {},
      sessionStartTime: Date.now()
    };
    this.saveState(newState);
  }

  public submitCurrentAnswer(answer: any): boolean {
    const currentState = this.state();
    const current = currentState.challenges[currentState.currentIndex];
    
    if (!current) return false;

    const isValid = this.validateAnswer(current, answer);
    if (!isValid) return false;

    const updatedAnswers = { ...currentState.userAnswers, [current.id]: answer };
    const isLast = currentState.currentIndex === currentState.challenges.length - 1;

    const newState: SessionState = {
      ...currentState,
      userAnswers: updatedAnswers,
      currentIndex: isLast ? currentState.currentIndex : currentState.currentIndex + 1,
      completed: isLast ? true : currentState.completed
    };

    this.saveState(newState);
    return true;
  }

  public previousStage(): void {
    const currentState = this.state();
    if (currentState.currentIndex > 0) {
      this.saveState({
        ...currentState,
        currentIndex: currentState.currentIndex - 1
      });
    }
  }

  public restart(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.initNewSession();
  }

  private validateAnswer(challenge: Challenge, answer: any): boolean {
    switch (challenge.type) {
      case 'image-select': {
        const selectedIds: string[] = Array.isArray(answer) ? answer : [];
        const targetIds = challenge.images.filter(img => img.isTarget).map(img => img.id);
        if (selectedIds.length !== targetIds.length) return false;
        return targetIds.every(id => selectedIds.includes(id));
      }
      case 'math': {
        return Number(answer) === challenge.correctAnswer;
      }
      case 'text-input': {
        return String(answer).trim().toLowerCase() === challenge.codeToType.toLowerCase();
      }
      default:
        return false;
    }
  }

  private loadInitialState(): SessionState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // Fallback on parse failure
      }
    }
    return {
      challenges: [],
      currentIndex: 0,
      completed: false,
      userAnswers: {},
      sessionStartTime: Date.now()
    };
  }

  private saveState(newState: SessionState): void {
    this.state.set(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }

  private generateRandomChallenges(): Challenge[] {
    const pool: Challenge[] = [
      {
        id: 'c1',
        type: 'image-select',
        instruction: 'Select all images containing cats',
        targetCategory: 'cats',
        images: [
          { id: 'img1', url: 'assets/cat1.jpg', isTarget: true },
          { id: 'img2', url: 'assets/dog1.jpg', isTarget: false },
          { id: 'img3', url: 'assets/cat2.jpg', isTarget: true },
          { id: 'img4', url: 'assets/car1.jpg', isTarget: false },
          { id: 'img5', url: 'assets/cat3.jpg', isTarget: true },
          { id: 'img6', url: 'assets/dog2.jpg', isTarget: false }
        ]
      },
      {
        id: 'c2',
        type: 'math',
        instruction: 'Solve the equation to verify humanity',
        question: 'What is 14 + 28?',
        correctAnswer: 42
      },
      {
        id: 'c3',
        type: 'text-input',
        instruction: 'Type the exact security code shown below',
        codeToType: 'X7k9P'
      }
    ];

    // Fisher-Yates shuffle for randomized sessions
    return pool.sort(() => Math.random() - 0.5);
  }
}