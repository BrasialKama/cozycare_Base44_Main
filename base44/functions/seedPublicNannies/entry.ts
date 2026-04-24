import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const isAdmin = user.role === 'admin' || user.app_role === 'admin';
  if (!isAdmin) {
    return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
  }

  const nannies = [
    {
      nanny_profile_id: "sample-ana",
      display_name: "Ana M.",
      first_name: "Ana",
      last_name_initial: "M.",
      headline: "Iskusna dadilja s Montessori pristupom",
      bio: "Iskusna dadilja s 8 godina rada s djecom svih uzrasta. Volim kreativne aktivnosti, čitanje priča i igre na otvorenom. Djeca me obožavaju jer sam strpljiva, topla i uvijek puna energije za igru!",
      city: "Zagreb",
      neighborhood: "Trešnjevka",
      profile_photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      intro_video_url: "",
      hourly_rate: 15,
      languages: ["Hrvatski", "Engleski", "Njemački"],
      badges: ["Potvrđen ID", "Provjera pozadine", "Reference"],
      experience_years: 8,
      qualifications_summary: "Montessori metode, Kreativne radionice, Pomoć s domaćom zadaćom",
      availability_summary: "Jutro, Poslijepodne, Vikend",
      rating: 4.9,
      review_count: 23,
      total_bookings: 87,
      status: "approved",
      is_active: true,
      featured: true,
    },
    {
      nanny_profile_id: "sample-maja",
      display_name: "Maja K.",
      first_name: "Maja",
      last_name_initial: "K.",
      headline: "Studentica predškolskog odgoja",
      bio: "Studiram predškolski odgoj i imam 4 godine iskustva u radu s bebama i malom djecom. Posebno uživam u glazbenim aktivnostima i senzornim igrama.",
      city: "Zagreb",
      neighborhood: "Maksimir",
      profile_photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      intro_video_url: "",
      hourly_rate: 12,
      languages: ["Hrvatski", "Engleski"],
      badges: ["Potvrđen ID", "Reference"],
      experience_years: 4,
      qualifications_summary: "Njega dojenčadi, Glazbene aktivnosti, Senzorne igre",
      availability_summary: "Poslijepodne, Večer, Vikend",
      rating: 4.7,
      review_count: 14,
      total_bookings: 45,
      status: "approved",
      is_active: true,
      featured: true,
    },
    {
      nanny_profile_id: "sample-ivana",
      display_name: "Ivana N.",
      first_name: "Ivana",
      last_name_initial: "N.",
      headline: "Medicinska sestra i iskusna dadilja",
      bio: "Medicinska sestra s posebnom strašću za rad s djecom. 6 godina iskustva u čuvanju djece, uključujući djecu s posebnim potrebama. Certificirana sam za prvu pomoć i CPR.",
      city: "Zagreb",
      neighborhood: "Dubrava",
      profile_photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      intro_video_url: "",
      hourly_rate: 18,
      languages: ["Hrvatski", "Engleski", "Talijanski"],
      badges: ["Potvrđen ID", "Provjera pozadine", "Reference", "Video"],
      experience_years: 6,
      qualifications_summary: "Prva pomoć, Djeca s posebnim potrebama, Noćno čuvanje",
      availability_summary: "Jutro, Poslijepodne, Večer, Noćno čuvanje",
      rating: 5.0,
      review_count: 31,
      total_bookings: 112,
      status: "approved",
      is_active: true,
      featured: true,
    },
    {
      nanny_profile_id: "sample-petra",
      display_name: "Petra B.",
      first_name: "Petra",
      last_name_initial: "B.",
      headline: "Dvojezična dadilja - engleski kroz igru",
      bio: "Profesorica engleskog jezika koja pruža dvojezično čuvanje djece. S djecom razgovaram na engleskom kroz igru, priče i pjesmice.",
      city: "Zagreb",
      neighborhood: "Črnomerec",
      profile_photo_url: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80",
      intro_video_url: "",
      hourly_rate: 20,
      languages: ["Hrvatski", "Engleski"],
      badges: ["Potvrđen ID", "Reference"],
      experience_years: 5,
      qualifications_summary: "Dvojezično čuvanje, Podučavanje engleskog, Kreativno pisanje",
      availability_summary: "Jutro, Poslijepodne",
      rating: 4.8,
      review_count: 18,
      total_bookings: 62,
      status: "approved",
      is_active: true,
      featured: false,
    },
    {
      nanny_profile_id: "sample-lana",
      display_name: "Lana J.",
      first_name: "Lana",
      last_name_initial: "J.",
      headline: "Montessori odgajateljica s 10 godina iskustva",
      bio: "Odgajateljica u vrtiću s 10 godina iskustva. Specijalizirana za Montessori pristup i razvoj fine motorike. Strpljiva, kreativna i posvećena svakom djetetu.",
      city: "Zagreb",
      neighborhood: "Jarun",
      profile_photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
      intro_video_url: "",
      hourly_rate: 16,
      languages: ["Hrvatski", "Slovenački"],
      badges: ["Potvrđen ID", "Provjera pozadine"],
      experience_years: 10,
      qualifications_summary: "Montessori metode, Fina motorika, Likovno izražavanje",
      availability_summary: "Vikend, Večer",
      rating: 4.6,
      review_count: 9,
      total_bookings: 34,
      status: "approved",
      is_active: true,
      featured: false,
    },
  ];

  const results = [];
  for (const nanny of nannies) {
    const existing = await base44.asServiceRole.entities.PublicNannyProfile.filter(
      { nanny_profile_id: nanny.nanny_profile_id },
      '-created_date',
      1
    );
    if (existing?.[0]) {
      await base44.asServiceRole.entities.PublicNannyProfile.update(existing[0].id, nanny);
      results.push({ id: existing[0].id, action: 'updated' });
    } else {
      const created = await base44.asServiceRole.entities.PublicNannyProfile.create(nanny);
      results.push({ id: created.id, action: 'created' });
    }
  }

  return Response.json({ success: true, results });
});