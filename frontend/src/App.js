import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { ThemeToggle } from './ThemeToggle';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <ThemeToggle />
      <PipelineToolbar />
      <div className={styles.canvasArea}>
        <PipelineUI />
      </div>
      <SubmitButton />
    </div>
  );
}

export default App;