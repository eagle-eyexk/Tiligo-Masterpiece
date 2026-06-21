import { useParams } from "wouter";
import { useTrackOrder, getTrackOrderQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Package, CheckCircle2, Truck, Store, Bell, BellOff, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { requestNotificationPermission, notifyStatusChange } from "@/lib/notifications";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const courierIcon = L.divIcon({
  html: `<div style="background:linear-gradient(135deg,#29abe2,#1a9fd4);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(41,171,226,0.5);font-size:18px;">🛵</div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const customerIcon = L.divIcon({
  html: `<div style="background:linear-gradient(135deg,#39b54a,#2d9e3e);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(57,181,74,0.5);font-size:18px;">🏠</div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const userGpsIcon = L.divIcon({
  html: `<div style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(139,92,246,0.5);font-size:15px;">📍</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (positions.length === 1) {
      map.setView(positions[0], 15);
    }
  }, [positions.map(p => p.join(",")).join("|")]);
  return null;
}

const STATUS_FLOW = [
  { id: "e_re", label: "E re", icon: Store },
  { id: "pranuar", label: "Pranuar", icon: CheckCircle2 },
  { id: "ne_pergatitje", label: "Në përgatitje", icon: Package },
  { id: "gati_per_dorezim", label: "Gati", icon: Package },
  { id: "ne_rruge", label: "Në rrugë", icon: Truck },
  { id: "dorezuar", label: "Dorëzuar", icon: MapPin },
];

export default function TrackOrderPage() {
  const { code } = useParams<{ code: string }>();
  const queryClient = useQueryClient();
  const prevStatus = useRef<string | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [userGps, setUserGps] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const { data: order, isLoading } = useTrackOrder(code || "", {
    query: {
      enabled: !!code,
      queryKey: getTrackOrderQueryKey(code || ""),
      refetchInterval: 10000,
    },
  });

  // Notify on status change
  useEffect(() => {
    if (!order) return;
    if (prevStatus.current !== null && prevStatus.current !== order.status) {
      notifyStatusChange(order.status);
    }
    prevStatus.current = order.status;
  }, [order?.status]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsOn(granted);
    if (granted) {
      notifyStatusChange(order?.status || "e_re");
    }
  };

  const handleGetGps = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserGps([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

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

  const isCancelled = order.status === "anuluar";
  const currentStatusIndex = isCancelled ? -1 : STATUS_FLOW.findIndex((s) => s.id === order.status);
  const showMap = order.status === "ne_rruge" && order.delivery_lat && order.delivery_lng;

  const mapPositions: [number, number][] = [];
  if (order.delivery_lat && order.delivery_lng) mapPositions.push([order.delivery_lat, order.delivery_lng]);
  if (order.customer_lat && order.customer_lng) mapPositions.push([order.customer_lat, order.customer_lng]);
  if (userGps) mapPositions.push(userGps);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Porosia {order.order_code}</h1>
            <p className="text-muted-foreground">Nga {order.business_name}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={`text-base py-1 px-4 border font-bold ${
                isCancelled
                  ? "bg-red-100 text-red-700 border-red-200"
                  : order.status === "dorezuar"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : order.status === "ne_rruge"
                  ? "bg-sky-100 text-sky-700 border-sky-200 animate-pulse"
                  : "bg-blue-100 text-blue-700 border-blue-200"
              }`}
            >
              {isCancelled ? "Anuluar" : STATUS_FLOW.find((s) => s.id === order.status)?.label || order.status}
            </Badge>

            {/* GPS button */}
            {!userGps && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetGps}
                disabled={locating}
                className="glass-green border-green-300 text-green-700 hover:bg-green-50 gap-1.5"
              >
                <Navigation className="h-4 w-4" />
                {locating ? "Duke gjetur..." : "Lokacioni im"}
              </Button>
            )}

            {/* Notification button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableNotifications}
              className={notificationsOn
                ? "glass-green border-green-300 text-green-700"
                : "glass-blue border-sky-200 text-sky-700 hover:bg-sky-50"
              }
            >
              {notificationsOn ? <Bell className="h-4 w-4 mr-1 fill-current" /> : <BellOff className="h-4 w-4 mr-1" />}
              {notificationsOn ? "Njoftime aktive" : "Aktivizo njoftime"}
            </Button>
          </div>
        </div>

        {/* Live Tracking Map */}
        {showMap && (
          <div className="glass rounded-2xl border border-white/60 overflow-hidden mb-6 shadow-lg shadow-sky-100/30">
            <div className="p-4 border-b border-white/40 flex items-center gap-2">
              <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <h3 className="font-bold text-foreground">Gjurmimi Live i Dorëzuesit</h3>
              {order.delivery_name && (
                <Badge className="ml-auto glass-blue border-sky-200 text-sky-700 font-medium">
                  🛵 {order.delivery_name}
                </Badge>
              )}
              {userGps && (
                <Badge className="glass-green border-green-200 text-green-700 font-medium text-xs">
                  📍 Lokacioni juaj aktiv
                </Badge>
              )}
            </div>
            <div className="h-[320px] w-full relative z-0">
              <MapContainer
                center={[order.delivery_lat!, order.delivery_lng!]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds positions={mapPositions} />
                <Marker position={[order.delivery_lat!, order.delivery_lng!]} icon={courierIcon}>
                  <Popup><strong>🛵 Dorëzuesi:</strong> {order.delivery_name || "TiliGo"}</Popup>
                </Marker>
                {order.customer_lat && order.customer_lng && (
                  <Marker position={[order.customer_lat, order.customer_lng]} icon={customerIcon}>
                    <Popup><strong>🏠 Adresa e dorëzimit</strong></Popup>
                  </Marker>
                )}
                {userGps && (
                  <Marker position={userGps} icon={userGpsIcon}>
                    <Popup><strong>📍 Ju jeni këtu</strong></Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <div className="p-3 border-t border-white/40 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><span>🛵</span> Dorëzuesi</span>
              <span className="flex items-center gap-1"><span>🏠</span> Destinacioni</span>
              {userGps && <span className="flex items-center gap-1"><span>📍</span> Lokacioni juaj</span>}
              <span className="ml-auto text-green-600 font-medium flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" /> Rifreskim çdo 10 sek
              </span>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="glass rounded-2xl border border-white/60 overflow-hidden mb-6 shadow-lg shadow-sky-100/30">
          <div className="p-6 border-b border-white/40">
            <div className="hidden sm:flex items-center justify-between">
              {STATUS_FLOW.map((step, idx) => {
                const isActive = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                    {idx > 0 && (
                      <div className={`absolute left-0 top-5 h-0.5 w-full -translate-y-1/2 -z-10 transition-colors ${isActive ? "bg-sky-400" : "bg-muted"}`} />
                    )}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      isActive
                        ? isCurrent
                          ? "tiligo-gradient text-white border-transparent shadow-lg shadow-sky-300/40 scale-110"
                          : "bg-green-500 text-white border-transparent"
                        : "bg-white/60 text-muted-foreground border-muted"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs text-center font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Mobile timeline */}
            <div className="flex flex-col gap-3 sm:hidden">
              {STATUS_FLOW.map((step, idx) => {
                const isActive = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;
                const Icon = step.icon;
                if (!isActive && idx > currentStatusIndex + 1) return null;
                return (
                  <div key={step.id} className={`flex items-center gap-3 ${!isActive ? "opacity-40" : ""}`}>
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      isActive
                        ? isCurrent ? "tiligo-gradient text-white shadow-md shadow-sky-300/40" : "bg-green-500 text-white"
                        : "bg-white/60 text-muted-foreground border border-muted"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                      {isCurrent && <p className="text-xs text-sky-600">Statusi aktual</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4">Detajet e Porosisë</h3>
            <div className="space-y-2.5 mb-5">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm items-center">
                  <span>
                    <span className="font-bold text-sky-600 mr-2">{item.qty}×</span>
                    {item.name}
                  </span>
                  <span className="font-semibold">{(item.price * item.qty).toFixed(2)}€</span>
                </div>
              ))}
            </div>

            <Separator className="mb-4 bg-white/40" />

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Nëntotali</span>
                <span>{(order.total - order.delivery_fee).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Dërgesa</span>
                <span>{order.delivery_fee.toFixed(2)}€</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-black p-4 glass-blue rounded-xl border border-sky-200/60">
              <span>Totali</span>
              <span className="text-sky-600">{order.total.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
