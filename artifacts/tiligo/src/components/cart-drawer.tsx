import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    onOpenChange(false);
    setLocation("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shporta juaj
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 ? "Shporta është bosh." : `Keni ${items.length} produkte në shportë.`}
          </SheetDescription>
        </SheetHeader>

        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="flex flex-col gap-4 py-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    {item.product.image_url && (
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium leading-none">{item.product.name}</h4>
                        <span className="text-sm font-bold ml-2">{(item.product.price * item.quantity).toFixed(2)}€</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none" 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="pt-4 mt-auto">
              <Separator className="mb-4" />
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Nëntotali</span>
                <span className="font-bold">{total.toFixed(2)}€</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={clearCart}>Pastro</Button>
                <Button className="w-full font-bold" onClick={handleCheckout}>
                  Shko tek Pagesa
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mb-4 opacity-20" />
            <p className="mb-4">Shtoni produkte nga restorantet dhe dyqanet tuaja të preferuara për të vazhduar me porosinë.</p>
            <Button onClick={() => onOpenChange(false)}>Shfleto Dyqanet</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}