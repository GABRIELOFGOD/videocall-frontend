"use client";

import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "../loader";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BASEURL } from "@/utils/constants";
import { isError } from "@/utils/helper";
import { toast } from "sonner";

const formSchema = z.object({
  api_key: z.string().min(1, "API Key is required"),
  app_id: z.string().min(1, "App ID is required"),
  api_secret: z.string().min(1, "API Secret is required"),
});

type FormValues = z.infer<typeof formSchema>;

const AdminDashboardComponent = () => {
  const { user, isLoaded } = useUser();

  const [envID, setEnvID] = useState("");

  const router = useRouter();

  const getVaribales = async () => {
    try {
      const req = await fetch(`${BASEURL}/api/environment`);
      const res = await req.json();
      if (!req.ok) throw new Error(res.error.message);

      form.setValue("api_key", res.api_key);
      form.setValue("api_secret", res.api_secret);
      form.setValue("app_id", res.app_id);
      setEnvID(res.id);
    } catch  (error: unknown) {
      if (isError(error)) {
        toast.error(error.message);
        console.error(error.message);
      } else {
        console.error("Unknown error", error);
      }
    }
  }

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/login");
      } else {
        getVaribales();
      }
    }
  }, [isLoaded, user]); 

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_key: "",
      app_id: "",
      api_secret: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const req = await fetch(`${BASEURL}/api/environment/${envID}`,  {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(values)
      });

      const res = await req.json();
      toast.success(res.message);

      if (!req.ok) throw new Error(res.error.message);
    } catch (error: unknown) {
      if (isError(error)) {
        toast.error(error.message);
        console.error(error.message);
      } else {
        console.error("Unknown error", error);
      }
    }
  };

  if (!isLoaded) {
    return <Loader />;
  }
  
  return (
    <div className="flex w-full justify-center items-center h-fit flex-col py-5 md:py-10">
      <div>
        <h1 className="text-xl font-bold">Welcome {user?.name}</h1>
        <p className="text-gray-600">This is the administrative dashboard</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8 w-full max-w-md">
          <FormField
            control={form.control}
            name="api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input placeholder="Enter API Key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="app_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>App ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter App ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="api_secret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Secret</FormLabel>
                <FormControl>
                  <Input placeholder="Enter API Secret" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>

    </div>
  )
}
export default AdminDashboardComponent;