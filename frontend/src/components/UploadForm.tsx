import { useState } from 'react';
import { uploadCSV, deleteAllQuestions } from '../services/api.service';
import { UploadResponse, UploadError } from '../types';

interface UploadFormProps {
  onUploadComplete?: () => void;
}

export default function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File size limit (2MB)
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Client-side validation
    // Check file extension
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are allowed');
      setFile(null);
      return;
    }

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setError(`File size (${sizeMB}MB) exceeds 2MB limit`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const uploadResult = await uploadCSV(file);
      setResult(uploadResult);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
      
      // Clear file input
      setFile(null);
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL questions from the database? This action cannot be undone!'
    );

    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setResult(null);

    try {
      const deleteResult = await deleteAllQuestions();
      alert(`Successfully deleted ${deleteResult.deletedCount} questions from the database.`);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Delete failed';
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload CSV Quiz File</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="csv-file">Select CSV File (max 2MB):</label>
          <input
            type="file"
            id="csv-file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {file && (
          <div className="file-info">
            <p>Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
          </div>
        )}

        <button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        <button 
          type="button" 
          onClick={handleDeleteAll} 
          disabled={deleting || uploading}
          className="delete-all-button"
        >
          {deleting ? 'Deleting...' : 'Delete All Questions'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="upload-results">
          <h3>Upload Results</h3>
          <div className="summary">
            <p><strong>File:</strong> {result.filename}</p>
            <p><strong>Total Rows:</strong> {result.summary.totalRows}</p>
            <p><strong>✅ Successfully Imported:</strong> {result.summary.successfulImports}</p>
            <p><strong>🔁 Duplicates Skipped:</strong> {result.summary.duplicates}</p>
            <p><strong>❌ Failed:</strong> {result.summary.failures}</p>
          </div>

          {result.errors.length > 0 && (
            <div className="errors">
              <h4>Errors ({result.errors.length}):</h4>
              <ul>
                {result.errors.slice(0, 10).map((err: UploadError, index: number) => (
                  <li key={index}>
                    <strong>Row {err.row}:</strong> {err.error}
                  </li>
                ))}
                {result.errors.length > 10 && (
                  <li>... and {result.errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
