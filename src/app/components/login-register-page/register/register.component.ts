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
  
    // Om formuläret är ogiltigt – visa fel och avbryt
    if (this.form.invalid) {
      this.errorMessage = 'Vänligen fyll i alla obligatoriska fält.';
      this.spinnerService.hideSpinner();
      return;
    }
  
    const rawForm = this.form.getRawValue();
  
    this.authService
      .register(rawForm.email, rawForm.username, rawForm.password)
      .subscribe({
        next: () => {
          this.spinnerService.hideSpinner();
          this.successMessage = 'Ditt konto är skapat. Kolla din mejl och klicka på verifieringslänken innan du kan logga in.';
          this.errorMessage = null;
  
          // Rensa formstatus och innehåll utan att trigga valideringsfel
          this.isSubmitted = false;
          setTimeout(() => {
            this.formGroupDirective.resetForm();
          });
        },
        error: () => {
          this.spinnerService.hideSpinner();
          this.errorMessage = 'Registreringen misslyckades. Försök igen.';
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
