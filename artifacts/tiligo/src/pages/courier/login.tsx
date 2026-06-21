import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginDelivery } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

const loginSchema = z.object({
  phone: z.string().min(8, "Numri i telefonit është i detyrueshëm"),
  password: z.string().min(6, "Fjalëkalimi është i detyrueshëm"),
});

export default function CourierLogin() {
  const [, setLocation] = useLocation();
  const { loginCourier } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLoginDelivery();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (courier) => {
        loginCourier(courier);
        toast({ title: "Kyçja e suksesshme" });
        setLocation("/dorezuesi/dashboard");
      },
      onError: () => {
        toast({ 
          title: "Gabim në kyçje", 
          description: "Kredencialet janë të pasakta", 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4 relative overflow-hidden">
      {/* Dynamic background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl relative z-10 text-white">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(var(--primary),0.5)]">
            <Truck className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Portali i Dorëzuesit</CardTitle>
          <CardDescription className="text-zinc-400">Kyçuni për të filluar punën</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Numri i Telefonit</FormLabel>
                    <FormControl><Input placeholder="04X XXX XXX" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Fjalëkalimi</FormLabel>
                    <FormControl><Input type="password" placeholder="******" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-14 text-lg font-bold mt-4 shadow-lg shadow-primary/20" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Po kyçet..." : "Hyr në Llogari"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/10 p-6 mt-4">
          <p className="text-sm text-zinc-400">
            Nuk jeni regjistruar ende? <Link href="/dorezuesi/register" className="text-primary font-medium hover:underline hover:text-primary/80">Fillo Tani</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}