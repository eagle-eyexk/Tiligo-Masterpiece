import { Link } from "wouter";
import { Menu, ShoppingBag, Search, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { CartDrawer } from "./cart-drawer";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImg from "@/assets/logo.jpeg";

export function Navbar() {
  const { itemCount } = useCart();
  const { customer, logoutCustomer } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b border-white/50 shadow-sm shadow-sky-100/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-sky-700 hover:bg-sky-50">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] glass-strong border-white/50">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-bold text-sky-700">Kryefaqja</Link>
                <Link href="/porositjet-e-mia" className="text-lg text-foreground/80 hover:text-sky-600 transition-colors">Porositë e mia</Link>
                <Link href="/shkarko-app" className="text-lg text-foreground/80 hover:text-sky-600 transition-colors">Shkarko App</Link>
                <hr className="my-2 border-sky-100" />
                {customer ? (
                  <>
                    <Link href="/profili" className="text-sm text-sky-600 font-semibold">Profili im</Link>
                    <button onClick={logoutCustomer} className="text-sm text-red-500 text-left">Dil nga llogaria</button>
                  </>
                ) : (
                  <>
                    <Link href="/kycu" className="text-sm text-sky-600 font-semibold">Kyçu</Link>
                    <Link href="/regjistrohu" className="text-sm text-green-600 font-semibold">Regjistrohu falas</Link>
                  </>
                )}
                <hr className="my-2 border-sky-100" />
                <Link href="/biznesi/login" className="text-sm text-muted-foreground hover:text-sky-600 transition-colors">Për Bizneset</Link>
                <Link href="/dorezuesi/login" className="text-sm text-muted-foreground hover:text-sky-600 transition-colors">Për Dorëzuesit</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 group">
            <img
              src={logoImg}
              alt="TiliGo Logo"
              className="h-9 w-9 rounded-xl object-cover shadow-md shadow-sky-200/60 ring-2 ring-white group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-xl font-black tracking-tight">
              <span className="text-sky-500">Tili</span><span className="text-green-500">Go</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center ml-6 gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-sky-600 transition-colors">Kryefaqja</Link>
            <Link href="/porositjet-e-mia" className="hover:text-sky-600 transition-colors">Porositë</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-sky-600 hover:bg-sky-50" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>

          {/* Customer Account */}
          {customer ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 px-3 glass-blue border border-sky-200 rounded-full hover:border-sky-300 hover:shadow-sm transition-all">
                  <div className="h-6 w-6 rounded-full tiligo-gradient flex items-center justify-center text-white text-xs font-black">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-sky-700 max-w-[80px] truncate">{customer.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass border-white/60 shadow-xl">
                <div className="px-3 py-2 border-b border-white/40">
                  <p className="text-sm font-bold text-foreground truncate">{customer.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profili" className="flex items-center gap-2 cursor-pointer text-sky-700">
                    <LayoutDashboard className="h-4 w-4" /> Profili im
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/porositjet-e-mia" className="flex items-center gap-2 cursor-pointer">
                    <ShoppingBag className="h-4 w-4" /> Porositë e mia
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/40" />
                <DropdownMenuItem
                  onClick={logoutCustomer}
                  className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Dil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/kycu">
                <Button variant="ghost" size="sm" className="text-sky-700 hover:bg-sky-50 font-semibold">
                  Kyçu
                </Button>
              </Link>
              <Link href="/regjistrohu">
                <Button size="sm" className="rounded-full px-4 font-bold glass-green border border-green-300 text-green-700 hover:bg-green-50 shadow-sm">
                  Regjistrohu
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile: user icon */}
          {!customer && (
            <Link href="/kycu">
              <Button variant="ghost" size="icon" className="sm:hidden text-muted-foreground hover:text-sky-600 hover:bg-sky-50">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Button
            onClick={() => setCartOpen(true)}
            className={`rounded-full px-4 font-bold shadow-md transition-all duration-200 ${
              itemCount > 0
                ? "tiligo-gradient text-white shadow-sky-300/50 hover:shadow-lg hover:shadow-sky-300/60"
                : "glass-blue border border-sky-200 text-sky-700 hover:bg-sky-50"
            }`}
          >
            <ShoppingBag className="h-5 w-5 sm:mr-2" />
            {itemCount > 0 && <span className="hidden sm:inline">{itemCount} Artikuj</span>}
            {itemCount === 0 && <span className="hidden sm:inline">Shporta</span>}
          </Button>
        </div>
      </div>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
