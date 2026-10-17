import { http } from '@/shared/api'
import type { Creatable, Deletable, Editable, Readable } from '@/shared/api'
import type { CreateUserDto, UpdateUserDto, User, UsersResponse } from '../model'

export class UserService
  implements Readable<User>, Creatable<User, CreateUserDto>, Editable<User, UpdateUserDto>, Deletable<User>
{
  async getAll(options: { limit?: number; skip?: number; q?: string } = {}): Promise<User[]> {
    return (await this.getPage(options)).users
  }

  async getPage({ limit = 10, skip = 0, q = '' } = {}): Promise<UsersResponse> {
    const query = new URLSearchParams({ limit: String(limit), skip: String(skip) })
    const endpoint = q ? `/users/search?q=${encodeURIComponent(q)}&${query}` : `/users?${query}`
    return http<UsersResponse>(endpoint)
  }

  getById(id: number): Promise<User> {
    return http<User>(`/users/${id}`)
  }

  create(data: CreateUserDto): Promise<User> {
    return http<User>('/users/add', { method: 'POST', body: JSON.stringify(data) })
  }

  update(id: number, data: UpdateUserDto): Promise<User> {
    return http<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async delete(id: number): Promise<void> {
    await http<User>(`/users/${id}`, { method: 'DELETE' })
  }
}
