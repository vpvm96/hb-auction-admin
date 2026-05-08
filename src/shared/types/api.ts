/**
 * Generic paginated response shape.
 * The backend OpenAPI doesn't fully document the page envelope yet,
 * so we mirror the conventional Spring `Page<T>` shape used by
 * /internal endpoints. Adjust if the backend exposes a different shape.
 */
export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
}
