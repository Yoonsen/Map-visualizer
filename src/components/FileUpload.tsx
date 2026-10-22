import { useCallback, useState } from 'react';
import type React from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ParsedData } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: ParsedData) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            onDataLoaded({
              headers: results.meta.fields,
              rows: results.data as Record<string, any>[],
              filename: file.name
            });
          } else {
            setError("Kunne ikke finne overskrifter i CSV-filen.");
          }
        },
        error: (err) => {
          setError(`Feil ved lesing av CSV: ${err.message}`);
        }
      });
    } else if (extension === 'xls' || extension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          
          if (json.length > 0) {
            const headers = Object.keys(json[0] as object);
            onDataLoaded({
              headers,
              rows: json as Record<string, any>[],
              filename: file.name
            });
          } else {
            setError("Regnearket er tomt.");
          }
        } catch {
          setError("Feil ved lesing av Excel-filen.");
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError("Ugyldig filtype. Vennligst last opp en .csv, .xls eller .xlsx fil.");
    }
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-blue-100 rounded-full text-blue-600">
          <Upload size={32} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">Last opp fil</p>
          <p className="text-sm text-gray-500">Dra og slipp filen her, eller klikk for å velge</p>
        </div>
        
        <input 
          type="file" 
          accept=".csv, .xlsx, .xls" 
          className="hidden" 
          id="file-upload"
          onChange={handleChange}
        />
        <label 
          htmlFor="file-upload" 
          className="px-6 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Velg fil
        </label>
        
        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-4">
          <FileSpreadsheet size={16} />
          <span>Støtter CSV, XLS, XLSX</span>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
