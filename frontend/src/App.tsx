import { useState } from 'react';
import Upload from './pages/Upload';
import Questions from './pages/Questions';
import './App.css';

type Page = 'upload' | 'questions';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('upload');

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 CSV Quiz Upload App</h1>
        <nav>
          <button
            className={currentPage === 'upload' ? 'active' : ''}
            onClick={() => setCurrentPage('upload')}
          >
            Upload CSV
          </button>
          <button
            className={currentPage === 'questions' ? 'active' : ''}
            onClick={() => setCurrentPage('questions')}
          >
            View Questions
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentPage === 'upload' && <Upload />}
        {currentPage === 'questions' && <Questions />}
      </main>

      <footer className="app-footer">
        <p>CSV Quiz Upload App - Upload questions, review answers</p>
      </footer>
    </div>
  );
}

export default App;
