import { useState, useMemo } from 'react';
import type { MapPoint } from '../types';
import { Search, Trash2 } from 'lucide-react';

interface DataTableProps {
  points: MapPoint[];
  onRemove: (id: string) => void;
}

export function DataTable({ points, onRemove }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPoints = useMemo(() => {
    if (!searchTerm) return points;
    const lower = searchTerm.toLowerCase();
    return points.filter(p => 
      (p.name?.toLowerCase().includes(lower)) || 
      (p.category?.toLowerCase().includes(lower)) ||
      (p.description?.toLowerCase().includes(lower))
    );
  }, [points, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Datatabell ({filteredPoints.length} rader)</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-64"
            placeholder="Søk i navn, kategori..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[calc(100vh-250px)] custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navn</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdi / Str.</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breddegrad</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lengdegrad</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Handling</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPoints.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Ingen resultater funnet.
                </td>
              </tr>
            ) : (
              filteredPoints.map((point) => (
                <tr key={point.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {point.name || <span className="text-gray-400 italic">Uten navn</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {point.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {point.size !== undefined ? point.size : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {point.lat.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {point.lng.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onRemove(point.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded hover:bg-red-100 transition-colors inline-flex items-center"
                      title="Fjern fra kartet"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
