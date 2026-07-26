// filterNode.js

import { BaseNode } from './BaseNode';

export const FilterNode = ({ id, data }) => (
  <BaseNode
    id={id}
    title="Filter"
    fields={[
      {
        name: 'condition',
        label: 'Condition',
        type: 'text',
        defaultValue: data?.condition || 'value > 0',
      },
    ]}
    inputs={[{ id: 'data' }]}
    outputs={[{ id: 'filtered' }]}
  />
);
