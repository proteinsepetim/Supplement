import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@shared/utils";
import { Link } from "wouter";
import { ShoppingCart, Package, Star, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string | null;
    basePrice: number;
    isFeatured: boolean;
    shortDescription?: string | null;
    servingsCount?: number | null;
    ratingScore?: number | null;
    reviewCount?: number | null;
    variants?: Array<{
      id: number;
      name: string;
      price: number;
      compareAtPrice: number | null;
      stock: number;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const cheapestVariant = product.variants?.reduce((min, v) => v.price < min.price ? v : min, product.variants[0]);
  const hasDiscount = cheapestVariant?.compareAtPrice && cheapestVariant.compareAtPrice > cheapestVariant.price;
  const inStock = product.variants?.some(v => v.stock > 0);
  const displayPrice = cheapestVariant?.price ?? product.basePrice;

  // Calculate discount percentage
  const discountPercent = hasDiscount && cheapestVariant?.compareAtPrice
    ? Math.round(((cheapestVariant.compareAtPrice - cheapestVariant.price) / cheapestVariant.compareAtPrice) * 100)
    : 0;

  // Calculate per-serving cost
  const servingsCount = product.servingsCount;
  const perServingCost = servingsCount && servingsCount > 0 ? Math.round(displayPrice / servingsCount) : null;

  // Rating (0-100 scale, display as X.X/10)
  const ratingScore = product.ratingScore;
  const ratingDisplay = ratingScore ? (ratingScore / 10).toFixed(1) : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cheapestVariant || cheapestVariant.stock <= 0) {
      toast.error("Bu ürün şu anda stokta yok");
      return;
    }
    addItem({
      productId: product.id,
      variantId: cheapestVariant.id,
      productName: product.name,
      variantName: cheapestVariant.name,
      productSlug: product.slug,
      imageUrl: product.imageUrl,
      unitPrice: cheapestVariant.price,
      stock: cheapestVariant.stock,
    });
    toast.success("Sepete eklendi!");
  };

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-border/50">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Package className="h-12 w-12 text-muted-foreground/40" /></div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && <Badge className="bg-primary text-primary-foreground text-xs font-bold shadow-sm">ÇOK SATAN</Badge>}
            {!inStock && <Badge variant="secondary" className="text-xs">Tükendi</Badge>}
          </div>

          {/* Top-right: Discount badge */}
          {hasDiscount && discountPercent > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-xs font-bold shadow-sm flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" />%{discountPercent}
              </Badge>
            </div>
          )}

          {/* Rating badge - bottom-left */}
          {ratingDisplay && (
            <div className="absolute bottom-2 left-2 bg-black/80 text-white rounded-md px-2 py-1 flex items-center gap-1 text-xs font-bold shadow-md">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {ratingDisplay}
              {product.reviewCount ? <span className="text-white/60 font-normal">({product.reviewCount})</span> : null}
            </div>
          )}

          {/* Quick add button */}
          {inStock && (
            <Button
              size="sm"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg h-9 w-9 p-0"
              onClick={handleQuickAdd}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CardContent className="p-3 sm:p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">{product.name}</h3>

          {/* Per-serving cost */}
          {perServingCost && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Servis Başı: <span className="font-semibold text-foreground">{formatPrice(perServingCost)}</span>
              </span>
            </div>
          )}

          {/* Price section */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base text-primary">{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(cheapestVariant!.compareAtPrice!)}</span>
            )}
          </div>

          {product.variants && product.variants.length > 1 && (
            <p className="text-xs text-muted-foreground mt-1">{product.variants.length} varyant</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
