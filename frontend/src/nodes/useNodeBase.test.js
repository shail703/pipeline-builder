import { renderHook, act } from '@testing-library/react';
import { useNodeBase } from './useNodeBase';

describe('field values', () => {
  test('seeds values from each field defaultValue', () => {
    const { result } = renderHook(() =>
      useNodeBase({
        id: 'n1',
        fields: [
          { name: 'a', defaultValue: 'hello' },
          { name: 'b', defaultValue: 'world' },
        ],
      })
    );

    expect(result.current.fieldValues).toEqual({ a: 'hello', b: 'world' });
  });

  test('falls back to an empty string when no default is given', () => {
    const { result } = renderHook(() =>
      useNodeBase({ id: 'n1', fields: [{ name: 'a' }] })
    );

    expect(result.current.fieldValues.a).toBe('');
  });

  test('updateField changes only the named field', () => {
    const { result } = renderHook(() =>
      useNodeBase({
        id: 'n1',
        fields: [
          { name: 'a', defaultValue: '1' },
          { name: 'b', defaultValue: '2' },
        ],
      })
    );

    act(() => result.current.updateField('a', '9'));

    expect(result.current.fieldValues).toEqual({ a: '9', b: '2' });
  });
});

describe('handle layout', () => {
  test('namespaces handle ids with the node id and assigns sides', () => {
    const { result } = renderHook(() =>
      useNodeBase({
        id: 'node-7',
        inputs: [{ id: 'in' }],
        outputs: [{ id: 'out' }],
      })
    );

    expect(result.current.inputHandles[0]).toMatchObject({
      handleId: 'node-7-in',
      position: 'left',
    });
    expect(result.current.outputHandles[0]).toMatchObject({
      handleId: 'node-7-out',
      position: 'right',
    });
  });

  test('spreads multiple handles evenly down the side', () => {
    const { result } = renderHook(() =>
      useNodeBase({
        id: 'n',
        inputs: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      })
    );

    const tops = result.current.inputHandles.map((h) => h.style.top);
    expect(tops).toEqual(['25%', '50%', '75%']);
  });
});
