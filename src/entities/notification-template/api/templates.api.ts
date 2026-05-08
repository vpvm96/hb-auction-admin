import { http } from '@/shared/api/http';
import type { Page, PageQuery } from '@/shared/types/api';
import type {
  NotificationTemplate,
  NotificationTemplateCreatePayload,
  NotificationTemplateUpdatePayload,
  TemplateChannel,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
} from '../model/types';

export interface TemplatesQuery extends PageQuery {
  channel?: TemplateChannel;
  keyword?: string;
}

export const templatesApi = {
  list: async (query: TemplatesQuery = {}): Promise<Page<NotificationTemplate>> => {
    const { data } = await http.get<Page<NotificationTemplate>>(
      '/internal/notification-templates',
      { params: query },
    );
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
    const { data } = await http.post<NotificationTemplate>(
      '/internal/notification-templates',
      payload,
    );
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
  preview: async (payload: TemplatePreviewRequest): Promise<TemplatePreviewResponse> => {
    const { data } = await http.post<TemplatePreviewResponse>(
      '/internal/notification-templates/preview',
      payload,
    );
    return data;
  },
};

export const templatesKeys = {
  all: ['notification-templates'] as const,
  list: (query: TemplatesQuery = {}) => [...templatesKeys.all, 'list', query] as const,
  detail: (id: string) => [...templatesKeys.all, 'detail', id] as const,
  byKey: (key: string) => [...templatesKeys.all, 'by-key', key] as const,
};
