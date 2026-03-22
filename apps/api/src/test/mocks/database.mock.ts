import { vi } from 'vitest';

export const createMockDatabase = () => ({
  select: vi.fn().mockReturnThis(),
  from: vi.fn(),
  query: {
    stories: {
      findFirst: vi.fn(),
    },
  },
});
