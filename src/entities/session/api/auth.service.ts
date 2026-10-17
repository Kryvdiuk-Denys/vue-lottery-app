import { http } from '@/shared/api'
import type { LoginCredentials, LoginResponse, SessionUser } from '../model'

export class AuthService {
  login(credentials: LoginCredentials): Promise<LoginResponse> {
    return http<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, expiresInMins: 30 }),
    })
  }

  me(): Promise<SessionUser> {
    return http<SessionUser>('/auth/me')
  }
}
