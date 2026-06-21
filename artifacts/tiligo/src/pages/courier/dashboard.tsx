import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useListOrders, useUpdateOrder, useUpdateDelivery, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, MapPin, Navigation, Package, Truck, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CourierDashboard() {
  const { courier, logoutCourier, loginCourier } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  if (!courier) {
    setLocation("/dorezuesi/login");
    return null;
  }

  // Polling for live location
  useEffect(() => {
    if (!courier.is_available) return;
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    
    return () => navigator.geolocation.clearWatch(watchId);
  }, [courier.is_available]);

  const { data: availableOrders } = useListOrders(
    { status: 'gati_per_dorezim' },
    { query: { enabled: courier.is_available, refetchInterval: 10000, queryKey: getListOrdersQueryKey({ status: 'gati_per_dorezim' }) } }
  );

  const { data: activeOrders } = useListOrders(
    { delivery_id: courier.id, status: 'ne_rruge' },
    { query: { enabled: !!courier.id, queryKey: getListOrdersQueryKey({ delivery_id: courier.id, status: 'ne_rruge' }) } }
  );

  const updateOrder = useUpdateOrder();
  const updateDelivery = useUpdateDelivery();

  const activeOrder = activeOrders?.[0]; // Usually just one active delivery at a time

  // Continuously update location for active order
  useEffect(() => {
    if (activeOrder && coords && courier.is_available) {
      updateOrder.mutate({ 
        id: activeOrder.id, 
        data: { delivery_lat: coords.lat, delivery_lng: coords.lng } 
      });
    }
  }, [coords?.lat, coords?.lng]);

  const handleLogout = () => {
    logoutCourier();
    setLocation("/dorezuesi/login");
  };

  const toggleAvailability = () => {
    updateDelivery.mutate({ id: courier.id, data: { is_available: !courier.is_available } }, {
      onSuccess: (updated) => {
        loginCourier(updated);
        toast({ title: updated.is_available ? "Jeni i disponueshëm" : "Jeni jo i disponueshëm" });
      }
    });
  };

  const acceptOrder = (orderId: number) => {
    updateOrder.mutate({ 
      id: orderId, 
      data: { 
        status: 'ne_rruge', 
        delivery_id: courier.id, 
        delivery_name: courier.name,
        delivery_lat: coords?.lat,
        delivery_lng: coords?.lng
      } 
    }, {
      onSuccess: () => {
        toast({ title: "Porosia u mor në dorëzim" });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ status: 'gati_per_dorezim' }) });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ delivery_id: courier.id, status: 'ne_rruge' }) });
      }
    });
  };

  const completeDelivery = (orderId: number) => {
    updateOrder.mutate({ id: orderId, data: { status: 'dorezuar' } }, {
      onSuccess: () => {
        toast({ title: "Porosia u dorëzua me sukses!" });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ delivery_id: courier.id, status: 'ne_rruge' }) });
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="bg-black border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              <Truck className="h-4 w-4" />
            </div>
            <span className="font-bold hidden sm:inline text-white">TiliGo Driver</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-3 py-1.5 border border-zinc-800">
              <span className="text-sm font-medium">{courier.is_available ? "Aktiv" : "Pauzë"}</span>
              <Switch checked={courier.is_available} onCheckedChange={toggleAvailability} />
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {activeOrder ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Navigation className="h-6 w-6 text-primary" /> Dërgesa Aktive
            </h2>
            
            <Card className="border-primary/50 bg-black shadow-lg shadow-primary/10 overflow-hidden text-white">
              <div className="h-48 md:h-64 bg-zinc-900 relative">
                {coords && activeOrder.customer_lat && activeOrder.customer_lng ? (
                  <MapContainer 
                    center={[coords.lat, coords.lng]} 
                    zoom={14} 
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[coords.lat, coords.lng]}>
                      <Popup>Ti je këtu</Popup>
                    </Marker>
                    <Marker position={[activeOrder.customer_lat, activeOrder.customer_lng]}>
                      <Popup>Klienti</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500">Duke pritur lokacionin...</div>
                )}
                <div className="absolute top-4 left-4 z-[400]">
                  <Badge className="bg-black/80 backdrop-blur text-white text-lg py-1 px-3 border border-white/20">
                    <Wallet className="h-4 w-4 mr-2 inline" /> {activeOrder.total.toFixed(2)}€
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-xl mb-1 text-primary">{activeOrder.business_name}</h3>
                    <p className="text-zinc-400 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Marrja në dorëzim
                    </p>
                  </div>
                  
                  <div className="h-px bg-white/10 w-full" />
                  
                  <div>
                    <h3 className="font-bold text-xl mb-1 text-white">{activeOrder.customer_name} ({activeOrder.customer_phone})</h3>
                    <p className="text-zinc-300 flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-primary shrink-0" /> {activeOrder.customer_address}
                    </p>
                    {activeOrder.notes && (
                      <p className="mt-2 p-3 bg-yellow-400/10 text-yellow-200 rounded border border-yellow-400/20 text-sm">
                        <strong>Shënim:</strong> {activeOrder.notes}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => completeDelivery(activeOrder.id)} 
                    className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white"
                  >
                    Kryej Dorëzimin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="bg-zinc-900 w-full p-1 h-12 border border-white/5">
              <TabsTrigger value="available" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                Në pritje {availableOrders && availableOrders.length > 0 && <Badge className="ml-2 bg-primary">{availableOrders.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Historiku</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {!courier.is_available ? (
                <div className="text-center py-20">
                  <div className="bg-zinc-900 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Truck className="h-10 w-10 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Jeni Offline</h3>
                  <p className="text-zinc-400 max-w-sm mx-auto">Kaloni në gjendje "Aktiv" për të marrë porosi të reja nga bizneset përreth.</p>
                </div>
              ) : !availableOrders || availableOrders.length === 0 ? (
                <div className="text-center py-20">
                  <div className="animate-pulse bg-primary/20 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="h-10 w-10 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Duke pritur porosi...</h3>
                  <p className="text-zinc-400">Po kërkojmë porosi të gatshme në zonën tuaj.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableOrders.map(order => (
                    <Card key={order.id} className="bg-zinc-900 border-white/10 text-white overflow-hidden">
                      <CardContent className="p-0 flex flex-col sm:flex-row">
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-primary">{order.business_name}</h3>
                            <Badge variant="outline" className="text-zinc-300 border-zinc-700">{(order.total).toFixed(2)}€</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-zinc-400">
                            <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Për te: {order.customer_address}</p>
                            <p className="flex items-center gap-2"><Package className="h-3 w-3" /> Fitimi juaj: <span className="text-green-400 font-bold">{order.delivery_fee.toFixed(2)}€</span></p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => acceptOrder(order.id)} 
                          className="sm:w-32 h-auto rounded-none bg-primary hover:bg-primary/90 text-white font-bold"
                        >
                          Merr Porosinë
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <Card className="bg-zinc-900 border-white/10 p-8 text-center text-zinc-400 border-dashed">
                Ky seksion do të shfaqë historikun e dërgesave dhe fitimet tuaja.
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}