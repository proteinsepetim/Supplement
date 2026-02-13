/*
 * ComparePage - İçerik Karşılaştırma Aracı
 * Farklı markaların besin değerlerini yan yana kıyaslama
 */
import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { ChevronRight, Plus, X, Star, ArrowRight } from 'lucide-react';
import { products, getBrandById, type Product } from '@/lib/data';

export default function ComparePage() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedProducts.some(sp => sp.id === p.id)
    ).slice(0, 6);
  }, [searchQuery, selectedProducts]);

  const addProduct = (product: Product) => {
    if (selectedProducts.length < 4) {
      setSelectedProducts([...selectedProducts, product]);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const comparisonFields = [
    { label: 'Marka', getValue: (p: Product) => getBrandById(p.brandId)?.name || '-' },
    { label: 'Fiyat', getValue: (p: Product) => `${p.variants[0].price.toLocaleString('tr-TR')} TL` },
    { label: 'Servis Sayısı', getValue: (p: Product) => p.variants[0].servings > 0 ? `${p.variants[0].servings}` : '-' },
    { label: 'Servis Başı Fiyat', getValue: (p: Product) => p.variants[0].servings > 0 ? `${(p.variants[0].price / p.variants[0].servings).toFixed(0)} TL` : '-' },
    { label: 'Gramaj', getValue: (p: Product) => p.variants[0].weight },
    { label: 'Puan', getValue: (p: Product) => `${p.rating}/5` },
    { label: 'Değerlendirme', getValue: (p: Product) => `${p.reviewCount} yorum` },
    { label: 'İçermez', getValue: (p: Product) => p.freeFrom?.join(', ') || '-' },
  ];

  // Nutrition comparison
  const nutritionLabels = useMemo(() => {
    const labels = new Set<string>();
    selectedProducts.forEach(p => {
      p.nutrition?.forEach((f: {label: string}) => labels.add(f.label));
    });
    return Array.from(labels);
  }, [selectedProducts]);

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">Ürün Karşılaştırma</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-[#1B2A4A]">Ürün Karşılaştırma</h1>
          <p className="text-gray-500 text-sm mt-2">En fazla 4 ürünü yan yana karşılaştırın</p>
        </div>

        {/* Product Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {selectedProducts.map(product => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 relative">
              <button onClick={() => removeProduct(product.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200">
                <X className="w-3 h-3" />
              </button>
              <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
              <p className="text-xs text-[#FF6B35] font-semibold">{getBrandById(product.brandId)?.name}</p>
              <p className="text-sm font-heading font-semibold text-[#1B2A4A] line-clamp-2 mt-0.5">{product.name}</p>
              <p className="text-sm font-bold text-[#FF6B35] mt-1">{product.variants[0].price.toLocaleString('tr-TR')} TL</p>
            </div>
          ))}
          {selectedProducts.length < 4 && (
            <div className="relative">
              <button onClick={() => setShowSearch(!showSearch)}
                className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#FF6B35] hover:bg-orange-50 transition-colors">
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-400 font-medium">Ürün Ekle</span>
              </button>
              {showSearch && (
                <div className="absolute top-0 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-10 p-3">
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                    placeholder="Ürün adı yazın..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {searchResults.map(product => (
                      <button key={product.id} onClick={() => addProduct(product)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-left">
                        <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-[10px] text-gray-400">{getBrandById(product.brandId)?.name}</p>
                        </div>
                      </button>
                    ))}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">Sonuç bulunamadı</p>
                    )}
                  </div>
                  <button onClick={() => setShowSearch(false)} className="w-full text-xs text-gray-400 mt-2 hover:text-gray-600">Kapat</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedProducts.length >= 2 && (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-[#1B2A4A] text-white px-4 py-3">
              <h2 className="font-heading font-bold text-sm">Genel Karşılaştırma</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {comparisonFields.map((field, i) => (
                    <tr key={field.label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2.5 font-semibold text-gray-600 w-40 border-r border-gray-100">{field.label}</td>
                      {selectedProducts.map(product => (
                        <td key={product.id} className="px-4 py-2.5 text-center text-gray-700">{field.getValue(product)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Nutrition Comparison */}
            {nutritionLabels.length > 0 && (
              <>
                <div className="bg-[#FF6B35] text-white px-4 py-3">
                  <h2 className="font-heading font-bold text-sm">Besin Değerleri Karşılaştırması</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {nutritionLabels.map((label, i) => (
                        <tr key={label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-2 font-semibold text-gray-600 w-40 border-r border-gray-100">{label}</td>
                          {selectedProducts.map(product => {
                            const fact = product.nutrition?.find((f: {label: string; perServing: string}) => f.label === label);
                            return <td key={product.id} className="px-4 py-2 text-center text-gray-700">{fact?.perServing || '-'}</td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Score Comparison */}
            {selectedProducts.some(p => p.scoreCard) && (
              <>
                <div className="bg-[#1B2A4A] text-white px-4 py-3">
                  <h2 className="font-heading font-bold text-sm">Skor Karşılaştırması</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {['Etki', 'Tat', 'Fiyat/Performans', 'Karışım'].map((label, i) => {
                        const key = ['effect', 'taste', 'price', 'mixing'][i] as keyof NonNullable<Product['scoreCard']>;
                        return (
                          <tr key={label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-4 py-2 font-semibold text-gray-600 w-40 border-r border-gray-100">{label}</td>
                            {selectedProducts.map(product => (
                              <td key={product.id} className="px-4 py-2 text-center">
                                {product.scoreCard ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div className="bg-[#FF6B35] h-2 rounded-full" style={{ width: `${product.scoreCard[key]}%` }} />
                                    </div>
                                    <span className="text-xs font-bold">{product.scoreCard[key]}</span>
                                  </div>
                                ) : '-'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {selectedProducts.length < 2 && (
          <div className="text-center py-10 text-gray-400">
            <p className="font-heading font-semibold text-lg">En az 2 ürün seçin</p>
            <p className="text-sm mt-1">Karşılaştırma tablosu otomatik oluşturulacaktır</p>
          </div>
        )}
      </div>
    </div>
  );
}
