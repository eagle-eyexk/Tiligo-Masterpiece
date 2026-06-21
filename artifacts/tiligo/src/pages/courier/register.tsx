import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateDelivery } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Emri është i detyrueshëm"),
  phone: z.string().min(8, "Numri i telefonit është i detyrueshëm"),
  password: z.string().min(6, "Fjalëkalimi duhet të jetë të paktën 6 karaktere"),
  vehicle: z.enum(["motor", "biciklete", "makine"]),
});

export default function CourierRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateDelivery();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "", password: "", vehicle: "motor" },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    createMutation.mutate({ data: values }, {
      onSuccess: () => {
        toast({ 
          title: "Regjistrimi u krye", 
          description: "Llogaria juaj është në pritje për aprovim nga admini." 
        });
        setLocation("/dorezuesi/login");
      },
      onError: () => {
        toast({ 
          title: "Gabim", 
          description: "Pati një problem gjatë regjistrimit.", 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl relative z-10 text-white">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(var(--primary),0.5)]">
            <Truck className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Fillo si Dorëzues</CardTitle>
          <CardDescription className="text-zinc-400">Përcakto orarin tënd. Fito para.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Emri dhe Mbiemri</FormLabel>
                    <FormControl><Input placeholder="Filan Fisteku" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Numri i Telefonit</FormLabel>
                    <FormControl><Input placeholder="04X XXX XXX" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" {...field} /></FormControl>
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
                    <FormControl><Input type="password" placeholder="******" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Mjeti i transportit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                          <SelectValue placeholder="Zgjidh mjetin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectItem value="motor">Motorr/Skuter</SelectItem>
                        <SelectItem value="biciklete">Biçikletë/Trotinet</SelectItem>
                        <SelectItem value="makine">Makinë</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 shadow-lg shadow-primary/20" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Po regjistrohet..." : "Dërgo Kërkesën"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/10 p-6 mt-4">
          <p className="text-sm text-zinc-400">
            Ke llogari? <Link href="/dorezuesi/login" className="text-primary font-medium hover:underline hover:text-primary/80">Kyçuni</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}