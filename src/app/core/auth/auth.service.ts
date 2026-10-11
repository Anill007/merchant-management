import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import {
    catchError,
    finalize,
    map,
    switchMap,
    tap
} from 'rxjs/operators';

import {
    AuthUser,
    LoginRequest,
    LoginResponse,
    MeResponse,
    PermissionsResponse
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = 'http://localhost:5000/api';
    private readonly tokenKey = 'access_token';

    private readonly userSubject =
        new BehaviorSubject<AuthUser | null>(null);

    private readonly permissionsSubject =
        new BehaviorSubject<string[]>([]);

    private readonly initializedSubject =
        new BehaviorSubject<boolean>(false);

    readonly user$ = this.userSubject.asObservable();
    readonly permissions$ = this.permissionsSubject.asObservable();
    readonly initialized$ = this.initializedSubject.asObservable();

    private loadingSession = false;

    get token(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    get currentUser(): AuthUser | null {
        return this.userSubject.value;
    }

    get permissions(): string[] {
        return this.permissionsSubject.value;
    }

    get isAuthenticated(): boolean {
        return !!this.token && !!this.currentUser;
    }

    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(p => this.hasPermission(p));
    }

    hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(p => this.hasPermission(p));
    }

    login(credentials: LoginRequest): Observable<AuthUser> {
        return this.http
            .post<LoginResponse>(
                `${this.apiUrl}/auth/login`,
                credentials
            )
            .pipe(
                switchMap(response => {
                    localStorage.setItem(this.tokenKey, response.token);

                    // Use the login response immediately, then load
                    // authoritative user and permission state.
                    this.userSubject.next(response.user);

                    return this.loadSession().pipe(
                        map(() => {
                            if (!this.currentUser) {
                                throw new Error('Unable to initialize session');
                            }

                            return this.currentUser;
                        })
                    );
                })
            );
    }

    loadPermissions(): Observable<string[]> {
        return this.http
            .get<PermissionsResponse>(
                `${this.apiUrl}/auth/permissions`
            )
            .pipe(
                map(response => response.permissions),
                tap(permissions => {
                    this.permissionsSubject.next(permissions);
                })
            );
    }

    loadSession(): Observable<AuthUser | null> {
        return forkJoin({
            me: this.http.get<MeResponse>(
                `${this.apiUrl}/auth/me`
            ),
            permissions: this.loadPermissions()
        }).pipe(
            tap(({ me }) => {
                this.userSubject.next(me.user);
            }),
            map(({ me }) => me.user)
        );
    }

    initialize(): Observable<void> {
        if (this.loadingSession) {
            return of(undefined);
        }

        this.loadingSession = true;

        if (!this.token) {
            this.clearSession();
            this.initializedSubject.next(true);
            this.loadingSession = false;
            return of(undefined);
        }

        return this.loadSession().pipe(
            map(() => undefined),
            catchError(() => {
                this.clearSession();
                return of(undefined);
            }),
            finalize(() => {
                this.initializedSubject.next(true);
                this.loadingSession = false;
            })
        );
    }

    logout(): void {
        this.clearSession();
    }

    private clearSession(): void {
        localStorage.removeItem(this.tokenKey);
        this.userSubject.next(null);
        this.permissionsSubject.next([]);
    }
}