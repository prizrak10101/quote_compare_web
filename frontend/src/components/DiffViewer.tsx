import React from 'react';

interface DiffViewerProps {
  htmlDiff: string;
  rawDiff: Array<[number, string]>;
  fileName1: string;
  fileName2: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ htmlDiff, rawDiff, fileName1, fileName2 }) => {
  
  // Calcul simple des statistiques
  const additions = rawDiff.filter(d => d[0] === 1).length;
  const deletions = rawDiff.filter(d => d[0] === -1).length;
  const changes = additions + deletions;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto">
      {/* Panneau principal de visualisation */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md overflow-auto max-h-[80vh]">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Comparaison Visuelle</h3>
        <div 
          className="prose max-w-none font-mono text-sm whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: htmlDiff }} 
          style={{
            // Styles inline pour s'assurer que les balises générées par le backend sont bien stylisées
            // Note: Google diff match patch utilise <ins> et <del> par défaut ou span avec style.
            // On va injecter du CSS global dans App.css ou index.css pour cibler ins/del si nécessaire.
          }}
        />
      </div>

      {/* Panneau latéral de résumé */}
      <div className="w-full md:w-80 flex-shrink-0">
        <div className="bg-gray-50 p-6 rounded-lg shadow-md sticky top-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Résumé des modifications</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded border">
              <span className="text-gray-600">Fichier Original</span>
              <span className="font-medium text-xs truncate max-w-[120px]" title={fileName1}>{fileName1}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded border">
              <span className="text-gray-600">Fichier Modifié</span>
              <span className="font-medium text-xs truncate max-w-[120px]" title={fileName2}>{fileName2}</span>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-100 p-3 rounded text-center">
                  <span className="block text-2xl font-bold text-green-600">+{additions}</span>
                  <span className="text-xs text-green-800">Ajouts</span>
                </div>
                <div className="bg-red-100 p-3 rounded text-center">
                  <span className="block text-2xl font-bold text-red-600">-{deletions}</span>
                  <span className="text-xs text-red-800">Suppressions</span>
                </div>
              </div>
              <div className="mt-2 bg-blue-50 p-3 rounded text-center">
                 <span className="text-blue-800 font-medium">Total {changes} modifications</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-4">
              <p>Légende :</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-3 h-3 bg-[#e6ffe6] border border-[#008000] inline-block"></span>
                <span>Ajouté</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-3 h-3 bg-[#ffe6e6] border border-[#ff0000] inline-block"></span>
                <span>Supprimé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

