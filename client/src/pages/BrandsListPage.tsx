/*
 * BrandsListPage - A-Z Marka Listesi
 */
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ChevronRight, Search } from 'lucide-react';
import { brands, products } from '@/lib/data';

export default function BrandsListPage() {
  const [search, setSearch] = useState('');

  const filteredBrands = useMemo(() => {
    const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name));
    if (!search) return sorted;
    return sorted.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const letters = useMemo(() => {
    return Array.from(new Set(filteredBrands.map(b => b.name.charAt(0).toUpperCase()))).sort();
  }, [filteredBrands]);

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">Markalar</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Tüm Markalar ({brands.length})</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Marka ara..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-48" />
          </div>
        </div>

        {/* Letter Navigation */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {letters.map(letter => (
            <a key={letter} href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 text-sm font-heading font-bold text-[#1B2A4A] hover:bg-[#FF6B35] hover:text-white transition-colors">
              {letter}
            </a>
          ))}
        </div>

        {/* Brands by Letter */}
        {letters.map(letter => {
          const letterBrands = filteredBrands.filter(b => b.name.charAt(0).toUpperCase() === letter);
          return (
            <div key={letter} id={`letter-${letter}`} className="mb-6">
              <h2 className="font-heading font-bold text-lg text-[#FF6B35] border-b border-gray-100 pb-2 mb-3">{letter}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {letterBrands.map(brand => {
                  const productCount = products.filter(p => p.brandId === brand.id).length;
                  return (
                    <Link key={brand.id} href={`/marka/${brand.slug}`}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#FF6B35] hover:shadow-sm transition-all group">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="font-heading font-black text-sm text-[#1B2A4A] group-hover:text-[#FF6B35] transition-colors">{brand.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-sm text-[#1B2A4A] group-hover:text-[#FF6B35] transition-colors">{brand.name}</p>
                        <p className="text-[10px] text-gray-400">{brand.country} · {productCount} ürün</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
