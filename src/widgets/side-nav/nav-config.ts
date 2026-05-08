import {
  AlertTriangle,
  HelpCircle,
  LayoutGrid,
  Send,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';

export type NavCountKey = 'users' | 'quizzes' | 'templates' | 'errors';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  countKey?: NavCountKey;
  /** Renders a red flag-style count badge instead of the default. */
  edge?: 'flagged';
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: '개요',
    items: [{ to: ROUTES.dashboard, icon: LayoutGrid, label: '대시보드' }],
  },
  {
    title: '콘텐츠',
    items: [
      { to: ROUTES.quizzes, icon: HelpCircle, label: '퀴즈', countKey: 'quizzes' },
      { to: ROUTES.templates, icon: Send, label: '알림 템플릿', countKey: 'templates' },
    ],
  },
  {
    title: '사용자',
    items: [{ to: ROUTES.users, icon: Users, label: '사용자', countKey: 'users' }],
  },
  {
    title: '운영',
    items: [
      {
        to: ROUTES.errors,
        icon: AlertTriangle,
        label: '에러 로그',
        countKey: 'errors',
        edge: 'flagged',
      },
    ],
  },
];
