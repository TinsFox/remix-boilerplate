import { json } from "@remix-run/node";
import type {
  MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { z } from "zod";

export async function action({ request }: ActionFunctionArgs) {
  return json({});
}

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: "VerifyPage",
  },
];
const types = ["onboarding", "reset-password", "change-email", "2fa"] as const;
const VerificationTypeSchema = z.enum(types);
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>;

export default function VerifyPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h1>Verify Route</h1>
    </div>
  );
}
