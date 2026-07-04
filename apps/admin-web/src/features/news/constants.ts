export const newsKeys = {
  all: ['news'] as const,
  list: () => [...newsKeys.all, 'list'] as const,
  detail: (id: number) => [...newsKeys.all, 'detail', id] as const,
}
