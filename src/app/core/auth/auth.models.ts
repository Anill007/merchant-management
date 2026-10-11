export interface AuthUser {
	id: number;
	name: string;
	email: string;
	role: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	message: string;
	token: string;
	user: AuthUser;
}

export interface PermissionsResponse {
	role: string;
	permissions: string[];
}

export interface MeResponse {
	user: AuthUser;
}