import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginBusiness } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  phone: z.string().min(8, "Numri i telefonit është i detyrueshëm"),
  password: z.string().min(6, "Fjalëkalimi është i detyrueshëm"),
});

export default function BusinessLogin() {
  const [, setLocation] = useLocation();
  const { loginBusiness } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLoginBusiness();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (business) => {
        loginBusiness(business);
        toast({ title: "Kyçja e suksesshme" });
        setLocation("/biznesi/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl mb-2">TG</div>
          <CardTitle className="text-2xl font-bold tracking-tight">Portali i Biznesit</CardTitle>
          <CardDescription>Kyçuni për të menaxhuar porositë tuaja</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" className="w-full h-12 text-lg font-bold mt-2" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Po kyçet..." : "Kyçu"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-sm text-muted-foreground">
            Nuk keni llogari? <Link href="/biznesi/register" className="text-primary font-medium hover:underline">Regjistrohu</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}