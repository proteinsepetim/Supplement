import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@shared/utils";
import { Gift, Truck, Percent, Tag, ShoppingBag, Check, Sparkles } from "lucide-react";
import { useMemo } from "react";

export default function CampaignBanner() {
  const { items } = useCart();

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);

  const cartItems = useMemo(() => items.map(item => ({
    productId: item.productId,
    variantId: item.variantId,
    categoryId: 0, // Will be enriched later if needed
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })), [items]);

  const { data: activeCampaigns = [] } = trpc.campaigns.active.useQuery();

  if (activeCampaigns.length === 0 || items.length === 0) return null;

  return (
    <div className="space-y-3">
      {activeCampaigns.map((campaign: any) => {
        const Icon = campaign.ruleType === "min_cart_gift" ? Gift
          : campaign.ruleType === "buy_x_get_y" ? ShoppingBag
          : campaign.ruleType === "cart_discount_percent" ? Percent
          : campaign.ruleType === "cart_discount_amount" ? Tag
          : Truck;

        const minAmount = campaign.minCartAmount || 0;
        const isAchieved = minAmount > 0 ? subtotal >= minAmount : true;
        const progressPercent = minAmount > 0 ? Math.min(100, (subtotal / minAmount) * 100) : 100;
        const remaining = minAmount > 0 ? Math.max(0, minAmount - subtotal) : 0;

        return (
          <div key={campaign.id} className={`rounded-xl p-4 border-2 transition-all ${
            isAchieved ? "border-primary/30 bg-primary/5" : "border-dashed border-muted-foreground/20 bg-muted/30"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${isAchieved ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {isAchieved ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{campaign.name}</span>
                  {isAchieved && <Badge className="bg-primary/20 text-primary border-0 text-xs">Kazanıldı!</Badge>}
                </div>
                {campaign.description && (
                  <p className="text-xs text-muted-foreground mb-2">{campaign.description}</p>
                )}
                {minAmount > 0 && !isAchieved && (
                  <>
                    <Progress value={progressPercent} className="h-2 mb-1" />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="font-medium text-primary">{formatPrice(remaining)}</span> daha harca,
                      {campaign.giftProductName ? ` ${campaign.giftProductName} kazan!` : " kampanyadan yararlan!"}
                    </p>
                  </>
                )}
                {isAchieved && campaign.giftProductName && (
                  <div className="flex items-center gap-2 mt-1">
                    <Gift className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{campaign.giftProductName} sepetine eklendi!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
