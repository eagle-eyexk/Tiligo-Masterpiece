import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateBusiness } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const registerSchema = z.object({
  name: z.string().min(2, "Emri është i detyrueshëm"),
  phone: z.string().min(8, "Numri i telefonit është i detyrueshëm"),
  password: z.string().min(6, "Fjalëkalimi duhet të jetë të paktën 6 karaktere"),
  category: z.string().min(1, "Kategoria është e detyrueshme"),
  address: z.string().min(5, "Adresa është e detyrueshme"),
});

export default function BusinessRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateBusiness();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "", password: "", category: "", address: "" },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    createMutation.mutate({ data: values }, {
      onSuccess: () => {
        toast({ 
          title: "Regjistrimi u krye me sukses", 
          description: "Llogaria juaj është në pritje për aprovim." 
        });
        setLocation("/biznesi/login");
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl mb-2">TG</div>
          <CardTitle className="text-2xl font-bold tracking-tight">Regjistro Biznesin</CardTitle>
          <CardDescription>Bëhuni pjesë e rrjetit më të madh të dërgesave</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emri i Biznesit</FormLabel>
                    <FormControl><Input placeholder="P.sh. Pizzeria Roma" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numri i Telefonit</FormLabel>
                      <FormControl><Input placeholder="04X XXX XXX" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fjalëkalimi</FormLabel>
                      <FormControl><Input type="password" placeholder="******" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidhni kategorinë" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Restorante">Restorante</SelectItem>
                        <SelectItem value="Pizzeri">Pizzeri</SelectItem>
                        <SelectItem value="Fast Food">Fast Food</SelectItem>
                        <SelectItem value="Ëmbëlsira">Ëmbëlsira</SelectItem>
                        <SelectItem value="Kafe">Kafe</SelectItem>
                        <SelectItem value="Market">Market</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresa</FormLabel>
                    <FormControl><Input placeholder="Rruga, Qyteti" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-lg font-bold mt-4" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Po regjistrohet..." : "Dërgo Kërkesën"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-sm text-muted-foreground">
            Keni llogari? <Link href="/biznesi/login" className="text-primary font-medium hover:underline">Kyçuni</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}