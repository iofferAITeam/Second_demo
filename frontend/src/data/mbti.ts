export interface MBTIType {
  code: string
  name: string
  description: string
}

export const mbtiTypes: MBTIType[] = [
  { code: 'ENFJ', name: 'ENFJ', description: 'Protagonist' },
  { code: 'ENFP', name: 'ENFP', description: 'Campaigner' },
  { code: 'ENTJ', name: 'ENTJ', description: 'Commander' },
  { code: 'ENTP', name: 'ENTP', description: 'Debater' },
  { code: 'ESFJ', name: 'ESFJ', description: 'Consul' },
  { code: 'ESFP', name: 'ESFP', description: 'Entertainer' },
  { code: 'ESTJ', name: 'ESTJ', description: 'Executive' },
  { code: 'ESTP', name: 'ESTP', description: 'Entrepreneur' },
  { code: 'INFJ', name: 'INFJ', description: 'Advocate' },
  { code: 'INFP', name: 'INFP', description: 'Mediator' },
  { code: 'INTJ', name: 'INTJ', description: 'Architect' },
  { code: 'INTP', name: 'INTP', description: 'Thinker' },
  { code: 'ISFJ', name: 'ISFJ', description: 'Protector' },
  { code: 'ISFP', name: 'ISFP', description: 'Adventurer' },
  { code: 'ISTJ', name: 'ISTJ', description: 'Logistician' },
  { code: 'ISTP', name: 'ISTP', description: 'Virtuoso' }
]

// Group MBTI types in 4x4 grid layout as shown in Figma
export const mbtiGrid: MBTIType[][] = [
  [mbtiTypes[0], mbtiTypes[1], mbtiTypes[2], mbtiTypes[3]], // ENFJ, ENFP, ENTJ, ENTP
  [mbtiTypes[4], mbtiTypes[5], mbtiTypes[6], mbtiTypes[7]], // ESFJ, ESFP, ESTJ, ESTP
  [mbtiTypes[8], mbtiTypes[9], mbtiTypes[10], mbtiTypes[11]], // INFJ, INFP, INTJ, INTP
  [mbtiTypes[12], mbtiTypes[13], mbtiTypes[14], mbtiTypes[15]] // ISFJ, ISFP, ISTJ, ISTP
]
