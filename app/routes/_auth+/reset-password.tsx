import { json } from "@remix-run/node";
import type {
  MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
  return json({});
}

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: "ResetPasswordPage",
  },
];
export default function ResetPasswordPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h1>ResetPassword Route</h1>
    </div>
  );
}
