import { useListBusinesses } from "@workspace/api-client-react";
import { AppLayout } from "@/components/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  "Të gjitha", "Restorante", "Pizzeri", "Fast Food", "Ëmbëlsira", "Kafe", "Market"
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Të gjitha");
  const [search, setSearch] = useState("");
  
  const { data: businesses, isLoading } = useListBusinesses({ 
    status: 'approved' 
  });

  const filteredBusinesses = businesses?.filter(b => {
    const matchesCat = activeCategory === "Të gjitha" || b.category === activeCategory;
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                          (b.category && b.category.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Ushqimi juaj i preferuar, <br/>
              <span className="text-yellow-300">në derën tuaj.</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              Zbuloni restorantet dhe marketet më të mira në Kosovë me dërgesë të shpejtë.
            </p>
            
            <div className="bg-background rounded-full p-2 flex items-center shadow-xl max-w-xl mx-auto mt-8">
              <MapPin className="text-muted-foreground ml-3 h-5 w-5" />
              <Input 
                placeholder="Shkruani adresën tuaj për të parë dyqanet..." 
                className="border-0 shadow-none focus-visible:ring-0 text-foreground"
              />
              <Button className="rounded-full px-6 py-6 font-bold text-base hidden sm:flex">
                Gjej ushqim
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className="rounded-full whitespace-nowrap"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Dyqanet e hapura</h2>
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Kërko dyqan..." 
              className="pl-9 bg-background"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-md">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredBusinesses?.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-xl border border-dashed">
              <p className="text-lg">Nuk u gjet asnjë biznes për këtë kërkim.</p>
            </div>
          ) : (
            filteredBusinesses?.map(business => (
              <Link key={business.id} href={`/dyqani/${business.id}`}>
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col bg-white">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {business.image_url ? (
                      <img 
                        src={business.image_url} 
                        alt={business.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
                        {business.name.charAt(0)}
                      </div>
                    )}
                    {!business.is_open && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="destructive" className="text-sm font-bold uppercase tracking-wider">Mbyllur</Badge>
                      </div>
                    )}
                    {business.delivery_fee === 0 && business.is_open && (
                      <Badge className="absolute top-3 left-3 bg-yellow-400 text-yellow-950 font-bold hover:bg-yellow-400 border-0">
                        Dërgesë falas
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{business.name}</h3>
                      {business.rating && (
                        <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-sm font-medium">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{business.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {business.category && (
                      <p className="text-sm text-muted-foreground mb-4">{business.category}</p>
                    )}
                    <div className="mt-auto flex items-center gap-4 text-sm font-medium pt-4 border-t">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{business.delivery_time || "30-45 min"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                        <span>{business.delivery_fee ? `${business.delivery_fee}€ dërgesa` : "Falas"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}