import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmitButton } from './submit';
import { useStore } from './store';

const clickSubmit = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

beforeEach(() => {
  useStore.setState({ nodes: [], edges: [] });
  window.alert = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('POSTs a trimmed nodes/edges payload to the parse endpoint', async () => {
  useStore.setState({
    nodes: [
      { id: 'a', type: 'text', position: { x: 0, y: 0 }, data: { foo: 1 } },
      { id: 'b', type: 'llm', position: { x: 1, y: 1 }, data: {} },
    ],
    edges: [{ id: 'e1', source: 'a', target: 'b', animated: true }],
  });

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ num_nodes: 2, num_edges: 1, is_dag: true }),
  });

  render(<SubmitButton />);
  clickSubmit();

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe('http://localhost:8000/pipelines/parse');
  expect(options.method).toBe('POST');
  expect(JSON.parse(options.body)).toEqual({
    nodes: [
      { id: 'a', type: 'text' },
      { id: 'b', type: 'llm' },
    ],
    edges: [{ source: 'a', target: 'b' }],
  });
});

test('reports a valid DAG result in the alert', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ num_nodes: 1, num_edges: 0, is_dag: true }),
  });

  render(<SubmitButton />);
  clickSubmit();

  await waitFor(() => expect(window.alert).toHaveBeenCalledTimes(1));
  const message = window.alert.mock.calls[0][0];
  expect(message).toContain('Valid DAG: Yes');
  expect(message).toContain('No cycles detected');
});

test('reports a non-DAG result in the alert', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ num_nodes: 2, num_edges: 2, is_dag: false }),
  });

  render(<SubmitButton />);
  clickSubmit();

  await waitFor(() => expect(window.alert).toHaveBeenCalled());
  const message = window.alert.mock.calls[0][0];
  expect(message).toContain('Valid DAG: No');
  expect(message).toContain('A cycle was detected');
});

test('surfaces a friendly error when the backend is unreachable', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

  render(<SubmitButton />);
  clickSubmit();

  await waitFor(() => expect(window.alert).toHaveBeenCalled());
  const message = window.alert.mock.calls[0][0];
  expect(message).toContain('Could not reach the backend.');
  expect(message).toContain('Failed to fetch');
});

test('treats a non-ok HTTP response as an error', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({}),
  });

  render(<SubmitButton />);
  clickSubmit();

  await waitFor(() => expect(window.alert).toHaveBeenCalled());
  const message = window.alert.mock.calls[0][0];
  expect(message).toContain('Could not reach the backend.');
  expect(message).toContain('500');
});
