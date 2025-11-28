import React, { useState, useRef } from 'react';

interface Version {
  filename: string;
  path: string;
  size: number;
  created: number;
  modified: number;
}

interface VersionManagerProps {
  versions: Version[];
  onUpload: (file: File) => void;
  onCompare: (v1: string, v2: string) => void;
  onReset: () => void;
  isUploading: boolean;
}

export const VersionManager: React.FC<VersionManagerProps> = ({ 
  versions, 
  onUpload, 
  onCompare, 
  onReset,
  isUploading 
}) => {
  const [selectedV1, setSelectedV1] = useState<string>('');
  const [selectedV2, setSelectedV2] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
      // Reset input
      e.target.value = '';
    }
  };

  const handleCompareClick = () => {
    if (selectedV1 && selectedV2) {
      onCompare(selectedV1, selectedV2);
    }
  };

  // Auto-select last two versions if available and nothing selected
  React.useEffect(() => {
    if (versions.length >= 2) {
      if (!selectedV1) setSelectedV1(versions[versions.length - 2].filename);
      if (!selectedV2) setSelectedV2(versions[versions.length - 1].filename);
    } else if (versions.length === 1) {
      if (!selectedV1) setSelectedV1(versions[0].filename);
    }
  }, [versions.length]); // Only run when count changes

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Versions des Devis</h2>
        <div className="flex gap-2">
            <button 
                onClick={onReset}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
            >
                Tout effacer
            </button>
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
                {isUploading ? 'Envoi...' : '+ Ajouter une version'}
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf"
                onChange={handleFileChange}
            />
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          Aucune version importée. Commencez par ajouter un devis PDF.
        </div>
      ) : (
        <div className="space-y-6">
            {/* Timeline / Liste des versions */}
            <div className="flex overflow-x-auto pb-4 gap-4 items-center min-h-[120px]">
                {versions.map((v, index) => (
                    <div key={v.filename} className="relative flex-shrink-0">
                        <div className="w-40 p-3 bg-gray-50 border rounded-lg hover:shadow-md transition-shadow text-center">
                            <div className="font-bold text-blue-900">V{index + 1}</div>
                            <div className="text-xs text-gray-500 truncate mb-2" title={v.filename}>{v.filename}</div>
                            <div className="text-[10px] text-gray-400">
                                {new Date(v.modified * 1000).toLocaleString()}
                            </div>
                        </div>
                        {index < versions.length - 1 && (
                            <div className="absolute top-1/2 -right-6 w-4 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Zone de sélection pour comparaison */}
            {versions.length >= 2 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Comparer les versions</h3>
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Version de référence (Gauche)</label>
                            <select 
                                value={selectedV1}
                                onChange={(e) => setSelectedV1(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {versions.map((v, idx) => (
                                    <option key={v.filename} value={v.filename}>
                                        V{idx + 1} - {v.filename}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="text-gray-400 font-bold hidden md:block">VS</div>
                        
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Version à comparer (Droite)</label>
                            <select 
                                value={selectedV2}
                                onChange={(e) => setSelectedV2(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {versions.map((v, idx) => (
                                    <option key={v.filename} value={v.filename}>
                                        V{idx + 1} - {v.filename}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleCompareClick}
                            disabled={!selectedV1 || !selectedV2 || selectedV1 === selectedV2}
                            className={`mt-4 md:mt-0 px-6 py-2 rounded font-medium text-white transition-colors ${
                                !selectedV1 || !selectedV2 || selectedV1 === selectedV2
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            Comparer
                        </button>
                    </div>
                    {selectedV1 === selectedV2 && (
                        <p className="text-center text-orange-500 text-sm mt-2">
                            Sélectionnez deux versions différentes pour comparer.
                        </p>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

