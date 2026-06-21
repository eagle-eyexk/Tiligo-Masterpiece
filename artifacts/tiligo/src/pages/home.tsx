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
      <section className="tiligo-gradient text-white py-14 md:py-24 relative overflow-hidden">
        {/* Glassy orb decorations */}
        <div className="absolute top-[-60px] left-[-60px] w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-40px] w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-8 mix-blend-overlay"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight drop-shadow-md">
              Ushqimi juaj i preferuar,{" "}
              <br />
              <span className="text-white/90 underline decoration-white/40 decoration-wavy">
                në derën tuaj.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/85">
              Zbuloni restorantet dhe marketet më të mira në Kosovë me dërgesë të shpejtë.
            </p>

            {/* Glassy search bar */}
            <div className="glass rounded-full p-2 flex items-center shadow-2xl shadow-sky-900/30 max-w-xl mx-auto mt-8 border border-white/60">
              <MapPin className="text-sky-400 ml-3 h-5 w-5 shrink-0" />
              <Input
                placeholder="Shkruani adresën tuaj për të parë dyqanet..."
                className="border-0 shadow-none focus-visible:ring-0 text-foreground bg-transparent placeholder:text-muted-foreground/70"
              />
              <Button className="rounded-full px-6 py-6 font-bold text-base hidden sm:flex tiligo-gradient shadow-md hover:opacity-90 transition-opacity border-0">
                Gjej ushqim
              </Button>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-6 mt-4">
              {[
                { label: "Restorante", value: "50+" },
                { label: "Qytete", value: "5+" },
                { label: "Dërgesa/ditë", value: "1K+" },
              ].map(stat => (
                <div key={stat.label} className="glass rounded-2xl px-4 py-2 text-center border border-white/40">
                  <div className="text-xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/75 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                activeCategory === category
                  ? "tiligo-gradient text-white shadow-md shadow-sky-300/40 border-transparent"
                  : "glass border-sky-200/70 text-sky-700 hover:border-sky-300 hover:shadow-sm"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dyqanet e hapura</h2>
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kërko dyqan..."
              className="pl-9 glass border-sky-200/70 focus-visible:ring-sky-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-md glass">
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
            <div className="col-span-full py-12 text-center text-muted-foreground glass rounded-xl border border-sky-100">
              <p className="text-lg">Nuk u gjet asnjë biznes për këtë kërkim.</p>
            </div>
          ) : (
            filteredBusinesses?.map(business => (
              <Link key={business.id} href={`/dyqani/${business.id}`}>
                <div className="overflow-hidden rounded-xl shadow-sm hover:shadow-xl hover:shadow-sky-200/50 transition-all duration-300 group cursor-pointer h-full flex flex-col glass border border-white/70 hover:border-sky-200/80 hover:-translate-y-0.5">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {business.image_url ? (
                      <img
                        src={business.image_url}
                        alt={business.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center tiligo-gradient text-white font-black text-4xl">
                        {business.name.charAt(0)}
                      </div>
                    )}
                    {!business.is_open && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[2px]">
                        <Badge variant="destructive" className="text-sm font-bold uppercase tracking-wider shadow-lg">Mbyllur</Badge>
                      </div>
                    )}
                    {business.delivery_fee === 0 && business.is_open && (
                      <Badge className="absolute top-3 left-3 bg-green-500 text-white font-bold hover:bg-green-500 border-0 shadow-md">
                        Dërgesë falas
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-sky-600 transition-colors">{business.name}</h3>
                      {business.rating && (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full text-sm font-semibold text-amber-700">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{business.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {business.category && (
                      <p className="text-sm text-muted-foreground mb-4">{business.category}</p>
                    )}
                    <div className="mt-auto flex items-center gap-4 text-sm font-medium pt-4 border-t border-sky-100/60">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4 text-sky-400" />
                        <span>{business.delivery_time || "30-45 min"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ArrowRight className="h-4 w-4 text-green-500" />
                        <span>{business.delivery_fee ? `${business.delivery_fee}€ dërgesa` : "Falas"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
