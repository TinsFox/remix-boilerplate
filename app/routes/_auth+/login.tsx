import { json } from "@remix-run/node";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import type {
  MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData, Link, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { UsernameSchema, PasswordSchema } from "~/utils/user-validation";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useIsPending } from "~/utils/misc";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("action: ");
  const formData = await request.formData();
  console.log("formData: ", formData);
  return json({
    request,
  });
}

const LoginFormSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema.optional(),
  redirectTo: z.string().optional(),
  remember: z.boolean().optional(),
});

export const meta: MetaFunction<typeof loader> = () => [
  {
    title: "Login",
  },
];

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  console.log("actionData: ", actionData);
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirectTo");
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "login-form",
    constraint: getZodConstraint(LoginFormSchema),
    defaultValue: { redirectTo },
    // lastResult: actionData?.result,
    onValidate({ formData }) {
      console.log("formData: ", formData);
      return parseWithZod(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur",
  });
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] h-screen">
      <div className="hidden bg-muted lg:block bg-zinc-900"></div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <Form method="POST" {...getFormProps(form)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor={fields.username.id}>Email</Label>
                <Input {...getInputProps(fields.username, { type: "text" })} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor={fields.password.id}>Password</Label>
                  <Link
                    to="/reset-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  {...getInputProps(fields.password, { type: "password" })}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button variant="outline" className="w-full" disabled={isPending}>
                Login with Google
              </Button>
            </div>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to={
                redirectTo
                  ? `/signup?${encodeURIComponent(redirectTo)}`
                  : "/signup"
              }
              className="underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
