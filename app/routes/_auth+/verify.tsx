import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type MetaFunction, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { REGEXP_ONLY_DIGITS_AND_CHARS, type OTPInputProps } from 'input-otp'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '~/components/ui/input-otp'
import { Label } from '~/components/ui/label'
import { useIsPending } from '~/utils/misc'
import { validateRequest } from './verify.server'

export const codeQueryParam = 'code'
export const targetQueryParam = 'target'
export const typeQueryParam = 'type'
export const redirectToQueryParam = 'redirectTo'
const types = ['onboarding', 'reset-password', 'change-email', '2fa'] as const
const VerificationTypeSchema = z.enum(types)
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>

export const VerifySchema = z.object({
	[codeQueryParam]: z.string().min(6).max(6),
	[typeQueryParam]: VerificationTypeSchema,
	[targetQueryParam]: z.string(),
	[redirectToQueryParam]: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	return validateRequest(request, formData)
}

export const meta: MetaFunction = () => [
	{
		title: 'VerifyPage',
	},
]

export default function VerifyPage() {
	const [searchParams] = useSearchParams()
	const isPending = useIsPending()
	const actionData = useActionData<typeof action>()
	const parseWithZoddType = VerificationTypeSchema.safeParse(
		searchParams.get(typeQueryParam),
	)
	const type = parseWithZoddType.success ? parseWithZoddType.data : null

	const checkEmail = (
		<>
			<h1 className="text-h1">Check your email</h1>
			<p className="text-body-md mt-3 text-muted-foreground">
				We've sent you a code to verify your email address.
			</p>
		</>
	)

	const headings: Record<VerificationTypes, React.ReactNode> = {
		onboarding: checkEmail,
		'reset-password': checkEmail,
		'change-email': checkEmail,
		'2fa': (
			<>
				<h1 className="text-h1">Check your 2FA app</h1>
				<p className="text-body-md mt-3 text-muted-foreground">
					Please enter your 2FA code to verify your identity.
				</p>
			</>
		),
	}

	const [form, fields] = useForm({
		id: 'verify-form',
		constraint: getZodConstraint(VerifySchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: VerifySchema })
		},
		defaultValue: {
			code: searchParams.get(codeQueryParam),
			type: type,
			target: searchParams.get(targetQueryParam),
			redirectTo: searchParams.get(redirectToQueryParam),
		},
	})

	return (
		<main className="container flex flex-col justify-center pb-32 pt-20">
			<div className="text-center">
				{type ? headings[type] : 'Invalid Verification Type'}
			</div>
			<div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
				<Form method="POST" {...getFormProps(form)} className="flex-1">
					<div className="flex items-center justify-center">
						<Label htmlFor={fields[codeQueryParam].id} />
						<InputOTP
							maxLength={6}
							{...getInputProps(fields[codeQueryParam], { type: 'text' })}
							pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
						>
							<InputOTPGroup>
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
								<InputOTPSlot index={2} />
							</InputOTPGroup>
							<InputOTPSeparator />
							<InputOTPGroup>
								<InputOTPSlot index={3} />
								<InputOTPSlot index={4} />
								<InputOTPSlot index={5} />
							</InputOTPGroup>
						</InputOTP>
					</div>
					<>{fields[codeQueryParam].errors}</>
					<input
						{...getInputProps(fields[typeQueryParam], { type: 'hidden' })}
					/>
					<input
						{...getInputProps(fields[targetQueryParam], { type: 'hidden' })}
					/>
					<input
						{...getInputProps(fields[redirectToQueryParam], {
							type: 'hidden',
						})}
					/>
					<Button type="submit" className="w-full" disabled={isPending}>
						Submit
					</Button>
				</Form>
			</div>
		</main>
	)
}
