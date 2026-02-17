import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { Link, useRoute } from "wouter";
import { CheckCircle, ShoppingBag, FileText } from "lucide-react";

export default function OrderSuccess() {
  const [, params] = useRoute("/order-success/:orderNumber");
  const orderNumber = params?.orderNumber || "";

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1 container py-12 sm:py-16">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">Siparişiniz Alındı!</h1>
            <p className="text-muted-foreground">
              Sipariş numaranız: <span className="font-mono font-bold text-foreground">{orderNumber}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Siparişiniz en kısa sürede hazırlanacak ve kargoya verilecektir.
              Sipariş durumunuzu "Siparişlerim" sayfasından takip edebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <Link href="/my-orders">
                <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Siparişlerim</Button>
              </Link>
              <Link href="/products">
                <Button><ShoppingBag className="mr-2 h-4 w-4" /> Alışverişe Devam</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <StoreFooter />
    </div>
  );
}
