import { render, screen } from '@testing-library/react';
import { InputNode } from './inputNode';
import { OutputNode } from './outputNode';
import { LLMNode } from './llmNode';
import { MathNode } from './mathNode';

jest.mock('reactflow', () => ({
  Handle: ({ id, type }) => (
    <div data-testid="handle" data-handleid={id} data-type={type} />
  ),
  Position: { Left: 'left', Right: 'right' },
}));

const targets = () =>
  screen.getAllByTestId('handle').filter((h) => h.dataset.type === 'target');
const sources = () =>
  screen.getAllByTestId('handle').filter((h) => h.dataset.type === 'source');

test('InputNode derives a default name from its id', () => {
  render(<InputNode id="customInput-3" data={{}} />);
  expect(screen.getByLabelText('Name')).toHaveValue('input_3');
  expect(screen.getByLabelText('Type')).toHaveValue('Text');
  expect(sources()).toHaveLength(1);
  expect(targets()).toHaveLength(0);
});

test('InputNode prefers a provided data value over the derived default', () => {
  render(<InputNode id="customInput-1" data={{ inputName: 'custom' }} />);
  expect(screen.getByLabelText('Name')).toHaveValue('custom');
});

test('OutputNode derives a default name and has one input handle', () => {
  render(<OutputNode id="customOutput-2" data={{}} />);
  expect(screen.getByLabelText('Name')).toHaveValue('output_2');
  expect(targets()).toHaveLength(1);
  expect(sources()).toHaveLength(0);
});

test('LLMNode has system + prompt inputs and a response output', () => {
  render(<LLMNode id="llm-1" />);
  expect(screen.getByText('This is an LLM.')).toBeInTheDocument();
  expect(targets()).toHaveLength(2);
  expect(sources()).toHaveLength(1);
});

test('MathNode exposes two operands and an operation select', () => {
  render(<MathNode id="math-1" data={{}} />);
  expect(screen.getByLabelText('Operation')).toHaveValue('Add');
  expect(targets()).toHaveLength(2);
  expect(sources()).toHaveLength(1);
});
