import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { 
  useListBusinesses, useUpdateBusiness, 
  useListDeliveries, useUpdateDelivery,
  useGetDashboardSummary, getListBusinessesQueryKey, getListDeliveriesQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Truck, Package, Activity, LogOut, Check, X, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboard() {
  const { isAdmin, logoutAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!isAdmin) {
    setLocation("/administrator");
    return null;
  }

  const { data: summary } = useGetDashboardSummary();
  const { data: businesses } = useListBusinesses();
  const { data: couriers } = useListDeliveries();

  const updateBiz = useUpdateBusiness();
  const updateCourier = useUpdateDelivery();

  const handleLogout = () => {
    logoutAdmin();
    setLocation("/administrator");
  };

  const handleBizStatus = (id: number, status: string) => {
    updateBiz.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Statusi u ndryshua" });
        queryClient.invalidateQueries({ queryKey: getListBusinessesQueryKey() });
      }
    });
  };

  const handleCourierStatus = (id: number, status: string) => {
    updateCourier.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Statusi u ndryshua" });
        queryClient.invalidateQueries({ queryKey: getListDeliveriesQueryKey() });
      }
    });
  };

  const pendingBiz = businesses?.filter(b => b.status === 'pending') || [];
  const approvedBiz = businesses?.filter(b => b.status === 'approved') || [];
  
  const pendingCouriers = couriers?.filter(c => c.status === 'pending') || [];
  const approvedCouriers = couriers?.filter(c => c.status === 'approved') || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-black text-white border-b border-zinc-800 sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">TiliGo Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            <LogOut className="h-4 w-4 mr-2" /> Dilni
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Biznese</p>
                <h3 className="text-2xl font-black">{summary?.active_businesses || 0} <span className="text-sm font-normal text-muted-foreground">aktive</span></h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Dorëzues</p>
                <h3 className="text-2xl font-black">{summary?.approved_couriers || 0} <span className="text-sm font-normal text-muted-foreground">aprovuar</span></h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Porosi Sot</p>
                <h3 className="text-2xl font-black">{summary?.active_orders || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Të Ardhura Sot</p>
                <h3 className="text-2xl font-black">{summary?.today_revenue?.toFixed(2) || "0.00"}€</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bizneset" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="bizneset" className="gap-2">
              Bizneset {pendingBiz.length > 0 && <Badge variant="destructive" className="ml-1 h-5">{pendingBiz.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="dorezuesit" className="gap-2">
              Dorëzuesit {pendingCouriers.length > 0 && <Badge variant="destructive" className="ml-1 h-5">{pendingCouriers.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="porosi">Porositë</TabsTrigger>
          </TabsList>

          <TabsContent value="bizneset" className="space-y-6">
            {pendingBiz.length > 0 && (
              <Card className="border-orange-200 shadow-sm">
                <CardHeader className="bg-orange-50 border-b border-orange-100 py-3">
                  <CardTitle className="text-orange-800 text-lg">Kërkesa të reja për biznese ({pendingBiz.length})</CardTitle>
                </CardHeader>
                <div className="divide-y">
                  {pendingBiz.map(b => (
                    <div key={b.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                      <div>
                        <h4 className="font-bold text-lg">{b.name}</h4>
                        <p className="text-sm text-muted-foreground">{b.category} • {b.phone} • {b.address}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button onClick={() => handleBizStatus(b.id, 'approved')} className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
                          <Check className="h-4 w-4 mr-1" /> Aprovo
                        </Button>
                        <Button onClick={() => handleBizStatus(b.id, 'rejected')} variant="outline" className="text-destructive flex-1 sm:flex-none">
                          <X className="h-4 w-4 mr-1" /> Refuzo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Bizneset e Aprovuara</CardTitle>
              </CardHeader>
              <div className="divide-y">
                {approvedBiz.map(b => (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-bold">{b.name}</h4>
                      <p className="text-sm text-muted-foreground">{b.category}</p>
                    </div>
                    <Badge variant={b.is_open ? "default" : "secondary"}>
                      {b.is_open ? "Hapur" : "Mbyllur"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="dorezuesit" className="space-y-6">
            {pendingCouriers.length > 0 && (
              <Card className="border-orange-200 shadow-sm">
                <CardHeader className="bg-orange-50 border-b border-orange-100 py-3">
                  <CardTitle className="text-orange-800 text-lg">Kërkesa të reja nga dorëzuesit ({pendingCouriers.length})</CardTitle>
                </CardHeader>
                <div className="divide-y">
                  {pendingCouriers.map(c => (
                    <div key={c.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                      <div>
                        <h4 className="font-bold text-lg">{c.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">Automjeti: {c.vehicle} • Tel: {c.phone}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button onClick={() => handleCourierStatus(c.id, 'approved')} className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
                          <Check className="h-4 w-4 mr-1" /> Aprovo
                        </Button>
                        <Button onClick={() => handleCourierStatus(c.id, 'rejected')} variant="outline" className="text-destructive flex-1 sm:flex-none">
                          <X className="h-4 w-4 mr-1" /> Refuzo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Dorëzuesit Aktiv</CardTitle>
              </CardHeader>
              <div className="divide-y">
                {approvedCouriers.map(c => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-bold">{c.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{c.vehicle}</p>
                    </div>
                    <Badge variant={c.is_available ? "default" : "secondary"} className={c.is_available ? "bg-green-500" : ""}>
                      {c.is_available ? "Në punë" : "Jo i qasshëm"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="porosi">
             <Card className="p-8 text-center border-dashed">
                Të gjitha porositë në platformë do të shfaqen këtu për monitorim.
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}