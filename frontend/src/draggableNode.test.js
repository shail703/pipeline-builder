import { render, screen, fireEvent } from '@testing-library/react';
import { DraggableNode } from './draggableNode';

test('renders its label and is draggable', () => {
  render(<DraggableNode type="llm" label="LLM" />);
  const chip = screen.getByTestId('draggable-llm');
  expect(chip).toHaveTextContent('LLM');
  expect(chip).toHaveAttribute('draggable');
});

test('writes the node type as JSON onto dataTransfer on drag start', () => {
  render(<DraggableNode type="customInput" label="Input" />);
  const chip = screen.getByTestId('draggable-customInput');

  const dataTransfer = { setData: jest.fn(), effectAllowed: '' };
  fireEvent.dragStart(chip, { dataTransfer });

  expect(dataTransfer.setData).toHaveBeenCalledWith(
    'application/reactflow',
    JSON.stringify({ nodeType: 'customInput' })
  );
  expect(dataTransfer.effectAllowed).toBe('move');
});
