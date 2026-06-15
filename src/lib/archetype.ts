import type { TraitAttribute } from './api'
import type { MorphologyProfile } from './morphology'

export interface Archetype {
  name: string
  code: string
  description: string
  traits: string[]
}

function getTrait(attributes: TraitAttribute[], type: string): string | null {
  return attributes.find((a) => a.trait_type === type)?.value ?? null
}

export function classifyArchetype(
  attributes: TraitAttribute[],
  morphology: MorphologyProfile,
): Archetype {
  const type = getTrait(attributes, 'Type') ?? 'Unknown'
  const gender = getTrait(attributes, 'Gender') ?? ''
  const age = getTrait(attributes, 'Age') ?? ''
  const accessory = getTrait(attributes, 'Accessory') ?? 'None'
  const expression = getTrait(attributes, 'Expression') ?? ''
  const eyes = getTrait(attributes, 'Eyes') ?? ''

  const tags: string[] = [type]
  if (gender) tags.push(gender)
  if (age) tags.push(age)

  if (type === 'Agent') {
    return {
      name: 'Cipher Operative',
      code: 'AGT-01',
      description: 'Machine-born identity with synthetic facial geometry and low bilateral variance.',
      traits: tags,
    }
  }

  if (type === 'Alien') {
    return {
      name: 'Extraterrestrial Signal',
      code: 'ALN-07',
      description: 'Non-human morphology with asymmetric pixel entropy patterns.',
      traits: tags,
    }
  }

  if (type === 'Cat') {
    return {
      name: 'Feline Phantom',
      code: 'CAT-03',
      description: 'Compact centroid cluster with elevated upper-quadrant density.',
      traits: tags,
    }
  }

  if (accessory.includes('Top Hat') || accessory.includes('Monocle')) {
    return {
      name: 'Gilded Aristocrat',
      code: 'HUM-A1',
      description: 'Formal human phenotype with regalia accessories and high symmetry index.',
      traits: [...tags, accessory],
    }
  }

  if (expression === 'Serious' && morphology.density > 0.35) {
    return {
      name: 'Stone Sentinel',
      code: 'HUM-S4',
      description: 'Dense bitmap structure with stern expression — high visual mass.',
      traits: [...tags, expression],
    }
  }

  if (eyes.includes('Glasses') && morphology.horizontalSymmetry > 0.7) {
    return {
      name: 'Scholar Mirror',
      code: 'HUM-G2',
      description: 'Symmetric lens geometry with balanced left-right pixel distribution.',
      traits: [...tags, eyes],
    }
  }

  if (morphology.spatialEntropy > 0.85 && morphology.density < 0.3) {
    return {
      name: 'Hollow Wanderer',
      code: 'HUM-H0',
      description: 'Sparse pixel field with dispersed entropy — visually lightweight.',
      traits: tags,
    }
  }

  if (age === 'Old') {
    return {
      name: 'Elder Canvas',
      code: 'HUM-E9',
      description: 'Aged phenotype with mature trait composition.',
      traits: tags,
    }
  }

  return {
    name: 'Baseline Normie',
    code: 'HUM-00',
    description: 'Standard human bitmap within collection morphological norms.',
    traits: tags,
  }
}

export function walletArchetypeSpread(
  ids: number[],
  allTraits: { id: number; attributes: TraitAttribute[] }[],
  morphologyFn: (id: number) => MorphologyProfile | null,
): Map<string, number> {
  const spread = new Map<string, number>()

  for (const id of ids) {
    const entry = allTraits[id]
    const morph = morphologyFn(id)
    if (!entry?.attributes || !morph) continue

    const archetype = classifyArchetype(entry.attributes, morph)
    spread.set(archetype.name, (spread.get(archetype.name) ?? 0) + 1)
  }

  return spread
}
