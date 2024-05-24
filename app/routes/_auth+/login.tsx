import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	json,
	type MetaFunction,
	type ActionFunctionArgs,
} from '@remix-run/node'

import { Form, useActionData, Link, useSearchParams, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'

import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useIsPending } from '~/utils/misc'
import { loadTWConfig } from "~/utils/tw.server";
import { UsernameSchema, PasswordSchema } from '~/utils/user-validation'

export async function loader() {
	const defaultConfig = await loadTWConfig()
	console.log('configJson: ', defaultConfig.theme.screens);
	return json({
		screens: defaultConfig.theme.screens
	})
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	return json({
		request,
	})
}

const LoginFormSchema = z.object({
	username: UsernameSchema,
	password: PasswordSchema.optional(),
	redirectTo: z.string().optional(),
	remember: z.boolean().optional(),
})

export const meta: MetaFunction<typeof loader> = () => [
	{
		title: 'Login',
	},
]

export default function LoginPage() {
	const actionData = useActionData<typeof action>()
	const loaderData = useLoaderData<typeof loader>()
	console.log('loaderData: ', loaderData);
	const [searchParams] = useSearchParams()

	const redirectTo = searchParams.get('redirectTo')
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'login-form',
		constraint: getZodConstraint(LoginFormSchema),
		defaultValue: { redirectTo },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})
	return (

		<><div className="h-screen w-full grid min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
			{/* <div className="hidden bg-muted bg-zinc-900 lg:block" /> */}
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
								<Input {...getInputProps(fields.username, { type: 'text' })} />
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
									{...getInputProps(fields.password, { type: 'password' })} />
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
						Don&apos;t have an account?{' '}
						<Link
							to={redirectTo
								? `/signup?${encodeURIComponent(redirectTo)}`
								: '/signup'}
							className="underline"
						>
							Sign up
						</Link>
					</div>
				</div>
			</div>

		</div>
			{/* <div className={`w-px  h-full bg-gray-800 absolute left-[640px] top-0`} />
			<div className={`w-px  h-full bg-gray-800 absolute left-[768px] top-0`} />
			<div className={`w-px  h-full bg-gray-800 absolute left-[1024px] top-0`} />
			<div className={`w-px  h-full bg-gray-800 absolute left-[1280px] top-0`} />
			<div className={`w-px  h-full bg-gray-800 absolute left-[1536px] top-0`} /> */}
			<>
				{loaderData.screens && Object.keys(loaderData.screens).map(item => (
					<div className={`w-px  h-full bg-gray-800 absolute left-[${loaderData.screens[item]}] top-0`} key={item} />
				))}
			</>
		</>
	)
}