export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export type ApiError = {
    code: string,
    message: string
}

export type Error = {
    error: {
        code: string,
        message: string,
    }
}


export interface CreateUser {
    email: string,
    password: string,
    display_name: string,
}

export interface User {
    id: string,
    email: string,
    display_name: string,
}

export interface UserSession {
    user: User,
    access_token: string,
    refresh_token: string,
    token_type: string,
    expires_in: string,
}