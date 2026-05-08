/**
 * QuizInfo schema (OpenAPI):
 *   id, question, choices (4 items), correctIndex (0-3), explanation, createdAt
 */
export interface Quiz {
  id: number;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  createdAt: string;
}

/** Create/Update flatten the choices array into choice1..choice4 fields. */
export interface QuizCreatePayload {
  question: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correctIndex: number;
  explanation: string;
}

export type QuizUpdatePayload = QuizCreatePayload;
