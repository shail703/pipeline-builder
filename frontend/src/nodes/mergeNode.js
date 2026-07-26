// mergeNode.js
// Demonstrates auto-spacing handle math: 3 inputs evenly distributed
// down the left side with zero manual positioning code.

import { BaseNode } from './BaseNode';

export const MergeNode = ({ id, data }) => (
  <BaseNode
    id={id}
    title="Merge"
    fields={[
      {
        name: 'strategy',
        label: 'Strategy',
        type: 'select',
        options: ['Concat', 'Join', 'Overwrite'],
        defaultValue: data?.strategy || 'Concat',
      },
    ]}
    inputs={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]}
    outputs={[{ id: 'merged' }]}
  />
);
