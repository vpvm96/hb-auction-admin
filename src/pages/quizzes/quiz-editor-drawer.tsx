import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Clock, HelpCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
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
import { quizzesApi, quizzesKeys } from '@/entities/quiz/api/quizzes.api';
import type { Quiz } from '@/entities/quiz/model/types';

const schema = z.object({
  question: z.string().trim().min(1, '질문을 입력해주세요').max(500),
  choice1: z.string().trim().min(1, '선택지를 입력해주세요').max(200),
  choice2: z.string().trim().min(1, '선택지를 입력해주세요').max(200),
  choice3: z.string().trim().min(1, '선택지를 입력해주세요').max(200),
  choice4: z.string().trim().min(1, '선택지를 입력해주세요').max(200),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().max(1000),
});

type FormValues = z.infer<typeof schema>;

export type QuizEditorState =
  | { mode: 'create' }
  | { mode: 'edit'; quiz: Quiz };

interface QuizEditorDrawerProps {
  state: QuizEditorState | null;
  onClose: () => void;
}

export function QuizEditorDrawer({ state, onClose }: QuizEditorDrawerProps) {
  const open = state != null;
  const isEdit = state?.mode === 'edit';
  const quiz = isEdit ? state.quiz : undefined;
  const qc = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      question: '',
      choice1: '',
      choice2: '',
      choice3: '',
      choice4: '',
      correctIndex: 0,
      explanation: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      question: quiz?.question ?? '',
      choice1: quiz?.choices?.[0] ?? '',
      choice2: quiz?.choices?.[1] ?? '',
      choice3: quiz?.choices?.[2] ?? '',
      choice4: quiz?.choices?.[3] ?? '',
      correctIndex: quiz?.correctIndex ?? 0,
      explanation: quiz?.explanation ?? '',
    });
  }, [open, quiz, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit ? quizzesApi.update(quiz!.id, values) : quizzesApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quizzesKeys.all });
      onClose();
    },
  });

  const correctIndex = form.watch('correctIndex');
  const question = form.watch('question') ?? '';
  const explanation = form.watch('explanation') ?? '';

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="md:max-w-[580px]">
        <SheetHeader>
          <span className="inline-flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <HelpCircle className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-sm">
              {isEdit ? `퀴즈 수정 #${quiz!.id}` : '새 퀴즈 만들기'}
            </SheetTitle>
            <SheetDescription className="font-mono text-[11px]">
              {isEdit ? 'PUT /internal/quizzes/{id}' : 'POST /internal/quizzes'}
            </SheetDescription>
          </div>
        </SheetHeader>

        <SheetBody>
          <form
            id="quiz-editor-form"
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="flex flex-col gap-5"
          >
            <Field
              label="질문"
              hint={`${question.length}/500`}
              error={form.formState.errors.question?.message}
            >
              <textarea
                {...form.register('question')}
                maxLength={500}
                placeholder="예) 대한민국의 수도는?"
                className="min-h-16 w-full resize-y rounded-md border border-input bg-card p-2.5 text-sm font-medium leading-relaxed focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </Field>

            <div>
              <div className="mb-2 text-xs font-semibold text-foreground/80">
                선택지 — 정답을 선택하세요 (correctIndex 0~3)
              </div>
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => {
                  const isCorrect = correctIndex === i;
                  const fieldName = `choice${i + 1}` as
                    | 'choice1'
                    | 'choice2'
                    | 'choice3'
                    | 'choice4';
                  return (
                    <label
                      key={i}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-colors',
                        isCorrect
                          ? 'border-primary bg-accent'
                          : 'border-border bg-card hover:border-[var(--hb-border-strong)]',
                      )}
                    >
                      <input
                        type="radio"
                        checked={isCorrect}
                        onChange={() => form.setValue('correctIndex', i)}
                        className="accent-primary"
                      />
                      <span
                        className={cn(
                          'inline-flex size-[22px] items-center justify-center rounded text-[11px] font-bold tabular-nums',
                          isCorrect
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {i + 1}
                      </span>
                      <input
                        {...form.register(fieldName)}
                        maxLength={200}
                        placeholder={`선택지 ${i + 1}`}
                        className="h-8 flex-1 border-0 bg-transparent text-[13px] focus-visible:outline-none"
                      />
                      {isCorrect ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--hb-green-100)] px-2 py-0.5 text-[10px] font-bold text-[var(--hb-green-900)]">
                          <Check className="size-2.5" />
                          정답
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
              {(form.formState.errors.choice1 ||
                form.formState.errors.choice2 ||
                form.formState.errors.choice3 ||
                form.formState.errors.choice4) && (
                <p className="mt-1.5 text-[11px] text-[var(--hb-red-700)]">
                  모든 선택지를 입력해주세요.
                </p>
              )}
            </div>

            <Field
              label="해설"
              hint={`${explanation.length}/1000`}
              error={form.formState.errors.explanation?.message}
            >
              <textarea
                {...form.register('explanation')}
                maxLength={1000}
                placeholder="정답에 대한 설명"
                className="min-h-20 w-full resize-y rounded-md border border-input bg-card p-2.5 text-[13px] leading-relaxed focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </Field>

            {isEdit ? (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3.5 py-3 text-[11px] text-muted-foreground">
                <Clock className="size-3" />
                <span>
                  생성:{' '}
                  <span className="font-mono tabular-nums">
                    {fmtDateTime(quiz!.createdAt)}
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
            form="quiz-editor-form"
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

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
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
    </div>
  );
}
