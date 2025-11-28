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
      e.target.value = '';
    }
  };

  const handleCompareClick = () => {
    if (selectedV1 && selectedV2) {
      onCompare(selectedV1, selectedV2);
    }
  };

  // Auto-select logic (keep basic defaults)
  React.useEffect(() => {
    if (versions.length >= 2) {
      if (!selectedV1) setSelectedV1(versions[versions.length - 2].filename);
      if (!selectedV2) setSelectedV2(versions[versions.length - 1].filename);
    }
  }, [versions.length]);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border w-80 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg text-foreground">Versions</h2>
          <button 
            onClick={onReset}
            className="text-xs text-destructive hover:underline"
            title="Tout supprimer"
          >
            Vider
          </button>
        </div>
        
        <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full bg-primary text-primary-foreground px-3 py-2 rounded text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
            {isUploading ? (
                <span className="animate-pulse">Envoi...</span>
            ) : (
                <>
                  <span className="text-lg font-bold">+</span> Nouvelle version
                </>
            )}
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf"
            onChange={handleFileChange}
        />
      </div>

      {/* Selection Control (Compact) */}
      <div className="p-4 bg-muted/10 border-b border-border">
          <div className="space-y-3">
            <div>
               <label className="text-xs font-semibold text-muted-foreground uppercase">Reference (V1)</label>
               <select 
                  value={selectedV1}
                  onChange={(e) => setSelectedV1(e.target.value)}
                  className="w-full mt-1 p-1.5 text-sm border border-input bg-background rounded focus:ring-1 focus:ring-ring"
               >
                  <option value="" disabled>Choisir...</option>
                  {versions.map((v, i) => (
                      <option key={v.filename} value={v.filename}>
                          V{i+1} - {v.filename}
                      </option>
                  ))}
               </select>
            </div>
            <div>
               <label className="text-xs font-semibold text-muted-foreground uppercase">Comparaison (V2)</label>
               <select 
                  value={selectedV2}
                  onChange={(e) => setSelectedV2(e.target.value)}
                  className="w-full mt-1 p-1.5 text-sm border border-input bg-background rounded focus:ring-1 focus:ring-ring"
               >
                  <option value="" disabled>Choisir...</option>
                  {versions.map((v, i) => (
                      <option key={v.filename} value={v.filename}>
                          V{i+1} - {v.filename}
                      </option>
                  ))}
               </select>
            </div>
            <button
                onClick={handleCompareClick}
                disabled={!selectedV1 || !selectedV2 || selectedV1 === selectedV2}
                className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                    !selectedV1 || !selectedV2 || selectedV1 === selectedV2
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
                Comparer
            </button>
          </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {versions.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8 italic">
                Aucun document
            </div>
        )}
        
        {versions.map((v, index) => {
            const isV1 = selectedV1 === v.filename;
            const isV2 = selectedV2 === v.filename;
            
            return (
                <div 
                    key={v.filename}
                    className={`p-3 rounded border transition-all ${
                        isV1 || isV2 
                        ? 'bg-accent/50 border-accent-foreground/20' 
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center min-w-[24px]">
                                <span className="text-xs font-bold text-muted-foreground">V{index + 1}</span>
                                <div className="h-full w-px bg-border my-1"></div>
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-medium text-sm truncate" title={v.filename}>
                                    {v.filename}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {new Date(v.modified * 1000).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Quick Action Badges/Buttons */}
                    <div className="flex gap-2 mt-2 ml-8">
                        <button
                            onClick={() => setSelectedV1(v.filename)}
                            className={`px-2 py-0.5 text-[10px] rounded border ${
                                isV1 
                                ? 'bg-blue-100 text-blue-700 border-blue-200 font-bold' 
                                : 'bg-muted text-muted-foreground hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        >
                            {isV1 ? 'Référence' : 'Set Ref'}
                        </button>
                        <button
                            onClick={() => setSelectedV2(v.filename)}
                            className={`px-2 py-0.5 text-[10px] rounded border ${
                                isV2 
                                ? 'bg-green-100 text-green-700 border-green-200 font-bold' 
                                : 'bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-600'
                            }`}
                        >
                             {isV2 ? 'Cible' : 'Set Cible'}
                        </button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
