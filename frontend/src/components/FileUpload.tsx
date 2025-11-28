import React, { useState } from 'react';

interface FileUploadProps {
  onCompare: (file1: File, file2: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onCompare, isLoading }) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file1 && file2) {
      onCompare(file1, file2);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Comparer des devis</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <label className="cursor-pointer block">
              <span className="block text-sm font-medium text-gray-700 mb-2">Devis Original (V1)</span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile1(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <div className="text-gray-500">
                {file1 ? (
                  <span className="text-blue-600 font-semibold">{file1.name}</span>
                ) : (
                  <span>Cliquez pour choisir un fichier PDF</span>
                )}
              </div>
            </label>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <label className="cursor-pointer block">
              <span className="block text-sm font-medium text-gray-700 mb-2">Devis Modifié (V2)</span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile2(e.target.files ? e.target.files[0] : null)}
                className="hidden"
              />
              <div className="text-gray-500">
                {file2 ? (
                  <span className="text-blue-600 font-semibold">{file2.name}</span>
                ) : (
                  <span>Cliquez pour choisir un fichier PDF</span>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={!file1 || !file2 || isLoading}
            className={`px-8 py-3 rounded-md text-white font-semibold shadow-sm ${
              !file1 || !file2 || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Comparaison en cours...' : 'Comparer les versions'}
          </button>
        </div>
      </form>
    </div>
  );
};

