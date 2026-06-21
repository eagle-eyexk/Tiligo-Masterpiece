import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { useCart } from "@/lib/cart-context";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreateOrder, useGetBusiness, getGetBusinessQueryKey } from "@workspace/api-client-react";
import { MapPin, CreditCard, Banknote, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Emri është i detyrueshëm"),
  customer_phone: z.string().min(8, "Numri i telefonit është i detyrueshëm"),
  customer_address: z.string().min(5, "Adresa është e detyrueshme"),
  notes: z.string().optional(),
  payment_method: z.enum(["cash", "card"]),
  coupon_code: z.string().optional(),
});

export default function CheckoutPage() {
  const { items, total, businessId, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);

  const { data: business } = useGetBusiness(businessId || 0, {
    query: { enabled: !!businessId, queryKey: getGetBusinessQueryKey(businessId || 0) }
  });

  const createOrder = useCreateOrder();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      notes: "",
      payment_method: "cash",
      coupon_code: "",
    },
  });

  const deliveryFee = business?.delivery_fee || 0;
  const finalTotal = total + deliveryFee;

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          form.setValue("customer_address", `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)} (Lokacion GPS)`);
          toast({ title: "Lokacioni u gjet", description: "Adresa u plotësua automatikisht." });
          setIsLocating(false);
        },
        (error) => {
          toast({ title: "Gabim", description: "Nuk mund të merrnim lokacionin tuaj.", variant: "destructive" });
          setIsLocating(false);
        }
      );
    } else {
      toast({ title: "Gabim", description: "Shfletuesi juaj nuk mbështet GPS.", variant: "destructive" });
      setIsLocating(false);
    }
  };

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    if (items.length === 0 || !business) {
      toast({ title: "Gabim", description: "Shporta është bosh.", variant: "destructive" });
      return;
    }

    const orderItems = items.map(item => ({
      name: item.product.name,
      price: item.product.price,
      qty: item.quantity
    }));

    const orderCode = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    createOrder.mutate({
      data: {
        order_code: orderCode,
        business_id: business.id,
        business_name: business.name,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        customer_address: values.customer_address,
        customer_lat: locationCoords?.lat,
        customer_lng: locationCoords?.lng,
        notes: values.notes,
        items: orderItems,
        total: finalTotal,
        delivery_fee: deliveryFee,
        payment_method: values.payment_method,
        coupon_code: values.coupon_code || undefined,
        discount: 0, // Simplified for now
      }
    }, {
      onSuccess: () => {
        clearCart();
        toast({ title: "Porosia u dërgua!", description: "Porosia juaj u pranua me sukses." });
        setLocation(`/gjurmo/${orderCode}`);
      },
      onError: (err) => {
        toast({ title: "Gabim në dërgim", description: "Pati një problem me dërgimin e porosisë.", variant: "destructive" });
        console.error(err);
      }
    });
  };

  if (items.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Shporta juaj është bosh</h1>
          <p className="text-muted-foreground mb-8">Kthehuni në kryefaqe për të shtuar produkte.</p>
          <Button onClick={() => setLocation("/")} className="w-full">Shko në Kryefaqe</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-8 tracking-tight">Përfundo Porosinë</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="checkout-form">
                
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" /> Detajet e Dërgesës
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customer_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emri dhe Mbiemri</FormLabel>
                            <FormControl><Input placeholder="Filan Fisteku" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customer_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numri i Telefonit</FormLabel>
                            <FormControl><Input placeholder="04X XXX XXX" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="customer_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresa e Saktë</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="Rruga, Lagjja, Qyteti..." className="flex-1" {...field} />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="secondary" 
                              onClick={handleGetLocation}
                              disabled={isLocating}
                            >
                              <Navigation className="h-4 w-4 mr-2" /> GPS
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Udhëzime për dorëzuesin (Opsionale)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="P.sh. Zilja nuk punon, më thirrni kur të arrini..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-primary" /> Mënyra e Pagesës
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <FormControl>
                                  <RadioGroupItem value="cash" />
                                </FormControl>
                                <div className="flex-1 flex justify-between items-center">
                                  <FormLabel className="font-bold cursor-pointer">Kesh në dorëzim</FormLabel>
                                  <Banknote className="h-5 w-5 text-muted-foreground" />
                                </div>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <FormControl>
                                  <RadioGroupItem value="card" />
                                </FormControl>
                                <div className="flex-1 flex justify-between items-center">
                                  <FormLabel className="font-bold cursor-pointer">Kartelë bankare</FormLabel>
                                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle>Përmbledhja</CardTitle>
                {business && <p className="text-sm text-muted-foreground">Nga: {business.name}</p>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span className="font-medium">{(item.product.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nëntotali</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dërgesa</span>
                    <span>{deliveryFee.toFixed(2)}€</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-black">
                  <span>Totali</span>
                  <span className="text-primary">{finalTotal.toFixed(2)}€</span>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form" 
                  className="w-full mt-4 font-bold text-lg h-12"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? "Po dërgohet..." : "Konfirmo Porosinë"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Duke konfirmuar pajtoheni me kushtet e përdorimit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}