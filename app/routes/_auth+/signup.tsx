import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as E from '@react-email/components'

import {
	json,
	redirect,
	type MetaFunction,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'

import { z } from 'zod'
import { Button } from '~/components/ui/button'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { prisma } from '~/utils/db.server'
import { sendEmail } from '~/utils/email.server'
import { useIsPending } from '~/utils/misc'
import { EmailSchema } from '~/utils/user-validation'
import { codeQueryParam } from './verify'
import { prepareVerification } from './verify.server'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		schema: SignupSchema.superRefine(async (data, ctx) => {
			const existingUser = await prisma.user.findUnique({
				where: {
					email: data.email,
				},
				select: {
					id: true,
				},
			})
			if (existingUser) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this email',
				})
				return
			}
		}),
		async: true,
	})
	if (submission.status !== 'success') {
		return json(
			{
				result: submission.reply(),
			},
			{
				status: submission.status === 'error' ? 400 : 200,
			},
		)
	}
	const { email } = submission.value
	console.log('email: ', email)
	const { verifyUrl, redirectTo, otp } = await prepareVerification({
		period: 10 * 60,
		request,
		type: 'onboarding',
		target: email,
	})

	verifyUrl.searchParams.set(codeQueryParam, otp)

	const response = await sendEmail({
		to: email,
		subject: `Welcome to Remix Boilerplate!`,
		react: <SignupEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
	})

	if (response.status === 'success') {
		return redirect(redirectTo.toString())
	} else {
		return json(
			{
				result: submission.reply({ formErrors: [response.error.message] }),
			},
			{
				status: 500,
			},
		)
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	return json({})
}

export function SignupEmail({
	onboardingUrl,
	otp,
}: {
	onboardingUrl: string
	otp: string
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Container>
				<h1>
					<E.Text>Welcome to Remix Boilerplate!</E.Text>
				</h1>
				<p>
					<E.Text>
						Here's your verification code: <strong>{otp}</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>Or click the link to get started:</E.Text>
				</p>
				<E.Link href={onboardingUrl}>{onboardingUrl}</E.Link>
			</E.Container>
		</E.Html>
	)
}
export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{
		title: 'Sign Up | Remix Boilerplate',
	},
]

const SignupSchema = z.object({
	email: EmailSchema,
})

export default function SignupPage() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')
	const [form, fields] = useForm({
		id: 'signup-form',
		constraint: getZodConstraint(SignupSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			const result = parseWithZod(formData, { schema: SignupSchema })
			return result
		},
		shouldRevalidate: 'onBlur',
	})
	return (
		<div className="flex h-screen items-center">
			<Card className="mx-auto w-96">
				<CardHeader>
					<CardTitle className="text-xl">Sign Up</CardTitle>
					<CardDescription>
						Enter your email to create an account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<Form method="POST" className="grid gap-2" {...getFormProps(form)}>
							<div>
								<Label htmlFor={fields.email.id} aria-label="email">
									Email
								</Label>
								<Input
									autoFocus
									autoComplete="email"
									{...getInputProps(fields.email, { type: 'email' })}
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
						Already have an account?{' '}
						<Link to="/login" className="underline">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
