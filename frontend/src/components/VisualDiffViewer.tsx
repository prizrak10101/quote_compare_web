import React, { useState } from 'react';

interface VisualDiffProps {
  visualDiff: Array<{
    page: number;
    img1: string | null;
    img2: string | null;
  }>;
  fileName1: string;
  fileName2: string;
}

export const VisualDiffViewer: React.FC<VisualDiffProps> = ({ visualDiff, fileName1, fileName2 }) => {
  const [scale, setScale] = useState(100);

  return (
    <div className="mt-8 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Comparaison Visuelle</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setScale(s => Math.max(50, s - 10))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="text-sm font-medium">{scale}%</span>
          <button 
            onClick={() => setScale(s => Math.min(200, s + 10))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {visualDiff.map((pageData, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
            <h4 className="font-semibold mb-4 text-center">Page {pageData.page}</h4>
            <div className="flex flex-col md:flex-row gap-4 justify-center overflow-auto">
              {pageData.img1 && (
                <div className="flex-1 min-w-0">
                  <div className="text-center mb-2 text-sm font-medium text-red-600 bg-red-50 py-1 rounded">
                    {fileName1} (Suppressions en rouge)
                  </div>
                  <div className="border border-gray-300 shadow-md inline-block bg-white">
                    <img 
                      src={`data:image/png;base64,${pageData.img1}`} 
                      alt={`Page ${pageData.page} - ${fileName1}`}
                      style={{ width: `${scale}%`, maxWidth: 'none' }} 
                    />
                  </div>
                </div>
              )}
              
              {pageData.img2 && (
                <div className="flex-1 min-w-0">
                  <div className="text-center mb-2 text-sm font-medium text-green-600 bg-green-50 py-1 rounded">
                    {fileName2} (Ajouts en vert)
                  </div>
                  <div className="border border-gray-300 shadow-md inline-block bg-white">
                    <img 
                      src={`data:image/png;base64,${pageData.img2}`} 
                      alt={`Page ${pageData.page} - ${fileName2}`}
                      style={{ width: `${scale}%`, maxWidth: 'none' }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

