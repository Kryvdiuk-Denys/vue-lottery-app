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
