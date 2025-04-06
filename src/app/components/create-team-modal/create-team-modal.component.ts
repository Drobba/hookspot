import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-team-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, FontAwesomeModule],
  templateUrl: './create-team-modal.component.html',
  styleUrl: './create-team-modal.component.scss'
})
export class CreateTeamModalComponent {

  private dialogRef = inject(MatDialogRef<CreateTeamModalComponent>);
  private fb = inject(FormBuilder);
  
  closeIcon = faTimes;
  teamForm: FormGroup;

  constructor() {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  createTeam(): void {
    if (this.teamForm.valid) {
      this.dialogRef.close(this.teamForm.value.name);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
