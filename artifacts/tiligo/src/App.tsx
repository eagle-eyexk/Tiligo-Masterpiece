import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import NotFound from "@/pages/not-found";

// Customer Pages
import Home from "@/pages/home";
import BusinessPage from "@/pages/business";
import CheckoutPage from "@/pages/checkout";
import TrackOrderPage from "@/pages/track";
import MyOrdersPage from "@/pages/orders";
import DownloadAppPage from "@/pages/download";

// Business Portal
import BusinessLogin from "@/pages/business/login";
import BusinessRegister from "@/pages/business/register";
import BusinessDashboard from "@/pages/business/dashboard";

// Courier Portal
import CourierLogin from "@/pages/courier/login";
import CourierRegister from "@/pages/courier/register";
import CourierDashboard from "@/pages/courier/dashboard";

// Admin Portal
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/dyqani/:id" component={BusinessPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/gjurmo/:code" component={TrackOrderPage} />
      <Route path="/porositjet-e-mia" component={MyOrdersPage} />
      <Route path="/shkarko-app" component={DownloadAppPage} />

      {/* Business Routes */}
      <Route path="/biznesi/login" component={BusinessLogin} />
      <Route path="/biznesi/register" component={BusinessRegister} />
      <Route path="/biznesi/dashboard" component={BusinessDashboard} />

      {/* Courier Routes */}
      <Route path="/dorezuesi/login" component={CourierLogin} />
      <Route path="/dorezuesi/register" component={CourierRegister} />
      <Route path="/dorezuesi/dashboard" component={CourierDashboard} />

      {/* Admin Routes */}
      <Route path="/administrator" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;