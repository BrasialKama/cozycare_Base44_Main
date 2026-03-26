import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { blink } from '../../../blink/client'
import { AuthSessionError, isAuthFailureError } from '../../../utils/errors'

export interface SavedLocationInput {
  label: string
  locationText: string
  notes?: string
}

async function fetchLocations(userId?: string | null) {
  if (!userId) return []
  try {
    await blink.auth.getValidToken()
  } catch {
    return []
  }
  return blink.db.parentSavedLocations.list({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export function useSavedLocations(userId?: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['saved-locations', userId],
    queryFn: () => fetchLocations(userId),
    enabled: Boolean(userId),
  })

  const addLocation = useMutation({
    mutationFn: async (input: SavedLocationInput) => {
      if (!userId) throw new Error('Missing user')
      try {
        await blink.auth.getValidToken()
        return blink.db.parentSavedLocations.create({
          id: crypto.randomUUID(),
          userId,
          label: input.label,
          locationText: input.locationText,
          notes: input.notes ?? '',
          isActive: '0',
        })
      } catch (error) {
        if (isAuthFailureError(error)) {
          throw new AuthSessionError()
        }
        throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-locations', userId] }),
  })

  const setActiveLocation = useMutation({
    mutationFn: async (locationId: string) => {
      if (!userId) throw new Error('Missing user')
      try {
        await blink.auth.getValidToken()
        const locations = await fetchLocations(userId)
        await Promise.all(
          locations.map((location: any) =>
            blink.db.parentSavedLocations.update(location.id, {
              isActive: location.id === locationId ? '1' : '0',
            })
          )
        )
        return locationId
      } catch (error) {
        if (isAuthFailureError(error)) {
          throw new AuthSessionError()
        }
        throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-locations', userId] }),
  })

  return { ...query, addLocation, setActiveLocation }
}