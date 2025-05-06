import { HttpClient } from '@angular/common/http';
import { Component, inject, NgZone } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerService } from '../../../services/spinner.service';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FontAwesomeModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);
  spinnerService = inject(SpinnerService);
  ngZone = inject(NgZone);
  faGoogle = faGoogle;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;
  isSubmitted = false;
  
  // Separate loading states for each button
  private isFormLoginLoading = new BehaviorSubject<boolean>(false);
  private isGoogleLoginLoading = new BehaviorSubject<boolean>(false);
  private googlePopupTimeoutId: any = null;

  onSubmit(): void {
    this.isSubmitted = true;
    this.isFormLoginLoading.next(true);

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.isFormLoginLoading.next(false);
      return;
    }
    const rawForm = this.form.getRawValue();
    this.authService.login(rawForm.email, rawForm.password).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
        this.isFormLoginLoading.next(false);
      },
      error: (err) => {
        this.errorMessage = err.code;
        this.isFormLoginLoading.next(false);
      },
    });
  }

  isLoading(): Observable<boolean> {
    return this.spinnerService.isLoading$;
  }
  
  isFormLoading(): Observable<boolean> {
    return this.isFormLoginLoading.asObservable();
  }
  
  isGoogleLoading(): Observable<boolean> {
    return this.isGoogleLoginLoading.asObservable();
  }

  showErrorMessage(fieldName: keyof typeof this.form.controls, errorType: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.hasError(errorType) && (control.touched || this.isSubmitted);
  }

  onGoogleLogin(event?: Event): void {
    // Prevent default form submission if called from a button
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Don't mark form as submitted to avoid validation
    this.isSubmitted = false;
    
    // Set a timeout to detect popup cancellation
    // This is needed because Google auth popup cancellation doesn't always trigger an error
    this.clearGoogleTimeout();
    this.isGoogleLoginLoading.next(true);
    
    this.googlePopupTimeoutId = setTimeout(() => {
      this.ngZone.run(() => {
        this.isGoogleLoginLoading.next(false);
      });
    }, 30000); // 30-second timeout
    
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.clearGoogleTimeout();
        this.router.navigateByUrl('/');
        this.isGoogleLoginLoading.next(false);
      },
      error: (err) => {
        this.clearGoogleTimeout();
        // Set error message only if there's an actual error (not just popup closure)
        if (err && err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
          this.errorMessage = err.code;
        }
        this.isGoogleLoginLoading.next(false);
      },
      complete: () => {
        this.clearGoogleTimeout();
        this.isGoogleLoginLoading.next(false);
      }
    });
    
    // Add a listener to detect when focus returns to the window
    // (a good indication that the popup was closed)
    const focusListener = () => {
      // Small delay to allow for auth flow to complete if successful
      setTimeout(() => {
        this.ngZone.run(() => {
          this.isGoogleLoginLoading.next(false);
        });
      }, 1000);
      window.removeEventListener('focus', focusListener);
    };
    window.addEventListener('focus', focusListener);
  }
  
  private clearGoogleTimeout(): void {
    if (this.googlePopupTimeoutId) {
      clearTimeout(this.googlePopupTimeoutId);
      this.googlePopupTimeoutId = null;
    }
  }
}
