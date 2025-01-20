import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthSerivce } from '../../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerService } from '../../../services/spinner.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthSerivce);
  router = inject(Router);
  spinnerService = inject(SpinnerService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;
  isSubmitted = false;

  onSubmit(): void {
    this.isSubmitted = true;
    this.spinnerService.showSpinner();

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.spinnerService.hideSpinner();
      return;
    }
    const rawForm = this.form.getRawValue();
    this.authService.login(rawForm.email, rawForm.password).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
        this.spinnerService.hideSpinner();
      },
      error: (err) => {
        this.errorMessage = err.code;
        this.spinnerService.hideSpinner();
      },
    });
  }

  isLoading(): Observable<boolean> {
    return this.spinnerService.isLoading$;
  }

  showErrorMessage(fieldName: keyof typeof this.form.controls, errorType: string): boolean {
    const control = this.form.get(fieldName);
    console.log('control', control);
    return !!control && control.hasError(errorType) && (control.touched || this.isSubmitted);
  }
}
