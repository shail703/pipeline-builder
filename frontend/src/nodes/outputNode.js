// outputNode.js

import { BaseNode } from './BaseNode';

export const OutputNode = ({ id, data }) => (
  <BaseNode
    id={id}
    title="Output"
    fields={[
      {
        name: 'outputName',
        label: 'Name',
        type: 'text',
        defaultValue: data?.outputName || id.replace('customOutput-', 'output_'),
      },
      {
        name: 'outputType',
        label: 'Type',
        type: 'select',
        options: ['Text', 'Image'],
        defaultValue: data?.outputType || 'Text',
      },
    ]}
    inputs={[{ id: 'value' }]}
  />
);
