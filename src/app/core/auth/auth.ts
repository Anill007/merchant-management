
import { Injectable, Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);

  signIn(credentials: SignInRequest): Observable<AuthResponse> {
    return of({
      accessToken: crypto.randomUUID(),
      refreshToken: crypto.randomUUID(),
    }).pipe(delay(500));
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return of({
      accessToken: crypto.randomUUID(),
    }).pipe(delay(500));
  }
}
