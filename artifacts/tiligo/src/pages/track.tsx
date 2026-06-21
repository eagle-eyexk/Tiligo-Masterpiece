import { useParams } from "wouter";
import { useTrackOrder, getTrackOrderQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Package, CheckCircle2, ChevronRight, Truck, Store } from "lucide-react";
import { useEffect } from "react";
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

const STATUS_FLOW = [
  { id: 'e_re', label: 'E re', icon: Store },
  { id: 'pranuar', label: 'Pranuar', icon: CheckCircle2 },
  { id: 'ne_pergatitje', label: 'Në përgatitje', icon: Package },
  { id: 'gati_per_dorezim', label: 'Gati', icon: Package },
  { id: 'ne_rruge', label: 'Në rrugë', icon: Truck },
  { id: 'dorezuar', label: 'Dorëzuar', icon: MapPin },
];

export default function TrackOrderPage() {
  const { code } = useParams<{ code: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useTrackOrder(code || "", {
    query: { 
      enabled: !!code, 
      queryKey: getTrackOrderQueryKey(code || ""),
      refetchInterval: 10000 // Poll every 10s for live updates
    }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted mx-auto rounded"></div>
            <div className="h-64 w-full bg-muted rounded-xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Porosia nuk u gjet</h1>
          <p className="text-muted-foreground">Ju lutemi kontrolloni kodin e porosisë tuaj.</p>
        </div>
      </AppLayout>
    );
  }

  const isCancelled = order.status === 'anuluar';
  const currentStatusIndex = isCancelled ? -1 : STATUS_FLOW.findIndex(s => s.id === order.status);
  
  const showMap = order.status === 'ne_rruge' && order.delivery_lat && order.delivery_lng;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Porosia {order.order_code}</h1>
            <p className="text-muted-foreground">Nga {order.business_name}</p>
          </div>
          <Badge variant={isCancelled ? "destructive" : "default"} className="text-lg py-1 px-4 self-start md:self-auto">
            {isCancelled ? "Anuluar" : STATUS_FLOW.find(s => s.id === order.status)?.label || order.status}
          </Badge>
        </div>

        {/* Status Timeline */}
        <Card className="border-0 shadow-md mb-8 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b">
            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-6 hidden sm:flex">
              {STATUS_FLOW.map((step, idx) => {
                const isActive = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs text-center ${isActive ? 'text-foreground font-bold' : ''}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Mobile View Timeline */}
            <div className="flex flex-col gap-4 sm:hidden">
              {STATUS_FLOW.map((step, idx) => {
                const isActive = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;
                const Icon = step.icon;
                if (!isActive && idx > currentStatusIndex + 1) return null; // Only show up to next step
                
                return (
                  <div key={step.id} className={`flex items-center gap-4 ${!isActive ? 'opacity-50' : ''}`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className={`font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                      {isCurrent && <p className="text-xs text-muted-foreground">Statusi aktual</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Detajet e Porosisë</h3>
            <div className="space-y-3 mb-6">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span><span className="font-bold mr-2">{item.qty}x</span> {item.name}</span>
                  <span className="font-medium">{(item.price * item.qty).toFixed(2)}€</span>
                </div>
              ))}
            </div>
            
            <Separator className="mb-4" />
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nëntotali</span>
                <span>{(order.total - order.delivery_fee).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dërgesa</span>
                <span>{order.delivery_fee.toFixed(2)}€</span>
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-black p-3 bg-muted rounded-lg">
              <span>Totali</span>
              <span className="text-primary">{order.total.toFixed(2)}€</span>
            </div>
          </CardContent>
        </Card>

        {/* Live Tracking Map */}
        {showMap && (
          <Card className="border-0 shadow-md overflow-hidden mb-8">
            <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold">Gjurmimi Live i Dorëzuesit</h3>
              {order.delivery_name && <Badge variant="outline" className="ml-auto">{order.delivery_name}</Badge>}
            </div>
            <div className="h-[300px] w-full relative z-0">
              <MapContainer 
                center={[order.delivery_lat!, order.delivery_lng!]} 
                zoom={15} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[order.delivery_lat!, order.delivery_lng!]}>
                  <Popup>
                    Dorëzuesi: {order.delivery_name || "TiliGo"}
                  </Popup>
                </Marker>
                {order.customer_lat && order.customer_lng && (
                  <Marker position={[order.customer_lat, order.customer_lng]}>
                    <Popup>
                      Adresa juaj
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </Card>
        )}

      </div>
    </AppLayout>
  );
}