import { render, screen, fireEvent } from '@testing-library/react';
import { BaseNode } from './BaseNode';

jest.mock('reactflow', () => ({
  Handle: ({ id, type }) => (
    <div data-testid="handle" data-handleid={id} data-type={type} />
  ),
  Position: { Left: 'left', Right: 'right' },
}));

test('renders the title', () => {
  render(<BaseNode id="n1" title="My Node" />);
  expect(screen.getByText('My Node')).toBeInTheDocument();
});

test('renders a labelled text field seeded with its default', () => {
  render(
    <BaseNode
      id="n1"
      title="Input"
      fields={[
        { name: 'inputName', label: 'Name', type: 'text', defaultValue: 'foo' },
      ]}
    />
  );

  const input = screen.getByLabelText('Name');
  expect(input).toHaveValue('foo');
});

test('renders a select with all its options', () => {
  render(
    <BaseNode
      id="n1"
      title="Math"
      fields={[
        {
          name: 'op',
          label: 'Operation',
          type: 'select',
          options: ['Add', 'Subtract'],
          defaultValue: 'Add',
        },
      ]}
    />
  );

  const select = screen.getByLabelText('Operation');
  expect(select).toHaveValue('Add');
  expect(screen.getByRole('option', { name: 'Add' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Subtract' })).toBeInTheDocument();
});

test('typing into a field updates its value', () => {
  render(
    <BaseNode
      id="n1"
      title="Input"
      fields={[{ name: 'inputName', label: 'Name', type: 'text', defaultValue: '' }]}
    />
  );

  const input = screen.getByLabelText('Name');
  fireEvent.change(input, { target: { value: 'abc' } });
  expect(input).toHaveValue('abc');
});

test('emits one handle per input and output', () => {
  render(
    <BaseNode
      id="n1"
      title="LLM"
      inputs={[{ id: 'system' }, { id: 'prompt' }]}
      outputs={[{ id: 'response' }]}
    />
  );

  const handles = screen.getAllByTestId('handle');
  expect(handles).toHaveLength(3);
  expect(handles.filter((h) => h.dataset.type === 'target')).toHaveLength(2);
  expect(handles.filter((h) => h.dataset.type === 'source')).toHaveLength(1);
});

test('renders custom body content', () => {
  render(<BaseNode id="n1" title="LLM" body={<span>This is an LLM.</span>} />);
  expect(screen.getByText('This is an LLM.')).toBeInTheDocument();
});
