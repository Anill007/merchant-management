import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-sign-in',
  styleUrl: './sign-in.scss',
  templateUrl: './sign-in.html',
})

export class SignIn {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  submitted = false;

  readonly signInForm = this.fb.nonNullable.group({
    useremail: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    this.submitted = true;

    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const {useremail, password} = this.signInForm.getRawValue();
    this.authService.signIn({email: useremail, password}).subscribe({
      next: (r) => {console.log(r)},
      error: (e) => {console.log(e)}
    })

    console.log('Sign-in form is valid');
  }
}
