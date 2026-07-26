// mathNode.js

import { BaseNode } from './BaseNode';

export const MathNode = ({ id, data }) => (
  <BaseNode
    id={id}
    title="Math"
    fields={[
      {
        name: 'operation',
        label: 'Operation',
        type: 'select',
        options: ['Add', 'Subtract', 'Multiply', 'Divide'],
        defaultValue: data?.operation || 'Add',
      },
    ]}
    inputs={[{ id: 'a' }, { id: 'b' }]}
    outputs={[{ id: 'result' }]}
  />
);
