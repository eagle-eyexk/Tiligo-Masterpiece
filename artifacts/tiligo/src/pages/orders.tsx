import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Clock, ChevronRight } from "lucide-react";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function MyOrdersPage() {
  const [phoneSearch, setPhoneSearch] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");

  const { data: orders, isLoading } = useListOrders(
    { customer_phone: submittedPhone }, 
    { query: { enabled: submittedPhone.length >= 8, queryKey: getListOrdersQueryKey({ customer_phone: submittedPhone }) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneSearch.length >= 8) {
      setSubmittedPhone(phoneSearch);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'dorezuar': return <Badge className="bg-green-500 hover:bg-green-600">Dorëzuar</Badge>;
      case 'anuluar': return <Badge variant="destructive">Anuluar</Badge>;
      case 'e_re':
      case 'pranuar': return <Badge variant="secondary">Në proces</Badge>;
      case 'ne_pergatitje':
      case 'gati_per_dorezim': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Duke u përgatitur</Badge>;
      case 'ne_rruge': return <Badge className="bg-yellow-400 text-yellow-950">Në rrugë</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="bg-primary/5 py-12 border-b border-primary/10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-4">Porositë e mia</h1>
          <p className="text-muted-foreground mb-8">Shkruani numrin e telefonit që përdorët gjatë porosisë për të parë historikun.</p>
          
          <form onSubmit={handleSearch} className="flex max-w-md mx-auto gap-2">
            <Input 
              placeholder="Numri i telefonit (psh. 04X XXX XXX)" 
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="bg-background h-12"
            />
            <Button type="submit" className="h-12 px-6">Gjej</Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {submittedPhone && isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : submittedPhone && orders ? (
          orders.length > 0 ? (
            <div className="space-y-4">
              <h2 className="font-bold text-xl mb-6">U gjetën {orders.length} porosi</h2>
              {orders.map(order => (
                <Link key={order.id} href={`/gjurmo/${order.order_code}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm ring-1 ring-border/50">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-none mb-1">{order.business_name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {order.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy HH:mm') : ''}</span>
                            <span>•</span>
                            <span className="font-medium text-foreground">{order.total.toFixed(2)}€</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                        {getStatusBadge(order.status)}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-foreground mb-2">Nuk u gjet asnjë porosi</h3>
              <p>Sigurohuni që keni shkruar numrin e saktë të telefonit.</p>
            </div>
          )
        ) : !submittedPhone ? (
          <div className="text-center py-12 text-muted-foreground opacity-50">
            <Search className="h-16 w-16 mx-auto mb-4" />
            <p>Kërkoni me numër telefoni për të parë porositë.</p>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}