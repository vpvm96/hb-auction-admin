import { http } from '@/shared/api/http';
import type {
  NotificationTemplate,
  NotificationTemplateCreatePayload,
  NotificationTemplateUpdatePayload,
} from '../model/types';

export const templatesApi = {
  /** GET /internal/notification-templates returns a flat array (no pagination). */
  list: async (): Promise<NotificationTemplate[]> => {
    const { data } = await http.get<NotificationTemplate[]>('/internal/notification-templates');
    return data;
  },
  get: async (id: string): Promise<NotificationTemplate> => {
    const { data } = await http.get<NotificationTemplate>(`/internal/notification-templates/${id}`);
    return data;
  },
  getByKey: async (key: string): Promise<NotificationTemplate> => {
    const { data } = await http.get<NotificationTemplate>(
      `/internal/notification-templates/by-key/${key}`,
    );
    return data;
  },
  create: async (payload: NotificationTemplateCreatePayload): Promise<NotificationTemplate> => {
    const { data } = await http.post<NotificationTemplate>('/internal/notification-templates', payload);
    return data;
  },
  update: async (
    id: string,
    payload: NotificationTemplateUpdatePayload,
  ): Promise<NotificationTemplate> => {
    const { data } = await http.put<NotificationTemplate>(
      `/internal/notification-templates/${id}`,
      payload,
    );
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await http.delete(`/internal/notification-templates/${id}`);
  },
};

export const templatesKeys = {
  all: ['notification-templates'] as const,
  list: () => [...templatesKeys.all, 'list'] as const,
  detail: (id: string) => [...templatesKeys.all, 'detail', id] as const,
  byKey: (key: string) => [...templatesKeys.all, 'by-key', key] as const,
};
