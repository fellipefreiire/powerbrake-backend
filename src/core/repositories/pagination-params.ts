export interface PaginationParams {
  page?: number
  perPage?: number
}

export interface PaginationMeta {
  total: number
  count: number
  perPage: number
  totalPages: number
  currentPage: number
  nextPage: number | null
  previousPage: number | null
}

export type CursorPaginationParams = {
  cursor?: string
  limit: number
}

export type CursorPaginationMeta = {
  count: number
  hasNextPage: boolean
  nextCursor?: string | null
}
