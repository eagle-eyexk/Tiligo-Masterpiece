import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  pin: z.string().min(4, "PIN duhet të jetë së paku 4 karaktere"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { loginAdmin } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { pin: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    // Simple hardcoded PIN for admin access
    if (values.pin === "1234" || values.pin === "admin") {
      loginAdmin();
      toast({ title: "Kyçja e suksesshme" });
      setLocation("/admin");
    } else {
      toast({ 
        title: "Gabim në kyçje", 
        description: "PIN-i është i pasaktë", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative">
      <div className="absolute inset-0 grid-bg opacity-10"></div>
      
      <Card className="w-full max-w-sm border border-zinc-800 bg-black text-white relative z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-zinc-900 text-white w-14 h-14 rounded-xl border border-zinc-800 flex items-center justify-center mb-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">TiliGo Administrator</CardTitle>
          <CardDescription className="text-zinc-400">Shkruani PIN-in për qasje</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Admin PIN</FormLabel>
                    <FormControl><Input type="password" placeholder="••••" className="bg-zinc-900 border-zinc-800 text-center text-2xl tracking-widest h-14 text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 bg-white text-black hover:bg-zinc-200">
                Kyçu
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <style dangerouslySetInnerHTML={{__html: `
        .grid-bg {
          background-image: linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}} />
    </div>
  );
}