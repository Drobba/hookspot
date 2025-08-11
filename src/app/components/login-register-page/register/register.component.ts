import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SpinnerService } from '../../../services/spinner.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { ViewChild } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { FirebaseError } from '@angular/fire/app';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);
  spinnerService = inject(SpinnerService);

  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;
  isSubmitted: boolean = false;
  successMessage: string | null = null;

  onSubmit(): void {
    this.spinnerService.showSpinner();
    this.isSubmitted = true;
    this.successMessage = null;
    this.errorMessage = null;
  
    // If the form is invalid – show error and abort
    if (this.form.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      this.spinnerService.hideSpinner();
      return;
    }
  
    const rawForm = this.form.getRawValue();
  
    this.authService
      .register(rawForm.email, rawForm.username, rawForm.password)
      .subscribe({
        next: () => {
          this.spinnerService.hideSpinner();
                    this.successMessage = 'Your account has been created. Check your email and click the verification link before you can log in.';
          this.errorMessage = null;

          // Reset form status and content without triggering validation errors
          this.isSubmitted = false;
          setTimeout(() => {
            this.formGroupDirective.resetForm();
          });
        },
        error: (error) => {
          this.spinnerService.hideSpinner();
          
          if (error && error instanceof FirebaseError) {
            if (error.code === 'auth/email-already-in-use') {
              this.errorMessage = 'This email address is already in use by another account.';
            } else if (error.code === 'auth/weak-password') {
              this.errorMessage = 'The password is too weak. Use at least 6 characters.';
            } else {
              console.error('Firebase error:', error);
              this.errorMessage = 'Registration failed. Please try again.';
            }
          } else {
            console.error('Unknown error:', error);
            this.errorMessage = 'Registration failed. Please try again.';
          }
        },
      });
  }
  
  
  

  isLoading(): Observable<Boolean> {
    return this.spinnerService.isLoading$;
  }


  showErrorMessage(fieldName: keyof typeof this.form.controls, errorType: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.hasError(errorType) && (control.touched || this.isSubmitted);
  }
}
