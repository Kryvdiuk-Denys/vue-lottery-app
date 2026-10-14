export interface Participant {
  id: number
  name: string
  email: string
  phone: string
  dateOfBirth: string
}

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: 'name' | 'dateOfBirth'
  direction: SortDirection
}

export type ParticipantFormValues = Omit<Participant, 'id'>

export interface UserAddress {
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface UserCompany {
  name?: string
  title?: string
  department?: string
}

export interface User {
  id: number
  firstName: string
  lastName: string
  maidenName?: string
  age: number
  gender: string
  email: string
  phone: string
  username: string
  image?: string
  birthDate?: string
  address?: UserAddress
  company?: UserCompany
}

export type CreateUserDto = Pick<
  User,
  'firstName' | 'lastName' | 'email' | 'username' | 'age' | 'gender' | 'phone'
> & { password: string }

export type UpdateUserDto = Partial<CreateUserDto>

export interface UsersResponse {
  users: User[]
  total: number
  skip: number
  limit: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export type LoginResponse = User & AuthTokens

export interface LoginCredentials {
  username: string
  password: string
}
