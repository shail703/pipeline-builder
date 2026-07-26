import { useState, useCallback, useMemo } from 'react';

/**
 * @param {string} id - node id (from ReactFlow)
 * @param {Array} fields - [{ name, defaultValue }]
 * @param {Array} inputs - [{ id }] target handles (left side)
 * @param {Array} outputs - [{ id }] source handles (right side)
 */
export const useNodeBase = ({ id, fields = [], inputs = [], outputs = [] }) => {

  const [fieldValues, setFieldValues] = useState(() =>
    fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue ?? '';
      return acc;
    }, {})
  );

  const updateField = useCallback((name, value) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const layoutHandles = (handles, position) =>
    handles.map((handle, index) => ({
      ...handle,
      handleId: `${id}-${handle.id}`,
      position,
      style: { top: `${((index + 1) / (handles.length + 1)) * 100}%` },
    }));

  const inputHandles = useMemo(() => layoutHandles(inputs, 'left'), [inputs, id]);
  const outputHandles = useMemo(() => layoutHandles(outputs, 'right'), [outputs, id]);

  return { fieldValues, updateField, inputHandles, outputHandles };
};
