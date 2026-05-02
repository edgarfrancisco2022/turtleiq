export type ConceptState = 'NEW' | 'LEARNING' | 'REVIEWING' | 'MEMORIZING' | 'STORED'
export type ConceptPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type SubjectSortMode = 'alpha' | 'alpha_desc' | 'date_new' | 'date_old' | 'reviews_high' | 'reviews_low' | 'custom'

export interface Subject {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Topic {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Concept {
  id: string
  userId: string
  name: string
  mvkNotes: string
  markdownNotes: string
  referencesMarkdown: string
  state: ConceptState
  priority: ConceptPriority
  reviewCount: number
  pinned: boolean
  createdAt: Date
  updatedAt: Date
  // Joined fields (populated by query, not stored in concepts table)
  subjectIds: string[]
  topicIds: string[]
  tagIds: string[]
  // Joined name fields (populated by getConcept single-concept query)
  subjectNames?: string[]
  topicNames?: string[]
  tagNames?: string[]
}

export interface StudySession {
  id: string
  userId: string
  minutes: number
  subjectId: string | null
  createdAt: Date
}

// Input types for mutations (names not IDs — server resolves/creates)
export interface ConceptInput {
  name: string
  subjectNames: string[]
  topicNames: string[]
  tagNames: string[]
  mvkNotes?: string
  markdownNotes?: string
  referencesMarkdown?: string
  state?: ConceptState
  priority?: ConceptPriority
  pinned?: boolean
}

export interface StudySessionInput {
  minutes: number
  subjectId?: string | null
}
