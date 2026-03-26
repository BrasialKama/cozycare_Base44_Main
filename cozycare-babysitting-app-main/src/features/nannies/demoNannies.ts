export interface DemoNanny {
  id: string
  displayName: string
  photoUrl: string
  hourlyRate: number
  yearsOfExperience: number
  bio: string
  rating: number
  reviewCount: number
  isVerified: boolean
  isBackgroundChecked: boolean
  isReferenceChecked: boolean
  isVideoVerified: boolean
  languages: string[]
  certifications: string[]
  serviceArea: string
  videoUrl: string
}

export const demoNannies: DemoNanny[] = [
  {
    id: '1',
    displayName: 'Eleanor Bennett',
    photoUrl: 'https://v3b.fal.media/files/b/0a91dbaa/iqP08e1FIPdjtiwlXEezZ_snHbpmOP.png',
    hourlyRate: 25,
    yearsOfExperience: 8,
    bio: 'I am a dedicated career nanny with a passion for early childhood development. I create warm, creative environments where children feel safe to explore and learn. My approach is rooted in gentle parenting and I love incorporating Montessori-inspired activities into our daily routine.',
    rating: 4.9,
    reviewCount: 24,
    isVerified: true,
    isBackgroundChecked: true,
    isReferenceChecked: true,
    isVideoVerified: true,
    languages: ['English (Native)', 'French (Conversational)'],
    certifications: ['Early Childhood Education Degree', 'First Aid & CPR Certified', 'Newborn Care Specialist'],
    serviceArea: 'West London, Kensington & Chelsea',
    videoUrl: '#',
  },
  {
    id: '2',
    displayName: 'Sophie Thorne',
    photoUrl: 'https://v3b.fal.media/files/b/0a91dbaa/EfDw0U67KgXfZgMJGAVmx_b53f5pCF.png',
    hourlyRate: 22,
    yearsOfExperience: 5,
    bio: 'Child safety and emotional well-being are my top priorities. I love outdoor play, reading stories, and helping children grow into confident little humans.',
    rating: 5.0,
    reviewCount: 12,
    isVerified: true,
    isBackgroundChecked: true,
    isReferenceChecked: true,
    isVideoVerified: true,
    languages: ['English (Native)', 'Spanish (Conversational)'],
    certifications: ['Pediatric First Aid', 'Infant Sleep Support', 'Child Nutrition Basics'],
    serviceArea: 'Notting Hill & Holland Park',
    videoUrl: '#',
  },
  {
    id: '3',
    displayName: 'Clara Middleton',
    photoUrl: 'https://v3b.fal.media/files/b/0a91dbaa/0_snrBn0NnGv3KTiM5YoK_L1SbtcTv.png',
    hourlyRate: 28,
    yearsOfExperience: 12,
    bio: 'With over a decade of experience as a private nanny and maternity nurse, I offer a premium, highly structured and nurturing approach to childcare.',
    rating: 4.8,
    reviewCount: 36,
    isVerified: true,
    isBackgroundChecked: true,
    isReferenceChecked: true,
    isVideoVerified: false,
    languages: ['English (Native)', 'Italian (Conversational)'],
    certifications: ['Maternity Nurse Training', 'CPR Certified', 'Montessori Foundations'],
    serviceArea: 'West London, Kensington & Chelsea',
    videoUrl: '#',
  },
]

export function getDemoNannyById(id: string) {
  return demoNannies.find((nanny) => nanny.id === id) ?? null
}
