import { Navbar } from "./navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t bg-background mt-auto">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-black text-primary">TiliGo</div>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} TiliGo. All rights reserved. Kosovo's #1 delivery platform.
          </p>
        </div>
      </footer>
    </div>
  );
}