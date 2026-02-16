/**
 * FileUploader - Drag & Drop File Upload Component
 * S3'e dosya yükleme için kullanılır (admin panel)
 */
import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
  onUploadComplete?: (url: string) => void;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUploader({
  onUploadComplete,
  folder = 'products',
  accept = 'image/*',
  maxSizeMB = 5,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = trpc.upload.image.useMutation();

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setUploadedUrl(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları yüklenebilir');
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır`);
      toast.error(`Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 50)); // 0-50% for reading
        }
      };

      reader.onload = async (e) => {
        try {
          const base64Data = (e.target?.result as string).split(',')[1];
          setProgress(60); // 60% after reading

          const result = await uploadMutation.mutateAsync({
            fileName: file.name,
            base64Data,
            contentType: file.type,
            folder,
          });

          setProgress(100);
          setUploadedUrl(result.url);
          toast.success('Dosya başarıyla yüklendi!');
          onUploadComplete?.(result.url);
        } catch (err) {
          console.error('Upload error:', err);
          setError('Yükleme sırasında hata oluştu');
          toast.error('Yükleme sırasında hata oluştu');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError('Dosya okunamadı');
        toast.error('Dosya okunamadı');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File handling error:', err);
      setError('Dosya işlenirken hata oluştu');
      setUploading(false);
    }
  }, [folder, maxSizeMB, onUploadComplete, uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleReset = useCallback(() => {
    setUploadedUrl(null);
    setError(null);
    setProgress(0);
  }, []);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!uploadedUrl && !error && (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${isDragging ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-gray-300 hover:border-gray-400'}
              ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
            `}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isDragging ? 'bg-[#FF6B35]/20' : 'bg-gray-100'
              }`}>
                <Upload className={`w-8 h-8 ${isDragging ? 'text-[#FF6B35]' : 'text-gray-400'}`} />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Dosyayı bırakın' : 'Dosya yüklemek için tıklayın veya sürükleyin'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimum {maxSizeMB}MB, sadece resim dosyaları
                </p>
              </div>

              {uploading && (
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FF6B35]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Yükleniyor... {progress}%</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {uploadedUrl && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border-2 border-green-200 bg-green-50 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 mb-1">Dosya başarıyla yüklendi!</p>
                <p className="text-xs text-green-600 truncate">{uploadedUrl}</p>
                <button
                  onClick={handleReset}
                  className="text-xs text-green-700 hover:text-green-900 mt-2 underline"
                >
                  Başka bir dosya yükle
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border-2 border-red-200 bg-red-50 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-1">Yükleme başarısız</p>
                <p className="text-xs text-red-600">{error}</p>
                <button
                  onClick={handleReset}
                  className="text-xs text-red-700 hover:text-red-900 mt-2 underline"
                >
                  Tekrar dene
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
