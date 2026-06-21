import { Navbar } from "./navbar";
import logoImg from "@/assets/logo.jpeg";
import { Link } from "wouter";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Star, Clock, Shield, Zap } from "lucide-react";

const SPONSORS = [
  { name: "Prishtina City", icon: "🏙️", category: "Kryeqytet" },
  { name: "Vushtrri", icon: "🏡", category: "Qyteti" },
  { name: "Kosovo Tender", icon: "🤝", category: "Partner" },
  { name: "Digital Kosovo", icon: "💻", category: "Tech" },
  { name: "Kosovo Invest", icon: "📈", category: "Investitor" },
  { name: "AlbTelecom", icon: "📡", category: "Telecom" },
];

const QUICK_LINKS = [
  { label: "Kryefaqja", href: "/" },
  { label: "Porositë e Mia", href: "/porositjet-e-mia" },
  { label: "Gjurmo Porosinë", href: "/gjurmo" },
  { label: "Shkarko App", href: "/shkarko-app" },
  { label: "Portali i Biznesit", href: "/biznesi/login" },
  { label: "Portali i Kurierit", href: "/dorezuesi/login" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col tiligo-mesh">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Sponsors Bar */}
      <div className="border-t border-white/40 glass">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Partnerët & Sponsorët Tanë
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6">
            {SPONSORS.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass-blue border border-sky-200/60 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 transition-all duration-200 cursor-default"
              >
                <span className="text-xl leading-none">{s.icon}</span>
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="border-t border-white/50 glass">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src={logoImg} alt="TiliGo" className="h-10 w-10 rounded-xl object-cover shadow-md" />
                <span className="text-2xl font-black">
                  <span className="text-sky-500">Tili</span><span className="text-green-500">Go</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                TiliGo ofron një përvojë të shpejtë dhe të lehtë për të porositur ushqim nga restorantet tuaja të preferuara direkt në adresën tuaj.
              </p>
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-200 text-amber-200'}`} />
                ))}
                <span className="ml-1 text-sm font-bold text-amber-600">4.9</span>
                <span className="text-xs text-muted-foreground ml-1">(1,200+ vlerësime)</span>
              </div>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com/tiligoo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full glass-blue border border-sky-200 flex items-center justify-center text-sky-600 hover:bg-sky-50 hover:shadow-md transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com/TiliGo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full glass-blue border border-sky-200 flex items-center justify-center text-sky-600 hover:bg-sky-50 hover:shadow-md transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com/tiligoo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full glass-green border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-50 hover:shadow-md transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-sky-500" /> Lidhje të Shpejta
              </h4>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-sky-600 hover:translate-x-1 transition-all duration-150 inline-flex items-center gap-1"
                    >
                      <span className="h-1 w-1 rounded-full bg-green-400 shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" /> Shërbimet
              </h4>
              <ul className="space-y-2.5">
                {[
                  { icon: "🍕", label: "Pizza & Fast Food" },
                  { icon: "🍔", label: "Burger & Grill" },
                  { icon: "🍣", label: "Sushi & Asian" },
                  { icon: "☕", label: "Kafe & Ëmbëlsira" },
                  { icon: "🛒", label: "Supermarket" },
                  { icon: "💊", label: "Farmaci" },
                ].map(s => (
                  <li key={s.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Info */}
            <div>
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-500" /> Kontakti
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Vushtrri, Kosovë 🇽🇰</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-sky-500 shrink-0" />
                  <a href="tel:+38344000000" className="hover:text-sky-600 transition-colors">+383 44 000 000</a>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-green-500 shrink-0" />
                  <a href="mailto:info@tili-go.com" className="hover:text-sky-600 transition-colors">info@tili-go.com</a>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-sky-500 shrink-0" />
                  <span>E Hënë – E Diel: 08:00 – 24:00</span>
                </li>
              </ul>

              {/* Delivery Area Badges */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Zonat e Dërgimit</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Prishtinë", "Vushtrri", "Mitrovicë", "Ferizaj", "Gjilan"].map(city => (
                    <span key={city} className="text-xs px-2 py-0.5 rounded-full glass-green border border-green-200 text-green-700 font-medium">
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/40 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground text-center">
              &copy; {new Date().getFullYear()} TiliGo · Themeluar 2026 · Kosovo's #1 Delivery Platform
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-sky-600 transition-colors">Kushtet e Shërbimit</a>
              <span className="text-border">·</span>
              <a href="#" className="hover:text-sky-600 transition-colors">Privatësia</a>
              <span className="text-border">·</span>
              <a href="#" className="hover:text-sky-600 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
