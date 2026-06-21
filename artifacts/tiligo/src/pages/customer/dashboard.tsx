import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/app-layout";
import { useListOrders } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User, Phone, Mail, MapPin, LogOut, Package,
  Clock, ChevronRight, ShoppingBag, Star, Settings
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

const STATUS_COLORS: Record<string, string> = {
  e_re: "bg-blue-100 text-blue-700 border-blue-200",
  pranuar: "bg-sky-100 text-sky-700 border-sky-200",
  ne_pergatitje: "bg-yellow-100 text-yellow-700 border-yellow-200",
  gati_per_dorezim: "bg-orange-100 text-orange-700 border-orange-200",
  ne_rruge: "bg-purple-100 text-purple-700 border-purple-200",
  dorezuar: "bg-green-100 text-green-700 border-green-200",
  anuluar: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  e_re: "E re",
  pranuar: "Pranuar",
  ne_pergatitje: "Në përgatitje",
  gati_per_dorezim: "Gati",
  ne_rruge: "Në rrugë 🛵",
  dorezuar: "Dorëzuar ✓",
  anuluar: "Anuluar",
};

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const { customer, logoutCustomer } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [editMode, setEditMode] = useState(false);

  if (!customer) {
    setLocation("/kycu");
    return null;
  }

  const { data: orders, isLoading } = useListOrders(
    { customer_phone: customer.phone },
    { query: { refetchInterval: 15000 } }
  );
  const { customerToken } = useAuth();

  const handleLogout = () => {
    logoutCustomer();
    toast({ title: "U shkëput me sukses" });
    setLocation("/");
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
        },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          address: fd.get("address"),
        }),
      });
      if (!res.ok) throw new Error("Gabim në ruajtje");
      toast({ title: "Profili u ruajt!" });
      setEditMode(false);
    } catch {
      toast({ title: "Gabim", variant: "destructive" });
    }
  };

  const totalOrders = orders?.length || 0;
  const deliveredOrders = orders?.filter(o => o.status === "dorezuar").length || 0;
  const totalSpent = orders?.filter(o => o.status === "dorezuar").reduce((s, o) => s + o.total, 0) || 0;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="glass rounded-2xl border border-white/60 p-6 mb-6 shadow-lg shadow-sky-100/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-16 w-16 rounded-2xl tiligo-gradient flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sky-300/40 shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-foreground">{customer.name}</h1>
              <div className="flex flex-wrap gap-3 mt-1">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-sky-500" /> {customer.email}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-green-500" /> {customer.phone}
                </span>
                {customer.address && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-sky-500" /> {customer.address}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0"
            >
              <LogOut className="h-4 w-4 mr-1" /> Dil
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Porosi Gjithsej", value: totalOrders, icon: Package, color: "text-sky-600", bg: "bg-sky-50" },
              { label: "Të Dorëzuara", value: deliveredOrders, icon: Star, color: "text-green-600", bg: "bg-green-50" },
              { label: "Shpenzuar", value: `${totalSpent.toFixed(2)}€`, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center border border-white/60`}>
                <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
                <p className="text-lg font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "orders", label: "Porositë e Mia", icon: Package },
            { id: "profile", label: "Profili", icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "tiligo-gradient text-white shadow-md shadow-sky-300/40"
                  : "glass border border-sky-200/70 text-sky-700 hover:border-sky-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "orders" && totalOrders > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "orders" ? "bg-white/30" : "bg-sky-100 text-sky-700"}`}>
                  {totalOrders}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Duke ngarkuar porositë...</div>
            ) : !orders || orders.length === 0 ? (
              <div className="glass rounded-xl border border-sky-100 p-12 text-center">
                <Package className="h-12 w-12 text-sky-200 mx-auto mb-3" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">Nuk keni porosi ende</p>
                <p className="text-sm text-muted-foreground mb-4">Porositni ushqimin tuaj të preferuar!</p>
                <Link href="/">
                  <Button className="tiligo-gradient border-0 shadow-md">Porosit Tani</Button>
                </Link>
              </div>
            ) : (
              orders.map(order => (
                <Link key={order.id} href={`/gjurmo/${order.order_code}`}>
                  <div className="glass border border-white/60 rounded-xl p-4 hover:border-sky-200 hover:shadow-md hover:shadow-sky-100/40 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground">{order.business_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.items?.map((i: any) => `${i.qty}x ${i.name}`).join(", ")}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-sky-400" />
                            {new Date(order.created_at || "").toLocaleDateString("sq-AL", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="font-bold text-foreground">{order.total.toFixed(2)}€</span>
                          <span className="text-muted-foreground">{order.order_code}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-sky-500 transition-colors shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="glass rounded-2xl border border-white/60 p-6 shadow-lg shadow-sky-100/30">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Informacionet e Llogarisë</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
                className="glass border-sky-200 text-sky-700"
              >
                {editMode ? "Anulo" : "Ndrysho"}
              </Button>
            </div>

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Emri i plotë</label>
                  <Input name="name" defaultValue={customer.name} className="glass border-sky-200/70" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Numri i telefonit</label>
                  <Input name="phone" defaultValue={customer.phone} className="glass border-sky-200/70" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Adresa</label>
                  <Input name="address" defaultValue={customer.address || ""} placeholder="Rruga, Lagjja, Qyteti..." className="glass border-sky-200/70" />
                </div>
                <Button type="submit" className="tiligo-gradient border-0 shadow-md font-bold">
                  Ruaj Ndryshimet
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {[
                  { icon: User, label: "Emri", value: customer.name, color: "text-sky-500" },
                  { icon: Mail, label: "Email", value: customer.email, color: "text-green-500" },
                  { icon: Phone, label: "Telefoni", value: customer.phone, color: "text-sky-500" },
                  { icon: MapPin, label: "Adresa", value: customer.address || "—", color: "text-green-500" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60">
                    <item.icon className={`h-5 w-5 ${item.color} shrink-0`} />
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
