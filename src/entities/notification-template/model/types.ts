/**
 * TemplateInfo schema (OpenAPI):
 *   id (UUID), templateKey, titleTemplate, bodyTemplate, channel, createdAt, updatedAt
 */
export type TemplateChannel = 'Push' | 'InApp' | 'Both';

export interface NotificationTemplate {
  id: string;
  templateKey: string;
  titleTemplate: string;
  bodyTemplate: string;
  channel: TemplateChannel;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateCreatePayload {
  templateKey: string;
  titleTemplate: string;
  bodyTemplate: string;
  channel: TemplateChannel;
}

export type NotificationTemplateUpdatePayload = NotificationTemplateCreatePayload;
