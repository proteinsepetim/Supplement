import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { SearchProvider } from "./contexts/SearchContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";
import BrandPage from "./pages/BrandPage";
import BrandsListPage from "./pages/BrandsListPage";
import QuizPage from "./pages/QuizPage";
import ComparePage from "./pages/ComparePage";
import BundlePage from "./pages/BundlePage";
import FavoritesPage from "./pages/FavoritesPage";
import StaticPage from "./pages/StaticPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotificationPreferencesPage from "./pages/NotificationPreferencesPage";
import PushNotificationBanner from "./components/PushNotificationBanner";
import Layout from "./components/Layout";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/kategori/:slug" component={CategoryPage} />
      <Route path="/kategori/:slug/:sub" component={CategoryPage} />
      <Route path="/urun/:slug" component={ProductDetail} />
      <Route path="/sepet" component={CartPage} />
      <Route path="/odeme" component={CheckoutPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/marka/:slug" component={BrandPage} />
      <Route path="/markalar" component={BrandsListPage} />
      <Route path="/supplement-sihirbazi" component={QuizPage} />
      <Route path="/karsilastir" component={ComparePage} />
      <Route path="/paket-olustur" component={BundlePage} />
      <Route path="/favoriler" component={FavoritesPage} />
      <Route path="/bildirimler" component={NotificationsPage} />
      <Route path="/bildirim-tercihleri" component={NotificationPreferencesPage} />
      <Route path="/sayfa/:slug" component={StaticPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <NotificationProvider>
          <CartProvider>
            <SearchProvider>
              <TooltipProvider>
                <Toaster richColors position="top-right" />
                <Layout>
                  <Router />
                  <PushNotificationBanner />
                </Layout>
              </TooltipProvider>
            </SearchProvider>
          </CartProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
