import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { blink } from '../../../blink/client'
import { AuthSessionError, isAuthFailureError } from '../../../utils/errors'

export interface ParentProfileInput {
  familyName: string
  householdDetails?: string
  childrenCount?: number
  childrenAges?: string
  needs?: string
  location?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  preferredSchedule?: string
  primaryLocationId?: string
  isOnboarded?: string
}

async function fetchParentProfile(userId?: string | null) {
  if (!userId) return null
  await blink.auth.getValidToken()
  const profiles = await blink.db.parents.list({ where: { userId }, limit: 1 })
  return profiles[0] ?? null
}

export function useParentProfile(userId?: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['parent-profile', userId],
    queryFn: () => fetchParentProfile(userId),
    enabled: Boolean(userId),
  })

  const saveProfile = useMutation({
    mutationFn: async (input: ParentProfileInput) => {
      if (!userId) throw new Error('Missing user')

      try {
        await blink.auth.getValidToken()
        const existing = await fetchParentProfile(userId)
        const payload = {
          id: existing?.id ?? userId,
          userId,
          familyName: input.familyName,
          householdDetails: input.householdDetails ?? '',
          childrenCount: String(input.childrenCount ?? 0),
          childrenAges: input.childrenAges ?? '',
          needs: input.needs ?? '',
          location: input.location ?? '',
          emergencyContactName: input.emergencyContactName ?? '',
          emergencyContactPhone: input.emergencyContactPhone ?? '',
          preferredSchedule: input.preferredSchedule ?? '',
          primaryLocationId: input.primaryLocationId ?? '',
          isOnboarded: input.isOnboarded ?? '1',
        }
        return existing
          ? blink.db.parents.update(existing.id, payload)
          : blink.db.parents.create(payload)
      } catch (error) {
        if (isAuthFailureError(error)) {
          throw new AuthSessionError()
        }
        throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parent-profile', userId] }),
  })

  return { ...query, saveProfile }
}
