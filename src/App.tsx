import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataMapper } from './components/DataMapper';
import { MapView } from './components/MapView';
import { DataTable } from './components/DataTable';
import type { ParsedData, ColumnMapping, MapPoint } from './types';
import { Map as MapIcon, Table as TableIcon } from 'lucide-react';

function App() {
  const [data, setData] = useState<ParsedData | null>(null);
  const [points, setPoints] = useState<MapPoint[] | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');

  const handleDataLoaded = (parsedData: ParsedData) => {
    setData(parsedData);
  };

  const handleMapConfirmed = (mapping: ColumnMapping) => {
    if (!data) return;

    const mappedPoints: MapPoint[] = [];
    
    data.rows.forEach(row => {
      const latVal = parseFloat(row[mapping.lat]);
      const lngVal = parseFloat(row[mapping.lng]);
      
      if (!isNaN(latVal) && !isNaN(lngVal)) {
        mappedPoints.push({
          id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
          lat: latVal,
          lng: lngVal,
          name: mapping.name ? row[mapping.name] : undefined,
          description: mapping.description ? row[mapping.description] : undefined,
          category: mapping.category ? String(row[mapping.category]) : undefined,
          size: mapping.size ? parseFloat(row[mapping.size]) : undefined,
          originalData: row
        });
      }
    });

    setPoints(mappedPoints);
    setActiveTab('map');
  };

  const removePoint = (id: string) => {
    setPoints(prev => prev ? prev.filter(p => p.id !== id) : null);
  };

  const reset = () => {
    setData(null);
    setPoints(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <MapIcon className="text-blue-600 mr-3" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">Map Visualizer</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!data && !points && (
          <div className="max-w-2xl mx-auto mt-10">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Last opp fil for å starte</h2>
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        )}

        {data && !points && (
          <DataMapper 
            data={data} 
            onMapConfirmed={handleMapConfirmed} 
            onCancel={reset}
          />
        )}

        {points && (
          <div>
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 flex items-center font-medium text-sm focus:outline-none ${
                  activeTab === 'map' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                }`}
                onClick={() => setActiveTab('map')}
              >
                <MapIcon size={16} className="mr-2" />
                Kartvisning
              </button>
              <button
                className={`py-2 px-4 flex items-center font-medium text-sm focus:outline-none ${
                  activeTab === 'table' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                }`}
                onClick={() => setActiveTab('table')}
              >
                <TableIcon size={16} className="mr-2" />
                Rediger Data ({points.length})
              </button>
            </div>

            {activeTab === 'map' ? (
              <MapView points={points} onReset={reset} />
            ) : (
              <DataTable points={points} onRemove={removePoint} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
