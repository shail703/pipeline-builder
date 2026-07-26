// draggableNode.js

import styles from './draggableNode.module.css';

export const DraggableNode = ({ type, label }) => {
    const onDragStart = (event, nodeType) => {
      const appData = { nodeType }
      event.target.classList.add(styles.dragging);
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };

    return (
      <div
        className={`${styles.chip} ${type}`}
        data-testid={`draggable-${type}`}
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => event.target.classList.remove(styles.dragging)}
        draggable
      >
          <span>{label}</span>
      </div>
    );
  };
