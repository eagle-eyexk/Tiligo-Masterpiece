import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Download as DownloadIcon, Star } from "lucide-react";

export default function DownloadAppPage() {
  return (
    <AppLayout>
      <div className="flex-1 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
        
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            
            <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-0 mb-4 px-3 py-1">E RE: Aplikacioni TiliGo</Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Më e shpejtë, <br />
                më e lehtë, <br />
                <span className="text-primary">në xhepin tuaj.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Shkarkoni aplikacionin TiliGo dhe shijoni dërgesat më të shpejta në Kosovë. Zbuloni dyqanet e reja dhe gjurmoni porositë tuaja live.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <Button size="lg" className="h-16 px-8 rounded-xl text-lg gap-3 bg-black hover:bg-black/90 text-white w-full sm:w-auto">
                  <svg viewBox="0 0 384 512" className="h-6 w-6 fill-current">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Download on the</span>
                    <span>App Store</span>
                  </div>
                </Button>
                
                <Button size="lg" className="h-16 px-8 rounded-xl text-lg gap-3 bg-black hover:bg-black/90 text-white w-full sm:w-auto">
                  <svg viewBox="0 0 512 512" className="h-6 w-6 fill-current">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                  </svg>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] uppercase font-bold text-gray-400">GET IT ON</span>
                    <span>Google Play</span>
                  </div>
                </Button>
              </div>

              <div className="flex items-center gap-6 justify-center lg:justify-start pt-8 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-sm font-bold">10,000+ shkarkime</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex justify-center relative">
              <div className="relative w-[300px] h-[600px] bg-black rounded-[3rem] border-[8px] border-black shadow-2xl overflow-hidden flex-shrink-0 z-10">
                <div className="absolute top-0 inset-x-0 h-6 bg-black z-20 flex justify-center rounded-b-3xl">
                  <div className="w-1/3 h-4 bg-black rounded-b-xl"></div>
                </div>
                <div className="bg-primary w-full h-full flex flex-col pt-10 px-4">
                  <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-md text-white border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary font-black">TG</div>
                      <Badge className="bg-green-500 text-white border-0">Në rrugë</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-white/20 rounded w-3/4"></div>
                      <div className="h-2 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-background rounded-t-[2rem] p-6 shadow-inner mt-4 overflow-hidden relative">
                    <div className="space-y-4">
                      <div className="h-32 bg-muted rounded-xl w-full"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-muted rounded-xl"></div>
                        <div className="h-24 bg-muted rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* QR Code floating card */}
              <Card className="absolute bottom-10 -left-12 z-20 p-4 border-0 shadow-xl hidden md:block w-48 animate-bounce" style={{ animationDuration: '3s' }}>
                <p className="text-center font-bold text-sm mb-3">Skano për shkarkim</p>
                <div className="bg-muted aspect-square rounded-lg flex items-center justify-center border-4 border-white p-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-foreground fill-current">
                    <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,0 h20 v10 h-20 z M40,20 h20 v10 h-20 z M40,40 h60 v10 h-60 z M0,40 h30 v10 h-30 z M40,70 h20 v10 h-20 z M40,90 h20 v10 h-20 z M70,70 h10 v10 h-10 z M90,70 h10 v10 h-10 z M70,90 h30 v10 h-30 z" />
                  </svg>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Just a small helper to keep imports clean for this specific page where I don't want to import Badge globally
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>
}