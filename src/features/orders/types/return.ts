import { z } from 'zod'

export const returnReasons = [
  'defective',
  'wrong_item',
  'size_too_small',
  'size_too_large',
  'change_of_mind',
  'other',
] as const

export const returnRequestSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.number(),
        quantity: z.number().min(1),
      })
    )
    .min(1, 'Please select at least one item to return.'),
  reason: z.enum(returnReasons),
  comment: z.string().optional(),
  proof_images: z.array(z.any()).optional(), // Handling files in form data is tricky with zod, simple array check
})

export type ReturnRequestFormValues = z.infer<typeof returnRequestSchema>
