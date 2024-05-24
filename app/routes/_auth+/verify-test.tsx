import { zodResolver } from "@hookform/resolvers/zod"
import { type MetaFunction, type ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useFetcher, useSearchParams, Form as ReForm } from '@remix-run/react'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '~/components/ui/input-otp'
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
	console.log('test action: ',);
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
	const type = parseWithZoddType.success ? parseWithZoddType.data : VerificationTypeSchema.Enum.onboarding

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


	const form = useForm({
		resolver: zodResolver(VerifySchema),
		defaultValues: {
			code: searchParams.get(codeQueryParam) || "",
			type: type,
			target: searchParams.get(targetQueryParam) || "",
			redirectTo: searchParams.get(redirectToQueryParam) || "",
		},
	})

	const fetcher = useFetcher()
	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof VerifySchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values)
	}

	return (
		<main className="container flex flex-col justify-center pb-32 pt-20 items-center">
			verify-test
			<div className="text-center">
				{type ? headings[type] : 'Invalid Verification Type'}
			</div>
			<div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
				<Form {...form}>
					<fetcher.Form method="POST" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<InputOTP maxLength={6} {...field}
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
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem hidden>
									<FormControl>
										<Input  {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="target"
							render={({ field }) => (
								<FormItem hidden>
									<FormControl>
										<Input  {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="redirectTo"
							render={({ field }) => (
								<FormItem hidden>
									<FormControl>
										<Input  {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={isPending}>
							Submit
						</Button>
					</fetcher.Form>
				</Form>
			</div>
		</main>
	)
}
