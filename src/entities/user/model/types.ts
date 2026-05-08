/**
 * UserInfo schema (OpenAPI):
 *   id, email, nickname, status, agreedTermsVersion, createdAt, deletedAt
 */
export type UserStatus = 'Active' | 'Suspended' | 'Deleted';

export interface User {
  id: string;
  email: string;
  nickname: string;
  status: UserStatus;
  agreedTermsVersion: string;
  createdAt: string;
  deletedAt: string | null;
}

/** Backend `status` query param is integer (1=Active, 2=Suspended, 3=Deleted). */
export const USER_STATUS_CODE: Record<UserStatus, number> = {
  Active: 1,
  Suspended: 2,
  Deleted: 3,
};
