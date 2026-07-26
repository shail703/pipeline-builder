import { render, screen, fireEvent } from '@testing-library/react';
import { TextNode } from './textNode';

jest.mock('reactflow', () => ({
  Handle: ({ id, type }) => (
    <div data-testid="handle" data-handleid={id} data-type={type} />
  ),
  Position: { Left: 'left', Right: 'right' },
}));

const inputHandles = () =>
  screen.getAllByTestId('handle').filter((h) => h.dataset.type === 'target');

const setText = (value) =>
  fireEvent.change(screen.getByLabelText('Text'), { target: { value } });

test('parses the default {{input}} into one variable + input handle', () => {
  render(<TextNode id="text-1" data={{}} />);

  expect(inputHandles()).toHaveLength(1);
  expect(screen.getByText(/1 variable:\s*input/)).toBeInTheDocument();
});

test('always renders exactly one output handle', () => {
  render(<TextNode id="text-1" data={{}} />);
  const sources = screen
    .getAllByTestId('handle')
    .filter((h) => h.dataset.type === 'source');
  expect(sources).toHaveLength(1);
});

test('creates a handle per unique variable when the text changes', () => {
  render(<TextNode id="text-1" data={{ text: '' }} />);

  setText('Hi {{name}} and {{place}}');

  expect(inputHandles()).toHaveLength(2);
  expect(screen.getByText(/2 variables:\s*name, place/)).toBeInTheDocument();
});

test('de-duplicates repeated variables into a single handle', () => {
  render(<TextNode id="text-1" data={{ text: '' }} />);

  setText('{{x}} {{x}} {{x}}');

  expect(inputHandles()).toHaveLength(1);
});

test('ignores malformed / non-identifier tokens', () => {
  render(<TextNode id="text-1" data={{ text: '' }} />);

  setText('{{1bad}} {{no-dash}}');

  expect(inputHandles()).toHaveLength(0);
  expect(screen.queryByText(/variable/)).not.toBeInTheDocument();
});
