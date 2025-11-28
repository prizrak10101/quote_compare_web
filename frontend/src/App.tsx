import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DiffViewer } from './components/DiffViewer';
import { VisualDiffViewer } from './components/VisualDiffViewer';

interface DiffResult {
  html_diff: string;
  raw_diff: Array<[number, string]>;
  visual_diff: Array<{
    page: number;
    img1: string | null;
    img2: string | null;
  }>;
  filename1: string;
  filename2: string;
}

function App() {
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'visual'>('visual');

  const handleCompare = async (file1: File, file2: File) => {
    setIsLoading(true);
    setError(null);
    setDiffResult(null);

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const response = await fetch('http://localhost:8001/compare', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la comparaison des fichiers');
      }

      const data = await response.json();
      setDiffResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Comparateur de Devis</h1>
        <p className="text-gray-600 mt-2">Visualisez les évolutions de vos devis fournisseurs</p>
      </header>

      <div className="flex flex-col items-center gap-8">
        <FileUpload onCompare={handleCompare} isLoading={isLoading} />

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 w-full max-w-2xl" role="alert">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
        )}

        {diffResult && (
          <div className="w-full animate-fade-in px-4">
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  viewMode === 'visual'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Vue Visuelle (Images)
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  viewMode === 'text'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Vue Texte (Détails)
              </button>
            </div>

            {viewMode === 'visual' ? (
              <VisualDiffViewer 
                visualDiff={diffResult.visual_diff}
                fileName1={diffResult.filename1}
                fileName2={diffResult.filename2}
              />
            ) : (
              <DiffViewer 
                htmlDiff={diffResult.html_diff}
                rawDiff={diffResult.raw_diff}
                fileName1={diffResult.filename1}
                fileName2={diffResult.filename2}
              />
            )}

            <div className="text-center mt-12 mb-8">
              <button 
                onClick={() => setDiffResult(null)}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Effectuer une nouvelle comparaison
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
