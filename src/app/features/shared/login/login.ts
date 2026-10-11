import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  errorMessage = '';

  login(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage = '';

    this.auth.login({
      email: this.email.trim(),
      password: this.password
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/application-review']);
        },
        error: (error) => {
          this.errorMessage =
            error.status === 401
              ? 'Invalid email or password.'
              : 'Unable to sign in. Please try again.';
        }
      });
  }
}