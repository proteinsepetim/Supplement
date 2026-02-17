import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@shared/utils";
import { Link } from "wouter";
import { ShoppingCart, Package } from "lucide-react";
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
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Package className="h-12 w-12 text-muted-foreground/40" /></div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && <Badge className="bg-accent text-accent-foreground text-xs">Öne Çıkan</Badge>}
            {hasDiscount && <Badge variant="destructive" className="text-xs">İndirimli</Badge>}
            {!inStock && <Badge variant="secondary" className="text-xs">Tükendi</Badge>}
          </div>
          {inStock && (
            <Button
              size="sm"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={handleQuickAdd}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
          {product.shortDescription && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{product.shortDescription}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{formatPrice(displayPrice)}</span>
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
