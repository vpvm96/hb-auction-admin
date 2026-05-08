/**
 * ErrorLogInfo schema (OpenAPI):
 *   id, method, uri, status, errorCode, message, stackTrace, requestBody, createdAt
 */
export interface ErrorLog {
  id: number;
  method: string;
  uri: string;
  status: number;
  errorCode: string;
  message: string;
  stackTrace: string;
  requestBody: string;
  createdAt: string;
}
