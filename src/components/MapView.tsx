import { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import domtoimage from 'dom-to-image-more';
import { Download } from 'lucide-react';
import type { MapPoint, MarkerStyle } from '../types';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PALETTE = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', 
  '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', 
  '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', 
  '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
];

interface MapViewProps {
  points: MapPoint[];
  onReset: () => void;
}

export function MapView({ points, onReset }: MapViewProps) {
  const [style, setStyle] = useState<MarkerStyle>('circle');
  const [isExporting, setIsExporting] = useState(false);
  const [minRadius, setMinRadius] = useState<number>(4);
  const [maxRadius, setMaxRadius] = useState<number>(24);
  const mapRef = useRef<HTMLDivElement>(null);

  const MAX_POINTS = 10000;
  const displayedPoints = useMemo(() => points.slice(0, MAX_POINTS), [points]);

  const centerLat = displayedPoints.length > 0 
    ? displayedPoints.reduce((sum, p) => sum + p.lat, 0) / displayedPoints.length 
    : 60.472;
  const centerLng = displayedPoints.length > 0 
    ? displayedPoints.reduce((sum, p) => sum + p.lng, 0) / displayedPoints.length 
    : 8.468;

  // Skalering kalkuleringer
  const validSizes = useMemo(() => displayedPoints.map(p => p.size).filter(s => s !== undefined && !isNaN(s)) as number[], [displayedPoints]);
  const hasSizeData = validSizes.length > 0;
  const minSize = hasSizeData ? Math.min(...validSizes) : 0;
  const maxSize = hasSizeData ? Math.max(...validSizes) : 0;

  const getRadius = (size?: number) => {
    if (size === undefined || isNaN(size) || maxSize === minSize) return 7;
    return minRadius + ((size - minSize) / (maxSize - minSize)) * (maxRadius - minRadius);
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return '#3388ff';
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PALETTE.length;
    return PALETTE[index];
  };

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(displayedPoints.map(p => p.category).filter(Boolean))) as string[];
  }, [displayedPoints]);

  const handleDownloadImage = async () => {
    if (!mapRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await domtoimage.toJpeg(mapRef.current, {
        quality: 0.9,
        bgcolor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = 'kartvisning.jpg';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Kunne ikke eksportere kartet:", err);
      alert("En feil oppstod ved nedlasting av kartet.");
    } finally {
      setIsExporting(false);
    }
  };

  const renderPoint = (point: MapPoint) => {
    const popupContent = (
      <Popup>
        {point.name && <h3 className="font-bold text-lg mb-1">{point.name}</h3>}
        {point.category && <p className="text-xs font-semibold text-blue-600 mb-1">{point.category}</p>}
        {point.size !== undefined && !isNaN(point.size) && <p className="text-xs font-mono text-gray-500 mb-1">Verdi: {point.size}</p>}
        {point.description && <p className="text-sm text-gray-600">{point.description}</p>}
      </Popup>
    );

    if (style === 'circle' || style === 'category') {
      const color = style === 'category' ? getCategoryColor(point.category) : '#3388ff';
      const opacity = style === 'category' ? 0.8 : 0.5;
      const radius = getRadius(point.size);
      
      return (
        <CircleMarker 
          key={point.id} 
          center={[point.lat, point.lng]}
          radius={radius}
          pathOptions={{ color, fillColor: color, fillOpacity: opacity, weight: 1 }}
        >
          {(point.name || point.description || point.category || point.size !== undefined) && popupContent}
        </CircleMarker>
      );
    }

    return (
      <Marker key={point.id} position={[point.lat, point.lng]}>
        {(point.name || point.description || point.category || point.size !== undefined) && popupContent}
      </Marker>
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-100px)] border rounded-lg overflow-hidden shadow-sm flex bg-gray-100">
      
      <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-md shadow-lg border border-gray-100 w-64 max-h-[90vh] overflow-y-auto flex flex-col custom-scrollbar">
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-700">
            Viser {displayedPoints.length} punkter
          </div>
          {points.length > MAX_POINTS && (
            <div className="text-xs text-red-500">(Begrenset fra {points.length})</div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
            Markørstil
          </label>
          <select 
            className="w-full text-sm border-gray-300 rounded p-1.5 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={style}
            onChange={(e) => setStyle(e.target.value as MarkerStyle)}
          >
            <option value="circle">Sirkler (Støtter skalering)</option>
            <option value="category">Farget etter Kategori</option>
            <option value="default">Standard Dråper</option>
          </select>
        </div>

        {hasSizeData && (style === 'circle' || style === 'category') && (
          <div className="mb-4 border-t pt-3">
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
              Radiusskalering (min / max)
            </label>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                value={minRadius} 
                onChange={(e) => setMinRadius(Number(e.target.value))}
                className="w-16 text-sm border-gray-300 rounded p-1 border focus:border-blue-500"
                min={1}
              />
              <span className="text-gray-500">-</span>
              <input 
                type="number" 
                value={maxRadius} 
                onChange={(e) => setMaxRadius(Number(e.target.value))}
                className="w-16 text-sm border-gray-300 rounded p-1 border focus:border-blue-500"
                min={minRadius}
              />
            </div>
          </div>
        )}

        <button 
          onClick={handleDownloadImage}
          disabled={isExporting}
          className="w-full mb-2 flex items-center justify-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded text-sm hover:bg-green-100 transition-colors font-medium disabled:opacity-50"
        >
          <Download size={16} className="mr-2" />
          {isExporting ? 'Eksporterer...' : 'Last ned som JPG'}
        </button>

        <button 
          onClick={onReset}
          className="w-full px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-sm hover:bg-red-100 transition-colors font-medium mb-4"
        >
          Lukk kart & Start på nytt
        </button>

        {/* Fargeforklaring / Legend */}
        {style === 'category' && uniqueCategories.length > 0 && (
          <div className="mt-2 border-t pt-4">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Fargeforklaring</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {uniqueCategories.map(cat => (
                <div key={cat} className="flex items-center text-sm text-gray-700">
                  <span 
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                    style={{ backgroundColor: getCategoryColor(cat) }}
                  ></span>
                  <span className="truncate" title={cat}>{cat}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div ref={mapRef} className="w-full h-full z-[1]">
        <MapContainer 
          center={[centerLat, centerLng]} 
          zoom={5} 
          style={{ height: '100%', width: '100%', backgroundColor: '#f3f4f6' }}
          preferCanvas={true} 
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            crossOrigin="anonymous" 
          />
          {displayedPoints.map(point => renderPoint(point))}
        </MapContainer>
      </div>
    </div>
  );
}
