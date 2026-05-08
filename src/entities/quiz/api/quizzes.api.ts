import { http } from '@/shared/api/http';
import type { Page, PageQuery } from '@/shared/types/api';
import type { Quiz, QuizCreatePayload, QuizUpdatePayload } from '../model/types';

export const quizzesApi = {
  list: async (query: PageQuery = {}): Promise<Page<Quiz>> => {
    const { data } = await http.get<Page<Quiz>>('/internal/quizzes', { params: query });
    return data;
  },
  get: async (id: number): Promise<Quiz> => {
    const { data } = await http.get<Quiz>(`/internal/quizzes/${id}`);
    return data;
  },
  random: async (count = 3): Promise<Quiz[]> => {
    const { data } = await http.get<Quiz[]>('/internal/quizzes/random', { params: { count } });
    return data;
  },
  create: async (payload: QuizCreatePayload): Promise<Quiz> => {
    const { data } = await http.post<Quiz>('/internal/quizzes', payload);
    return data;
  },
  update: async (id: number, payload: QuizUpdatePayload): Promise<Quiz> => {
    const { data } = await http.put<Quiz>(`/internal/quizzes/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await http.delete(`/internal/quizzes/${id}`);
  },
};

export const quizzesKeys = {
  all: ['quizzes'] as const,
  list: (query: PageQuery) => [...quizzesKeys.all, 'list', query] as const,
  detail: (id: number) => [...quizzesKeys.all, 'detail', id] as const,
  random: (count: number) => [...quizzesKeys.all, 'random', count] as const,
};
