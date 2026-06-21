import { Link } from "wouter";
import { ShoppingBag, Menu, User, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { CartDrawer } from "./cart-drawer";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-bold">Kryefaqja</Link>
                <Link href="/porositjet-e-mia" className="text-lg">Porositë e mia</Link>
                <Link href="/shkarko-app" className="text-lg">Shkarko App</Link>
                <hr className="my-4" />
                <Link href="/biznesi/login" className="text-sm text-muted-foreground">Për Bizneset</Link>
                <Link href="/dorezuesi/login" className="text-sm text-muted-foreground">Për Dorëzuesit</Link>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-xl p-1.5">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-black tracking-tight text-primary">TiliGo</span>
          </Link>

          <div className="hidden md:flex items-center ml-6 gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Kryefaqja</Link>
            <Link href="/porositjet-e-mia" className="hover:text-foreground transition-colors">Porositë</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Account">
            <User className="h-5 w-5" />
          </Button>

          <Button 
            variant={itemCount > 0 ? "default" : "outline"}
            className="rounded-full px-4"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="h-5 w-5 sm:mr-2" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center sm:static sm:bg-transparent sm:text-current sm:h-auto sm:w-auto">
                {itemCount}
              </span>
            )}
            <span className="hidden sm:inline font-bold">
              {itemCount > 0 ? `${itemCount} Artikuj` : 'Shporta'}
            </span>
          </Button>
        </div>
      </div>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}