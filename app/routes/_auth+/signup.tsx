import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";

import { json } from "@remix-run/node";
import type {
  MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";

import { z } from "zod";
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
import { EmailSchema } from "~/utils/user-validation";
import { useIsPending } from "~/utils/misc";
import { prisma } from "~/utils/db.server";
import { prepareVerification } from "./verify.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: SignupSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
        select: {
          id: true,
        },
      });
      if (existingUser) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "A user already exists with this email",
        });
        return;
      }
    }),
    async: true,
  });
  if (submission.status !== "success") {
    return json(
      {
        result: submission.reply(),
      },
      {
        status: submission.status === "error" ? 400 : 200,
      }
    );
  }
  const { email } = submission.value;
  const { verifyUrl, redirectTo, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    type: "onboarding",
    target: email,
  });
  return json({});
}

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: "Sign Up",
  },
];

const SignupSchema = z.object({
  email: EmailSchema,
});

export default function SignupPage() {
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const [form, fields] = useForm({
    id: "signup-form",
    constraint: getZodConstraint(SignupSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      const result = parseWithZod(formData, { schema: SignupSchema });
      return result;
    },
    shouldRevalidate: "onBlur",
  });
  return (
    <div className="h-screen flex items-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your email to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Form className="grid gap-2">
              <div>
                <Label htmlFor={fields.email.id}>Email</Label>
                <Input
                  autoFocus
                  autoComplete="email"
                  {...getInputProps(fields.email, { type: "email" })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                Create an account
              </Button>
            </Form>
            <Button variant="outline" className="w-full">
              Sign up with GitHub
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
