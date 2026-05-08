import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Hash, RefreshCw, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import { fmtDateTime } from '@/shared/lib/format';
import { cn } from '@/shared/lib/utils';
import {
  templatesApi,
  templatesKeys,
} from '@/entities/notification-template/api/templates.api';
import type {
  NotificationTemplate,
  TemplateChannel,
  TemplatePreviewResponse,
} from '@/entities/notification-template/model/types';

const SNAKE_CASE = /^[a-z][a-z0-9_]*$/;
const TEMPLATE_VAR = /\{\{(\w+)\}\}/g;

function extractVariables(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(TEMPLATE_VAR)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

const schema = z.object({
  templateKey: z
    .string()
    .trim()
    .min(1, '템플릿 키를 입력해주세요')
    .max(128)
    .regex(SNAKE_CASE, 'snake_case 형식이어야 합니다 (소문자, 숫자, 언더스코어)'),
  titleTemplate: z.string().trim().min(1, '제목을 입력해주세요').max(512),
  bodyTemplate: z.string().trim().min(1, '본문을 입력해주세요').max(2048),
  channel: z.enum(['Push', 'InApp', 'Both']),
});

type FormValues = z.infer<typeof schema>;

export type TemplateEditorState =
  | { mode: 'create' }
  | { mode: 'edit'; template: NotificationTemplate };

interface TemplateEditorDrawerProps {
  state: TemplateEditorState | null;
  onClose: () => void;
}

const CHANNELS: TemplateChannel[] = ['Push', 'InApp', 'Both'];

export function TemplateEditorDrawer({ state, onClose }: TemplateEditorDrawerProps) {
  const open = state != null;
  const isEdit = state?.mode === 'edit';
  const tpl = isEdit ? state.template : undefined;
  const qc = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      templateKey: '',
      titleTemplate: '',
      bodyTemplate: '',
      channel: 'Push',
    },
  });

  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<TemplatePreviewResponse | null>(null);

  useEffect(() => {
    if (!open) return;
    form.reset({
      templateKey: tpl?.templateKey ?? '',
      titleTemplate: tpl?.titleTemplate ?? '',
      bodyTemplate: tpl?.bodyTemplate ?? '',
      channel: tpl?.channel ?? 'Push',
    });
    setVarValues({});
    setPreview(null);
  }, [open, tpl, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit ? templatesApi.update(tpl!.id, values) : templatesApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templatesKeys.all });
      onClose();
    },
  });

  const channel = form.watch('channel');
  const titleTemplate = form.watch('titleTemplate') ?? '';
  const bodyTemplate = form.watch('bodyTemplate') ?? '';
  const templateKey = form.watch('templateKey') ?? '';
  const keyValid = SNAKE_CASE.test(templateKey);

  const detectedVars = extractVariables(`${titleTemplate}\n${bodyTemplate}`);

  const previewMutation = useMutation({
    mutationFn: () =>
      templatesApi.preview({ titleTemplate, bodyTemplate, variables: varValues }),
    onSuccess: (data) => setPreview(data),
  });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="md:max-w-[580px]">
        <SheetHeader>
          <span className="inline-flex size-8 items-center justify-center rounded-md bg-[var(--hb-green-100)] text-[var(--hb-green-700)]">
            <Send className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-sm">
              {isEdit ? '템플릿 수정' : '새 템플릿 만들기'}
            </SheetTitle>
            <SheetDescription className="font-mono text-[11px]">
              {isEdit
                ? 'PUT /internal/notification-templates/{id}'
                : 'POST /internal/notification-templates'}
            </SheetDescription>
          </div>
        </SheetHeader>

        <SheetBody>
          <form
            id="template-editor-form"
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="flex flex-col gap-5"
          >
            <Field
              label="템플릿 키 (templateKey)"
              hint={`${templateKey.length}/128`}
              error={form.formState.errors.templateKey?.message}
              extra={
                !isEdit && keyValid && templateKey ? (
                  <span className="text-[11px] text-muted-foreground">
                    중복 불가. 생성 후 변경 불가.
                  </span>
                ) : null
              }
            >
              <Input
                {...form.register('templateKey')}
                disabled={isEdit}
                maxLength={128}
                placeholder="welcome_push"
                className={cn('font-mono text-[13px]', isEdit && 'opacity-70')}
              />
            </Field>

            <Field label="발송 채널 (channel)">
              <div className="flex gap-1.5">
                {CHANNELS.map((c) => {
                  const sel = channel === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => form.setValue('channel', c)}
                      className={cn(
                        'h-9 flex-1 rounded-md border text-[13px] transition-colors',
                        sel
                          ? 'border-primary bg-accent font-bold text-accent-foreground'
                          : 'border-border bg-card font-medium text-foreground/90 hover:border-[var(--hb-border-strong)]',
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field
              label="제목 템플릿 (titleTemplate)"
              hint={`${titleTemplate.length}/512`}
              error={form.formState.errors.titleTemplate?.message}
            >
              <Input
                {...form.register('titleTemplate')}
                maxLength={512}
                placeholder="환영합니다"
                className="text-sm font-medium"
              />
            </Field>

            <Field
              label="본문 템플릿 (bodyTemplate)"
              hint={`${bodyTemplate.length}/2048`}
              error={form.formState.errors.bodyTemplate?.message}
              extra={
                <span className="text-[11px] text-muted-foreground">
                  변수:{' '}
                  <code className="rounded-sm bg-muted px-1">{'{{name}}'}</code>{' '}
                  <code className="rounded-sm bg-muted px-1">{'{{date}}'}</code> 등
                </span>
              }
            >
              <textarea
                {...form.register('bodyTemplate')}
                maxLength={2048}
                placeholder="{{name}}님 가입을 축하합니다"
                className="min-h-24 w-full resize-y rounded-md border border-input bg-card p-2.5 text-[13px] leading-relaxed focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </Field>

            <PreviewSection
              titleTemplate={titleTemplate}
              bodyTemplate={bodyTemplate}
              detectedVars={detectedVars}
              varValues={varValues}
              setVarValues={setVarValues}
              preview={preview}
              onRefresh={() => previewMutation.mutate()}
              isFetching={previewMutation.isPending}
              error={previewMutation.error as Error | null}
            />

            {isEdit ? (
              <div className="flex items-center gap-3 rounded-md bg-muted px-3.5 py-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Hash className="size-3" />
                  <span className="font-mono">{tpl!.id}</span>
                </span>
                <span className="text-border">·</span>
                <span>
                  생성{' '}
                  <span className="font-mono tabular-nums">
                    {fmtDateTime(tpl!.createdAt)}
                  </span>
                </span>
              </div>
            ) : null}

            {mutation.isError ? (
              <p className="rounded-md bg-[var(--hb-red-100)] px-3 py-2 text-xs text-[var(--hb-red-700)]">
                저장에 실패했습니다: {(mutation.error as Error).message}
              </p>
            ) : null}
          </form>
        </SheetBody>

        <SheetFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button
            type="submit"
            form="template-editor-form"
            size="sm"
            disabled={mutation.isPending}
          >
            <Check className="size-3.5" />
            <span>{mutation.isPending ? '저장 중…' : isEdit ? '수정' : '생성'}</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface PreviewSectionProps {
  titleTemplate: string;
  bodyTemplate: string;
  detectedVars: string[];
  varValues: Record<string, string>;
  setVarValues: (v: Record<string, string>) => void;
  preview: TemplatePreviewResponse | null;
  onRefresh: () => void;
  isFetching: boolean;
  error: Error | null;
}

function PreviewSection({
  titleTemplate,
  bodyTemplate,
  detectedVars,
  varValues,
  setVarValues,
  preview,
  onRefresh,
  isFetching,
  error,
}: PreviewSectionProps) {
  // preview가 있을 때만 변수 치환된 결과 사용, 아니면 raw 템플릿
  const renderedTitle = preview?.renderedTitle ?? titleTemplate;
  const renderedBody = preview?.renderedBody ?? bodyTemplate;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          미리보기
        </span>
        {detectedVars.length > 0 ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={cn('size-3', isFetching && 'animate-spin')} />
            <span>{preview ? '다시 렌더' : '변수 치환'}</span>
          </Button>
        ) : null}
      </div>

      {detectedVars.length > 0 ? (
        <div className="mb-2 grid grid-cols-2 gap-1.5 rounded-md border border-border bg-muted/40 p-2">
          {detectedVars.map((name) => (
            <label key={name} className="flex items-center gap-1.5">
              <span className="shrink-0 font-mono text-[11px] font-semibold text-muted-foreground">
                {`{{${name}}}`}
              </span>
              <input
                type="text"
                value={varValues[name] ?? ''}
                onChange={(e) =>
                  setVarValues({ ...varValues, [name]: e.target.value })
                }
                placeholder={`${name} 값`}
                className="h-7 min-w-0 flex-1 rounded-sm border border-input bg-card px-2 text-[12px]"
              />
            </label>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl bg-[var(--hb-fg-1)] p-4">
        <div className="flex items-start gap-2.5 rounded-lg bg-card p-2.5">
          <div className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[9px] font-bold tracking-wider text-primary-foreground">
            HB
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-bold text-foreground">HB-Hammer</span>
              <span>· 지금</span>
              {preview ? (
                <span className="ml-1 inline-flex items-center gap-0.5 rounded-sm bg-[var(--hb-green-100)] px-1.5 text-[9px] font-bold text-[var(--hb-green-900)]">
                  RENDERED
                </span>
              ) : null}
            </div>
            <div className="mt-0.5 text-[13px] font-bold">
              {renderedTitle || '제목 미리보기'}
            </div>
            <div className="mt-0.5 whitespace-pre-wrap text-xs leading-snug text-foreground/80">
              {renderedBody || '본문 미리보기'}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-[11px] text-[var(--hb-red-700)]">
          미리보기 실패: {error.message}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  extra,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-foreground/80">{label}</span>
        {hint ? <span className="font-mono text-[11px] text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? <span className="text-[11px] text-[var(--hb-red-700)]">{error}</span> : null}
      {!error && extra ? extra : null}
    </div>
  );
}
