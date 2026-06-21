import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useListOrders, useUpdateOrder, useUpdateBusiness, getListOrdersQueryKey, getGetBusinessQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Package, Store, Clock, Settings, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function BusinessDashboard() {
  const { business, logoutBusiness, loginBusiness } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!business) {
    setLocation("/biznesi/login");
    return null;
  }

  const { data: orders, isLoading: loadingOrders } = useListOrders(
    { business_id: business.id },
    { query: { enabled: !!business.id, queryKey: getListOrdersQueryKey({ business_id: business.id }) } }
  );

  const updateOrder = useUpdateOrder();
  const updateBiz = useUpdateBusiness();

  const handleLogout = () => {
    logoutBusiness();
    setLocation("/biznesi/login");
  };

  const handleStatusChange = (orderId: number, status: string) => {
    updateOrder.mutate({ id: orderId, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Statusi u përditësua" });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ business_id: business.id }) });
      }
    });
  };

  const toggleOpen = () => {
    updateBiz.mutate({ id: business.id, data: { is_open: !business.is_open } }, {
      onSuccess: (updated) => {
        loginBusiness(updated); // Update context
        toast({ title: updated.is_open ? "Dyqani u hap" : "Dyqani u mbyll" });
      }
    });
  };

  const activeOrders = orders?.filter(o => ['e_re', 'pranuar', 'ne_pergatitje', 'gati_per_dorezim'].includes(o.status)) || [];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold">TG</div>
            <span className="font-bold hidden sm:inline">Portali i Biznesit</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{business.is_open ? "Hapur" : "Mbyllur"}</span>
              <Switch checked={business.is_open} onCheckedChange={toggleOpen} />
            </div>
            <div className="h-6 w-px bg-border"></div>
            <span className="font-medium text-sm">{business.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="porosi" className="space-y-6">
          <TabsList className="bg-white w-full sm:w-auto overflow-x-auto flex-nowrap justify-start p-1 h-12">
            <TabsTrigger value="porosi" className="flex items-center gap-2 h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" /> Porositë
              {activeOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 h-5">{activeOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2 h-10 px-4"><Store className="h-4 w-4" /> Menu</TabsTrigger>
            <TabsTrigger value="historiku" className="flex items-center gap-2 h-10 px-4"><Clock className="h-4 w-4" /> Historiku</TabsTrigger>
            <TabsTrigger value="cilesimet" className="flex items-center gap-2 h-10 px-4"><Settings className="h-4 w-4" /> Cilësimet</TabsTrigger>
          </TabsList>

          <TabsContent value="porosi" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Porositë Aktive</h2>
                {activeOrders.length === 0 ? (
                  <Card className="border-dashed shadow-none">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
                      <Package className="h-12 w-12 mb-4 opacity-20" />
                      <p>Nuk ka porosi aktive për momentin.</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeOrders.map(order => (
                    <Card key={order.id} className="shadow-sm border-0 ring-1 ring-border/50">
                      <CardContent className="p-0">
                        <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Badge className="text-sm font-bold bg-primary/20 text-primary hover:bg-primary/20">{order.order_code}</Badge>
                            <span className="text-sm text-muted-foreground">{format(new Date(order.created_at || ''), 'HH:mm')}</span>
                          </div>
                          <Badge variant="outline" className="uppercase font-bold">{order.status}</Badge>
                        </div>
                        <div className="p-4 flex flex-col md:flex-row gap-6">
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Klienti</p>
                              <p className="font-medium">{order.customer_name} ({order.customer_phone})</p>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg border">
                              {order.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm py-1">
                                  <span><span className="font-bold text-primary mr-1">{item.qty}x</span> {item.name}</span>
                                </div>
                              ))}
                            </div>
                            {order.notes && (
                              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                <strong>Shënim:</strong> {order.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="w-full md:w-48 flex flex-col gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                            {order.status === 'e_re' && (
                              <>
                                <Button onClick={() => handleStatusChange(order.id, 'pranuar')} className="w-full bg-green-500 hover:bg-green-600">Prano</Button>
                                <Button onClick={() => handleStatusChange(order.id, 'anuluar')} variant="outline" className="w-full text-destructive border-destructive">Refuzo</Button>
                              </>
                            )}
                            {order.status === 'pranuar' && (
                              <Button onClick={() => handleStatusChange(order.id, 'ne_pergatitje')} className="w-full">Në përgatitje</Button>
                            )}
                            {order.status === 'ne_pergatitje' && (
                              <Button onClick={() => handleStatusChange(order.id, 'gati_per_dorezim')} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">Gati për dorëzim</Button>
                            )}
                            {order.status === 'gati_per_dorezim' && (
                              <div className="text-center p-3 bg-muted rounded-lg border">
                                <p className="text-sm font-medium mb-1">Po pret dorëzuesin</p>
                                <div className="flex justify-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Statistika të Shpejta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Porosi sot</span>
                      <span className="font-bold text-xl">{orders?.filter(o => o.created_at?.startsWith(new Date().toISOString().split('T')[0])).length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Të ardhura sot</span>
                      <span className="font-bold text-xl text-green-600">
                        {orders?.filter(o => o.created_at?.startsWith(new Date().toISOString().split('T')[0]) && o.status === 'dorezuar')
                                .reduce((sum, o) => sum + (o.total - o.delivery_fee), 0).toFixed(2) || "0.00"}€
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="menu">
            <Card className="p-8 text-center border-dashed">
              <h3 className="font-bold text-lg mb-2">Menaxhimi i Menysë</h3>
              <p className="text-muted-foreground">Ky seksion do të shtohet së shpejti.</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="historiku">
            <Card className="p-8 text-center border-dashed">
              <h3 className="font-bold text-lg mb-2">Historiku i Porosive</h3>
              <p className="text-muted-foreground">Ky seksion do të shtohet së shpejti.</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="cilesimet">
            <Card className="p-8 text-center border-dashed">
              <h3 className="font-bold text-lg mb-2">Cilësimet e Biznesit</h3>
              <p className="text-muted-foreground">Ky seksion do të shtohet së shpejti.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}