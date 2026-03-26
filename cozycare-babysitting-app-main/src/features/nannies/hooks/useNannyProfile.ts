import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { blink } from '../../../blink/client'
import { AuthSessionError, isAuthFailureError } from '../../../utils/errors'

export interface NannyProfileInput {
  displayName: string
  legalName?: string
  bio?: string
  serviceArea?: string
  supportedLocations?: string
  yearsOfExperience?: number
  certifications?: string
  languages?: string
  specialties?: string
  ageGroups?: string
  referencesInfo?: string
  hourlyRate?: number
  contactPhone?: string
  contactEmail?: string
  serviceRadius?: string
  availability?: string
  videoUrl?: string
  onboardingStep?: string
}

async function fetchNannyProfile(userId?: string | null) {
  if (!userId) return null
  await blink.auth.getValidToken()
  const profiles = await blink.db.nannies.list({ where: { userId }, limit: 1 })
  return profiles[0] ?? null
}

export function isPubliclyDiscoverable(nanny: any) {
  return Number(nanny?.isApproved ?? nanny?.is_approved ?? 0) > 0 &&
    Number(nanny?.isVerified ?? nanny?.is_verified ?? 0) > 0 &&
    Number(nanny?.isBackgroundChecked ?? nanny?.is_background_checked ?? 0) > 0 &&
    Number(nanny?.isVideoVerified ?? nanny?.is_video_verified ?? 0) > 0
}

export function useNannyProfile(userId?: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['nanny-profile', userId],
    queryFn: () => fetchNannyProfile(userId),
    enabled: Boolean(userId),
  })

  const saveProfile = useMutation({
    mutationFn: async (input: NannyProfileInput) => {
      if (!userId) throw new Error('Missing user')

      try {
        await blink.auth.getValidToken()
        const existing = await fetchNannyProfile(userId)
        const payload = {
          id: existing?.id ?? userId,
          userId,
          displayName: input.displayName,
          legalName: input.legalName ?? '',
          bio: input.bio ?? '',
          serviceArea: input.serviceArea ?? '',
          supportedLocations: input.supportedLocations ?? '',
          yearsOfExperience: String(input.yearsOfExperience ?? 0),
          certifications: input.certifications ?? '',
          languages: input.languages ?? '',
          specialties: input.specialties ?? '',
          ageGroups: input.ageGroups ?? '',
          referencesInfo: input.referencesInfo ?? '',
          hourlyRate: String(input.hourlyRate ?? 0),
          contactPhone: input.contactPhone ?? '',
          contactEmail: input.contactEmail ?? '',
          serviceRadius: input.serviceRadius ?? '',
          availability: input.availability ?? '',
          videoUrl: input.videoUrl ?? '',
          onboardingStep: input.onboardingStep ?? 'complete',
          profileVisibility: 'draft',
        }
        return existing
          ? blink.db.nannies.update(existing.id, payload)
          : blink.db.nannies.create(payload)
      } catch (error) {
        if (isAuthFailureError(error)) {
          throw new AuthSessionError()
        }
        throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nanny-profile', userId] }),
  })

  return { ...query, saveProfile }
}