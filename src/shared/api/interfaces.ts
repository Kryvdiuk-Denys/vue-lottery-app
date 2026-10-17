export interface Readable<T> {
  getAll(options?: { limit?: number; skip?: number; q?: string }): Promise<T[]>
  getById(id: number): Promise<T>
}

export interface Creatable<T, TCreate = Omit<T, 'id'>> {
  create(data: TCreate): Promise<T>
}

export interface Editable<T, TUpdate = Partial<Omit<T, 'id'>>> {
  update(id: number, data: TUpdate): Promise<T>
}

export interface Deletable<T> {
  delete(id: T extends { id: number } ? T['id'] : number): Promise<void>
}
