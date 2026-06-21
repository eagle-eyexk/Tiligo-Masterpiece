import { useParams } from "wouter";
import { useGetBusiness, useListProducts, useListOffers, getListProductsQueryKey, getListOffersQueryKey, getGetBusinessQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/app-layout";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Star, Plus, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function BusinessPage() {
  const { id } = useParams<{ id: string }>();
  const businessId = parseInt(id, 10);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("Të gjitha");

  const { data: business, isLoading: loadingBiz } = useGetBusiness(businessId, {
    query: { enabled: !isNaN(businessId), queryKey: getGetBusinessQueryKey(businessId) }
  });

  const { data: products, isLoading: loadingProd } = useListProducts({ business_id: businessId, is_available: true }, {
    query: { enabled: !isNaN(businessId), queryKey: getListProductsQueryKey({ business_id: businessId, is_available: true }) }
  });

  const { data: offers, isLoading: loadingOffers } = useListOffers({ business_id: businessId, is_active: true }, {
    query: { enabled: !isNaN(businessId), queryKey: getListOffersQueryKey({ business_id: businessId, is_active: true }) }
  });

  const categories = ["Të gjitha", ...Array.from(new Set(products?.map(p => p.category).filter(Boolean) as string[]))];

  const filteredProducts = products?.filter(p => 
    activeCategory === "Të gjitha" || p.category === activeCategory
  );

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast({
      title: "U shtua në shportë",
      description: `${product.name} u shtua me sukses.`,
    });
  };

  if (loadingBiz) {
    return (
      <AppLayout>
        <div className="h-64 w-full bg-muted animate-pulse" />
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <Skeleton className="h-32 w-full max-w-3xl rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!business) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Dyqani nuk u gjet</h1>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="relative h-48 md:h-72 bg-muted">
        {business.image_url && (
          <img src={business.image_url} alt={business.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-10 pb-20">
        <Card className="border-0 shadow-lg mb-8 overflow-hidden">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-black">{business.name}</h1>
                {!business.is_open && (
                  <Badge variant="destructive" className="font-bold">Mbyllur Tani</Badge>
                )}
                {business.rating && (
                  <Badge variant="secondary" className="font-bold flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {business.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{business.description || business.category}</p>
              
              <div className="flex flex-wrap gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{business.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{business.delivery_time || "30-45 min"}</span>
                </div>
                {business.delivery_fee === 0 ? (
                  <Badge className="bg-yellow-400 text-yellow-950 border-0">Dërgesë Falas</Badge>
                ) : (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Dërgesa: {business.delivery_fee}€</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers Section */}
        {offers && offers.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-primary fill-primary" />
              Oferta Speciale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map(offer => (
                <Card key={offer.id} className="border border-primary/20 bg-primary/5 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                  {offer.image_url && (
                    <div className="w-full sm:w-1/3 h-32 sm:h-auto bg-muted">
                      <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-primary">{offer.title}</h3>
                      {offer.badge && <Badge>{offer.badge}</Badge>}
                    </div>
                    {offer.description && <p className="text-sm text-muted-foreground mb-2">{offer.description}</p>}
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-primary">{offer.offer_price}€</span>
                        {offer.original_price && (
                          <span className="text-sm line-through text-muted-foreground">{offer.original_price}€</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Menu Section */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border p-2">
              <h3 className="font-bold px-4 py-2 mb-2 text-muted-foreground uppercase text-xs tracking-wider">Kategoritë</h3>
              <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "secondary" : "ghost"}
                    className="justify-start whitespace-nowrap"
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loadingProd ? (
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
              ) : filteredProducts?.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
                  Nuk ka produkte në këtë kategori.
                </div>
              ) : (
                filteredProducts?.map(product => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow group border-0 shadow-sm ring-1 ring-border/50">
                    <div className="flex h-full">
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold group-hover:text-primary transition-colors">{product.name}</h4>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="font-black text-lg">{product.price}€</span>
                          <Button 
                            size="sm" 
                            className="rounded-full h-8 w-8 p-0"
                            onClick={() => handleAddToCart(product)}
                            disabled={!business.is_open}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {product.image_url && (
                        <div className="w-1/3 bg-muted">
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}