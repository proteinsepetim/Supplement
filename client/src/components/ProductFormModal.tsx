/**
 * ProductFormModal - Admin Panel Ürün Ekleme/Düzenleme Modalı
 * FileUploader entegrasyonu ile S3 görsel yükleme
 */
import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import FileUploader from './FileUploader';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any; // Düzenleme modu için
  onSuccess?: () => void;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    basePrice: '',
    categoryId: '',
    brandId: '',
    imageUrl: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // tRPC mutations
  const createProductMutation = trpc.admin.products.create.useMutation();
  const updateProductMutation = trpc.admin.products.update.useMutation();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        basePrice: (product.basePrice / 100).toString() || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        imageUrl: product.imageUrl || '',
        isActive: product.isActive !== 'false',
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        basePrice: '',
        categoryId: '',
        brandId: '',
        imageUrl: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Ürün adı gerekli';
    if (!formData.slug.trim()) newErrors.slug = 'URL slug gerekli';
    if (!formData.basePrice) newErrors.basePrice = 'Fiyat gerekli';
    if (isNaN(parseFloat(formData.basePrice))) newErrors.basePrice = 'Geçerli bir fiyat girin';
    if (!formData.categoryId) newErrors.categoryId = 'Kategori seçin';
    if (!formData.imageUrl) newErrors.imageUrl = 'Ürün görseli gerekli';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        basePrice: Math.round(parseFloat(formData.basePrice) * 100),
        isActive: formData.isActive ? 'true' : 'false',
      };

      if (product) {
        await updateProductMutation.mutateAsync({
          id: product.id,
          ...payload,
        } as any);
        toast.success('Ürün başarıyla güncellendi!');
      } else {
        await createProductMutation.mutateAsync(payload as any);
        toast.success('Ürün başarıyla oluşturuldu!');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Form submit error:', error);
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-[#1B2A4A]">
            {product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Ürün Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ürün Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              placeholder="Örn: Whey Protein 2000g"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-[#FF6B35]/20'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setFormData({ ...formData, slug: e.target.value });
                setErrors({ ...errors, slug: '' });
              }}
              placeholder="whey-protein-2000g"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.slug
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-[#FF6B35]/20'
              }`}
            />
            {errors.slug && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.slug}
              </p>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ürün açıklaması..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
            />
          </div>

          {/* Fiyat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat (₺) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => {
                setFormData({ ...formData, basePrice: e.target.value });
                setErrors({ ...errors, basePrice: '' });
              }}
              placeholder="0.00"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.basePrice
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-[#FF6B35]/20'
              }`}
            />
            {errors.basePrice && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.basePrice}
              </p>
            )}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => {
                setFormData({ ...formData, categoryId: e.target.value });
                setErrors({ ...errors, categoryId: '' });
              }}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.categoryId
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-[#FF6B35]/20'
              }`}
            >
              <option value="">Kategori Seçin</option>
              <option value="protein-tozu">Protein Tozu</option>
              <option value="performans-guc">Performans & Güç</option>
              <option value="kilo-hacim">Kilo & Hacim</option>
              <option value="amino-asit">Amino Asit</option>
              <option value="enerji-dayaniklilik">Enerji & Dayanıklılık</option>
              <option value="vitamin-mineral">Vitamin & Mineral</option>
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.categoryId}
              </p>
            )}
          </div>

          {/* Görsel Yükleme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ürün Görseli *
            </label>
            <FileUploader
              onUploadComplete={(url) => {
                setFormData({ ...formData, imageUrl: url });
                setErrors({ ...errors, imageUrl: '' });
              }}
              folder="products"
              accept="image/*"
              maxSizeMB={5}
            />
            {errors.imageUrl && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.imageUrl}
              </p>
            )}
            {formData.imageUrl && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium mb-2">Yüklenen Görsel:</p>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Durum */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Ürünü Aktif Yap
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#FF6B35]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
