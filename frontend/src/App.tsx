import { useState, useEffect } from 'react';
import { VersionManager } from './components/VersionManager';
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

interface Version {
  filename: string;
  path: string;
  size: number;
  created: number;
  modified: number;
}

function App() {
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'visual'>('visual');

  const API_URL = 'http://localhost:8000';

  const fetchVersions = async () => {
    try {
      const res = await fetch(`${API_URL}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (err) {
      console.error("Erreur chargement versions", err);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error("Erreur upload");
      await fetchVersions();
    } catch (err) {
      setError("Erreur lors de l'upload du fichier");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer toutes les versions ?")) return;
    try {
      await fetch(`${API_URL}/reset`, { method: 'POST' });
      setVersions([]);
      setDiffResult(null);
    } catch (err) {
      setError("Erreur lors de la réinitialisation");
    }
  };

  const handleCompare = async (file1: string, file2: string) => {
    setIsLoading(true);
    setError(null);
    setDiffResult(null);

    try {
      const response = await fetch(`${API_URL}/compare-versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file1, file2 }),
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
        <p className="text-gray-600 mt-2">Gérez vos versions et visualisez les évolutions</p>
      </header>

      <div className="flex flex-col items-center gap-8 max-w-6xl mx-auto">
        
        <VersionManager 
            versions={versions}
            onUpload={handleUpload}
            onCompare={handleCompare}
            onReset={handleReset}
            isUploading={isUploading}
        />

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 w-full" role="alert">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Analyse et comparaison en cours...</p>
            </div>
        )}

        {diffResult && !isLoading && (
          <div className="w-full animate-fade-in">
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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
