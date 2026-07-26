import { renderHook, waitFor } from '@testing-library/react';
import { useThemeVar } from './useThemeVar';

afterEach(() => {
  jest.restoreAllMocks();
  document.documentElement.removeAttribute('data-theme');
});

const mockToken = (value) =>
  jest
    .spyOn(window, 'getComputedStyle')
    .mockReturnValue({ getPropertyValue: () => value });

test('returns the trimmed token value', () => {
  mockToken('  #abcdef  ');
  const { result } = renderHook(() => useThemeVar('--color-grid', '#000'));
  expect(result.current).toBe('#abcdef');
});

test('falls back when the property is empty', () => {
  mockToken('');
  const { result } = renderHook(() => useThemeVar('--color-grid', '#fallback'));
  expect(result.current).toBe('#fallback');
});

test('re-reads the token when data-theme changes', async () => {
  mockToken('#light');
  const { result } = renderHook(() => useThemeVar('--color-grid', '#000'));
  expect(result.current).toBe('#light');

  mockToken('#dark');
  document.documentElement.setAttribute('data-theme', 'dark');

  await waitFor(() => expect(result.current).toBe('#dark'));
});
