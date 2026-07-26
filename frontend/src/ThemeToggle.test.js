import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

const STORAGE_KEY = 'pipeline-builder-theme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

test('restores the saved theme on mount', () => {
  localStorage.setItem(STORAGE_KEY, 'dark');
  render(<ThemeToggle />);

  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(
    screen.getByRole('button', { name: 'Switch to light mode' })
  ).toBeInTheDocument();
});

test('toggling flips the attribute and persists the new choice', () => {
  localStorage.setItem(STORAGE_KEY, 'light');
  render(<ThemeToggle />);

  expect(document.documentElement.getAttribute('data-theme')).toBe('light');

  fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));

  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
});

test('defaults to light when nothing is saved and OS is not dark', () => {
  render(<ThemeToggle />);
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
});
