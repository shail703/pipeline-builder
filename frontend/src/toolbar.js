// toolbar.js

import { DraggableNode } from './draggableNode';
import styles from './toolbar.module.css';

export const PipelineToolbar = () => {

    return (
        <div className={styles.toolbar}>
            <div className={styles.brand}>
                <span className={styles.brandDot} />
                Pipeline Builder
            </div>
            <div className={styles.divider} />
            <div className={styles.nodeTray}>
                <DraggableNode type='customInput' label='Input' />
                <DraggableNode type='llm' label='LLM' />
                <DraggableNode type='customOutput' label='Output' />
                <DraggableNode type='text' label='Text' />
                <DraggableNode type='filter' label='Filter' />
                <DraggableNode type='math' label='Math' />
                <DraggableNode type='api' label='API Call' />
                <DraggableNode type='note' label='Note' />
                <DraggableNode type='merge' label='Merge' />
            </div>
        </div>
    );
};
