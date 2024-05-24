import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	json,
	type MetaFunction,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'
import {
	Form,
	useActionData,
	useLoaderData,
	useSearchParams,
} from '@remix-run/react'
import { safeRedirect } from 'remix-utils/safe-redirect'

import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { requireAnonymous, sessionKey, signup } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { useIsPending } from '~/utils/misc'
import { authSessionStorage } from '~/utils/session.server'
import { redirectWithToast } from '~/utils/toast.server'
import {
	NameSchema,
	PasswordAndConfirmPasswordSchema,
	UsernameSchema,
} from '~/utils/user-validation'
import { verifySessionStorage } from '~/utils/verification.server'

export const onboardingEmailSessionKey = 'onboardingEmail'

export async function action({ request }: ActionFunctionArgs) {
	const email = await requireOnboardingEmail(request)
	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		schema: intent =>
			SignupFormSchema.superRefine(async (data, ctx) => {
				const existingUser = await prisma.user.findUnique({
					where: { username: data.username },
					select: { id: true },
				})
				if (existingUser) {
					ctx.addIssue({
						path: ['username'],
						code: z.ZodIssueCode.custom,
						message: 'A user already exists with this username',
					})
					return
				}
			}).transform(async data => {
				if (intent !== null) return { ...data, session: null }

				const session = await signup({ ...data, email })
				return { ...data, session }
			}),
		async: true,
	})

	if (submission.status !== 'success' || !submission.value.session) {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { session, remember, redirectTo } = submission.value

	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	authSession.set(sessionKey, session.id)
	const verifySession = await verifySessionStorage.getSession()
	const headers = new Headers()
	headers.append(
		'set-cookie',
		await authSessionStorage.commitSession(authSession, {
			expires: remember ? session.expirationDate : undefined,
		}),
	)
	headers.append(
		'set-cookie',
		await verifySessionStorage.destroySession(verifySession),
	)

	return redirectWithToast(
		safeRedirect(redirectTo),
		{ title: 'Welcome', description: 'Thanks for signing up!' },
		{ headers },
	)
}
async function requireOnboardingEmail(request: Request) {
	await requireAnonymous(request)
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const email = verifySession.get(onboardingEmailSessionKey)
	if (typeof email !== 'string' || !email) {
		throw redirect('/signup')
	}
	return email
}
export async function loader({ request }: LoaderFunctionArgs) {
	const email = await requireOnboardingEmail(request)
	return json({ email })
}

export const meta: MetaFunction<typeof loader> = () => [
	{
		title: 'Setup Account',
	},
]

const SignupFormSchema = z
	.object({
		username: UsernameSchema,
		name: NameSchema,
		remember: z.boolean().optional(),
		redirectTo: z.string().optional(),
	})
	.and(PasswordAndConfirmPasswordSchema)

export default function OnboardingPage() {
	const actionData = useActionData<typeof action>()
	const data = useLoaderData<typeof loader>()
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'onboarding-form',
		constraint: getZodConstraint(SignupFormSchema),
		defaultValue: { redirectTo },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: SignupFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})
	return (
		<div>
			<h1>Welcome {data.email}</h1>
			<Form
				method={'POST'}
				className="mx-auto min-w-full max-w-sm sm:min-w-[368px]"
				{...getFormProps(form)}
			>
				<div>
					<Label id={fields.username.id}>UserName</Label>
					<Input
						{...getInputProps(fields.username, {
							type: 'text',
						})}
					/>
				</div>
				<div>
					<Label id={fields.name.id}>Name</Label>
					<Input
						{...getInputProps(fields.name, {
							type: 'text',
						})}
					/>
				</div>
				<div>
					<Label id={fields.password.id}>Password</Label>
					<Input
						{...getInputProps(fields.password, {
							type: 'password',
						})}
					/>
				</div>
				<div>
					<Label id={fields.confirmPassword.id}>Confirm Password</Label>
					<Input
						{...getInputProps(fields.confirmPassword, {
							type: 'password',
						})}
					/>
				</div>
				<div className="flex items-center justify-between gap-6">
					<Button type={'submit'} disabled={isPending}>
						Create an account
					</Button>
				</div>
			</Form>
		</div>
	)
}
