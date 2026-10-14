import { http } from '../api/http-client'
import type { LoginCredentials, LoginResponse, User } from '../types'

export class AuthService {
  login(credentials: LoginCredentials): Promise<LoginResponse> {
    return http<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, expiresInMins: 30 }),
    })
  }

  me(): Promise<User> {
    return http<User>('/auth/me')
  }
}
