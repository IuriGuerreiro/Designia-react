import { z } from 'zod'

export const cancelReasons = [
  'changed_mind',
  'found_cheaper',
  'ordered_by_mistake',
  'shipping_too_slow',
  'other',
] as const

export const cancelRequestSchema = z.object({
  reason: z.enum(cancelReasons),
  comment: z.string().optional(),
})

export type CancelRequestFormValues = z.infer<typeof cancelRequestSchema>
