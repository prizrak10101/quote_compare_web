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
      <div className="flex-1 bg-card text-card-foreground p-6 rounded-lg shadow-md overflow-auto max-h-[80vh] border border-border">
        <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Comparaison Visuelle</h3>
        <div 
          className="prose prose-sm max-w-none font-mono whitespace-pre-wrap dark:prose-invert"
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
        <div className="bg-muted/30 p-6 rounded-lg shadow-md sticky top-6 border border-border">
          <h3 className="text-lg font-bold mb-4 text-foreground">Résumé des modifications</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-card rounded border border-border">
              <span className="text-muted-foreground">Fichier Original</span>
              <span className="font-medium text-xs truncate max-w-[120px] text-foreground" title={fileName1}>{fileName1}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-card rounded border border-border">
              <span className="text-muted-foreground">Fichier Modifié</span>
              <span className="font-medium text-xs truncate max-w-[120px] text-foreground" title={fileName2}>{fileName2}</span>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-100 p-3 rounded text-center dark:bg-green-900/20">
                  <span className="block text-2xl font-bold text-green-600 dark:text-green-400">+{additions}</span>
                  <span className="text-xs text-green-800 dark:text-green-300">Ajouts</span>
                </div>
                <div className="bg-red-100 p-3 rounded text-center dark:bg-red-900/20">
                  <span className="block text-2xl font-bold text-red-600 dark:text-red-400">-{deletions}</span>
                  <span className="text-xs text-red-800 dark:text-red-300">Suppressions</span>
                </div>
              </div>
              <div className="mt-2 bg-blue-50 p-3 rounded text-center dark:bg-blue-900/20">
                 <span className="text-blue-800 font-medium dark:text-blue-300">Total {changes} modifications</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-4">
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

