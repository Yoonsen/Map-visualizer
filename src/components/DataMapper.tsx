import { useState } from 'react';
import type { ParsedData, ColumnMapping } from '../types';

interface DataMapperProps {
  data: ParsedData;
  onMapConfirmed: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

export function DataMapper({ data, onMapConfirmed, onCancel }: DataMapperProps) {
  const guessLat = data.headers.find(h => h.toLowerCase().includes('lat') || h.toLowerCase() === 'y');
  const guessLng = data.headers.find(h => h.toLowerCase().includes('lon') || h.toLowerCase().includes('lng') || h.toLowerCase() === 'x');
  const guessName = data.headers.find(h => h.toLowerCase().includes('navn') || h.toLowerCase().includes('name') || h.toLowerCase().includes('title'));
  const guessCategory = data.headers.find(h => h.toLowerCase().includes('type') || h.toLowerCase().includes('kategori') || h.toLowerCase().includes('category'));
  const guessSize = data.headers.find(h => h.toLowerCase().includes('frekvens') || h.toLowerCase().includes('antall') || h.toLowerCase().includes('size') || h.toLowerCase().includes('count'));

  const [mapping, setMapping] = useState<ColumnMapping>({
    lat: guessLat || '',
    lng: guessLng || '',
    name: guessName || '',
    description: '',
    category: guessCategory || '',
    size: guessSize || ''
  });

  const isValid = mapping.lat && mapping.lng;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Velg kolonner fra "{data.filename}"</h2>
      <p className="text-gray-600 mb-6 text-sm">
        Filen inneholder {data.rows.length} rader. Vennligst angi hvilke kolonner som representerer koordinatene.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Breddegrad (Latitude) *</label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            value={mapping.lat}
            onChange={e => setMapping({...mapping, lat: e.target.value})}
          >
            <option value="">-- Velg kolonne --</option>
            {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lengdegrad (Longitude) *</label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            value={mapping.lng}
            onChange={e => setMapping({...mapping, lng: e.target.value})}
          >
            <option value="">-- Velg kolonne --</option>
            {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Navn (Valgfritt)</label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            value={mapping.name || ''}
            onChange={e => setMapping({...mapping, name: e.target.value})}
          >
            <option value="">-- Ingen --</option>
            {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse (Valgfritt)</label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            value={mapping.description || ''}
            onChange={e => setMapping({...mapping, description: e.target.value})}
          >
            <option value="">-- Ingen --</option>
            {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori / Type (Valgfritt)</label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            value={mapping.category || ''}
            onChange={e => setMapping({...mapping, category: e.target.value})}
          >
            <option value="">-- Ingen --</option>
            {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skalering / Frekvens (Valgfritt)</label>
          <select 
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            value={mapping.size || ''}
            onChange={e => setMapping({...mapping, size: e.target.value})}
          >
            <option value="">-- Ingen --</option>
            {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button 
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Avbryt
        </button>
        <button 
          onClick={() => onMapConfirmed(mapping)}
          disabled={!isValid}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Vis på kart
        </button>
      </div>
    </div>
  );
}
