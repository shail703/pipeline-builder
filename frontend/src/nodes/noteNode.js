// noteNode.js
// Demonstrates BaseNode flexibility: a node with no handles at all
// (a sticky note / comment), just a textarea field.

import { BaseNode } from './BaseNode';

export const NoteNode = ({ id, data }) => (
  <BaseNode
    id={id}
    title="Note"
    fields={[
      {
        name: 'note',
        label: '',
        type: 'textarea',
        rows: 3,
        defaultValue: data?.note || 'Add a note...',
      },
    ]}
  />
);
