// inputNode.js

import { BaseNode } from './BaseNode';

export const InputNode = ({ id, data }) => (
  <BaseNode
    id={id}
    title="Input"
    fields={[
      {
        name: 'inputName',
        label: 'Name',
        type: 'text',
        defaultValue: data?.inputName || id.replace('customInput-', 'input_'),
      },
      {
        name: 'inputType',
        label: 'Type',
        type: 'select',
        options: ['Text', 'File'],
        defaultValue: data?.inputType || 'Text',
      },
    ]}
    outputs={[{ id: 'value' }]}
  />
);
