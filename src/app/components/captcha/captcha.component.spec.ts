import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaptchaComponent } from './captcha.component';
import { CaptchaStateService } from '../../services/captcha-state.service';

describe('CaptchaComponent', () => {
  let component: CaptchaComponent;
  let fixture: ComponentFixture<CaptchaComponent>;
  let stateServiceSpy: jasmine.SpyObj<CaptchaStateService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    stateServiceSpy = jasmine.createSpyObj('CaptchaStateService', [
      'currentChallenge',
      'currentIndex',
      'totalChallenges',
      'submitCurrentAnswer',
      'previousStage',
      'isCompleted'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CaptchaComponent, ReactiveFormsModule],
      providers: [
        { provide: CaptchaStateService, useValue: stateServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CaptchaComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display error message when submission fails validation', () => {
    stateServiceSpy.currentChallenge.and.returnValue({
      id: 'c2',
      type: 'math',
      instruction: 'Solve 1+1',
      question: '1+1',
      correctAnswer: 2
    });
    stateServiceSpy.submitCurrentAnswer.and.returnValue(false);

    fixture.detectChanges();

    component.form.patchValue({ mathAnswer: 99 });
    component.onSubmit();

    expect(component.errorMessage).toBe('Incorrect validation response. Please try again.');
  });
});