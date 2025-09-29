export interface Country {
  code: string
  name: string
  searchTerms: string[]
}

export const countries: Country[] = [
  // A
  { code: 'af', name: 'Afghanistan', searchTerms: ['afghanistan', 'af'] },
  { code: 'al', name: 'Albania', searchTerms: ['albania', 'al'] },
  { code: 'dz', name: 'Algeria', searchTerms: ['algeria', 'dz'] },
  { code: 'ad', name: 'Andorra', searchTerms: ['andorra', 'ad'] },
  { code: 'ao', name: 'Angola', searchTerms: ['angola', 'ao'] },
  { code: 'ag', name: 'Antigua and Barbuda', searchTerms: ['antigua', 'barbuda', 'ag'] },
  { code: 'ar', name: 'Argentina', searchTerms: ['argentina', 'ar'] },
  { code: 'am', name: 'Armenia', searchTerms: ['armenia', 'am'] },
  { code: 'au', name: 'Australia', searchTerms: ['australia', 'au'] },
  { code: 'at', name: 'Austria', searchTerms: ['austria', 'at'] },
  { code: 'az', name: 'Azerbaijan', searchTerms: ['azerbaijan', 'az'] },
  
  // B
  { code: 'bs', name: 'Bahamas', searchTerms: ['bahamas', 'bs'] },
  { code: 'bh', name: 'Bahrain', searchTerms: ['bahrain', 'bh'] },
  { code: 'bd', name: 'Bangladesh', searchTerms: ['bangladesh', 'bd'] },
  { code: 'bb', name: 'Barbados', searchTerms: ['barbados', 'bb'] },
  { code: 'by', name: 'Belarus', searchTerms: ['belarus', 'by'] },
  { code: 'be', name: 'Belgium', searchTerms: ['belgium', 'be'] },
  { code: 'bz', name: 'Belize', searchTerms: ['belize', 'bz'] },
  { code: 'bj', name: 'Benin', searchTerms: ['benin', 'bj'] },
  { code: 'bt', name: 'Bhutan', searchTerms: ['bhutan', 'bt'] },
  { code: 'bo', name: 'Bolivia', searchTerms: ['bolivia', 'bo'] },
  { code: 'ba', name: 'Bosnia and Herzegovina', searchTerms: ['bosnia', 'herzegovina', 'ba'] },
  { code: 'bw', name: 'Botswana', searchTerms: ['botswana', 'bw'] },
  { code: 'br', name: 'Brazil', searchTerms: ['brazil', 'br'] },
  { code: 'bn', name: 'Brunei', searchTerms: ['brunei', 'bn'] },
  { code: 'bg', name: 'Bulgaria', searchTerms: ['bulgaria', 'bg'] },
  { code: 'bf', name: 'Burkina Faso', searchTerms: ['burkina', 'faso', 'bf'] },
  { code: 'bi', name: 'Burundi', searchTerms: ['burundi', 'bi'] },
  
  // C
  { code: 'kh', name: 'Cambodia', searchTerms: ['cambodia', 'kh'] },
  { code: 'cm', name: 'Cameroon', searchTerms: ['cameroon', 'cm'] },
  { code: 'ca', name: 'Canada', searchTerms: ['canada', 'ca'] },
  { code: 'cv', name: 'Cape Verde', searchTerms: ['cape', 'verde', 'cv'] },
  { code: 'cf', name: 'Central African Republic', searchTerms: ['central', 'african', 'republic', 'cf'] },
  { code: 'td', name: 'Chad', searchTerms: ['chad', 'td'] },
  { code: 'cl', name: 'Chile', searchTerms: ['chile', 'cl'] },
  { code: 'cn', name: 'China', searchTerms: ['china', 'cn'] },
  { code: 'co', name: 'Colombia', searchTerms: ['colombia', 'co'] },
  { code: 'km', name: 'Comoros', searchTerms: ['comoros', 'km'] },
  { code: 'cg', name: 'Congo', searchTerms: ['congo', 'cg'] },
  { code: 'cd', name: 'Congo, Democratic Republic', searchTerms: ['congo', 'democratic', 'republic', 'cd'] },
  { code: 'cr', name: 'Costa Rica', searchTerms: ['costa', 'rica', 'cr'] },
  { code: 'ci', name: 'Côte d\'Ivoire', searchTerms: ['cote', 'divoire', 'ivory', 'coast', 'ci'] },
  { code: 'hr', name: 'Croatia', searchTerms: ['croatia', 'hr'] },
  { code: 'cu', name: 'Cuba', searchTerms: ['cuba', 'cu'] },
  { code: 'cy', name: 'Cyprus', searchTerms: ['cyprus', 'cy'] },
  { code: 'cz', name: 'Czech Republic', searchTerms: ['czech', 'republic', 'cz'] },
  
  // D
  { code: 'dk', name: 'Denmark', searchTerms: ['denmark', 'dk'] },
  { code: 'dj', name: 'Djibouti', searchTerms: ['djibouti', 'dj'] },
  { code: 'dm', name: 'Dominica', searchTerms: ['dominica', 'dm'] },
  { code: 'do', name: 'Dominican Republic', searchTerms: ['dominican', 'republic', 'do'] },
  
  // E
  { code: 'ec', name: 'Ecuador', searchTerms: ['ecuador', 'ec'] },
  { code: 'eg', name: 'Egypt', searchTerms: ['egypt', 'eg'] },
  { code: 'sv', name: 'El Salvador', searchTerms: ['el', 'salvador', 'sv'] },
  { code: 'gq', name: 'Equatorial Guinea', searchTerms: ['equatorial', 'guinea', 'gq'] },
  { code: 'er', name: 'Eritrea', searchTerms: ['eritrea', 'er'] },
  { code: 'ee', name: 'Estonia', searchTerms: ['estonia', 'ee'] },
  { code: 'et', name: 'Ethiopia', searchTerms: ['ethiopia', 'et'] },
  
  // F
  { code: 'fj', name: 'Fiji', searchTerms: ['fiji', 'fj'] },
  { code: 'fi', name: 'Finland', searchTerms: ['finland', 'fi'] },
  { code: 'fr', name: 'France', searchTerms: ['france', 'fr'] },
  
  // G
  { code: 'ga', name: 'Gabon', searchTerms: ['gabon', 'ga'] },
  { code: 'gm', name: 'Gambia', searchTerms: ['gambia', 'gm'] },
  { code: 'ge', name: 'Georgia', searchTerms: ['georgia', 'ge'] },
  { code: 'de', name: 'Germany', searchTerms: ['germany', 'de'] },
  { code: 'gh', name: 'Ghana', searchTerms: ['ghana', 'gh'] },
  { code: 'gr', name: 'Greece', searchTerms: ['greece', 'gr'] },
  { code: 'gd', name: 'Grenada', searchTerms: ['grenada', 'gd'] },
  { code: 'gt', name: 'Guatemala', searchTerms: ['guatemala', 'gt'] },
  { code: 'gn', name: 'Guinea', searchTerms: ['guinea', 'gn'] },
  { code: 'gw', name: 'Guinea-Bissau', searchTerms: ['guinea', 'bissau', 'gw'] },
  { code: 'gy', name: 'Guyana', searchTerms: ['guyana', 'gy'] },
  
  // H
  { code: 'ht', name: 'Haiti', searchTerms: ['haiti', 'ht'] },
  { code: 'hn', name: 'Honduras', searchTerms: ['honduras', 'hn'] },
  { code: 'hu', name: 'Hungary', searchTerms: ['hungary', 'hu'] },
  
  // I
  { code: 'is', name: 'Iceland', searchTerms: ['iceland', 'is'] },
  { code: 'in', name: 'India', searchTerms: ['india', 'in'] },
  { code: 'id', name: 'Indonesia', searchTerms: ['indonesia', 'id'] },
  { code: 'ir', name: 'Iran', searchTerms: ['iran', 'ir'] },
  { code: 'iq', name: 'Iraq', searchTerms: ['iraq', 'iq'] },
  { code: 'ie', name: 'Ireland', searchTerms: ['ireland', 'ie'] },
  { code: 'il', name: 'Israel', searchTerms: ['israel', 'il'] },
  { code: 'it', name: 'Italy', searchTerms: ['italy', 'it'] },
  
  // J
  { code: 'jm', name: 'Jamaica', searchTerms: ['jamaica', 'jm'] },
  { code: 'jp', name: 'Japan', searchTerms: ['japan', 'jp'] },
  { code: 'jo', name: 'Jordan', searchTerms: ['jordan', 'jo'] },
  
  // K
  { code: 'kz', name: 'Kazakhstan', searchTerms: ['kazakhstan', 'kz'] },
  { code: 'ke', name: 'Kenya', searchTerms: ['kenya', 'ke'] },
  { code: 'ki', name: 'Kiribati', searchTerms: ['kiribati', 'ki'] },
  { code: 'kp', name: 'North Korea', searchTerms: ['north', 'korea', 'kp'] },
  { code: 'kr', name: 'South Korea', searchTerms: ['south', 'korea', 'kr'] },
  { code: 'kw', name: 'Kuwait', searchTerms: ['kuwait', 'kw'] },
  { code: 'kg', name: 'Kyrgyzstan', searchTerms: ['kyrgyzstan', 'kg'] },
  
  // L
  { code: 'la', name: 'Laos', searchTerms: ['laos', 'la'] },
  { code: 'lv', name: 'Latvia', searchTerms: ['latvia', 'lv'] },
  { code: 'lb', name: 'Lebanon', searchTerms: ['lebanon', 'lb'] },
  { code: 'ls', name: 'Lesotho', searchTerms: ['lesotho', 'ls'] },
  { code: 'lr', name: 'Liberia', searchTerms: ['liberia', 'lr'] },
  { code: 'ly', name: 'Libya', searchTerms: ['libya', 'ly'] },
  { code: 'li', name: 'Liechtenstein', searchTerms: ['liechtenstein', 'li'] },
  { code: 'lt', name: 'Lithuania', searchTerms: ['lithuania', 'lt'] },
  { code: 'lu', name: 'Luxembourg', searchTerms: ['luxembourg', 'lu'] },
  
  // M
  { code: 'mg', name: 'Madagascar', searchTerms: ['madagascar', 'mg'] },
  { code: 'mw', name: 'Malawi', searchTerms: ['malawi', 'mw'] },
  { code: 'my', name: 'Malaysia', searchTerms: ['malaysia', 'my'] },
  { code: 'mv', name: 'Maldives', searchTerms: ['maldives', 'mv'] },
  { code: 'ml', name: 'Mali', searchTerms: ['mali', 'ml'] },
  { code: 'mt', name: 'Malta', searchTerms: ['malta', 'mt'] },
  { code: 'mh', name: 'Marshall Islands', searchTerms: ['marshall', 'islands', 'mh'] },
  { code: 'mr', name: 'Mauritania', searchTerms: ['mauritania', 'mr'] },
  { code: 'mu', name: 'Mauritius', searchTerms: ['mauritius', 'mu'] },
  { code: 'mx', name: 'Mexico', searchTerms: ['mexico', 'mx'] },
  { code: 'fm', name: 'Micronesia', searchTerms: ['micronesia', 'fm'] },
  { code: 'md', name: 'Moldova', searchTerms: ['moldova', 'md'] },
  { code: 'mc', name: 'Monaco', searchTerms: ['monaco', 'mc'] },
  { code: 'mn', name: 'Mongolia', searchTerms: ['mongolia', 'mn'] },
  { code: 'me', name: 'Montenegro', searchTerms: ['montenegro', 'me'] },
  { code: 'ma', name: 'Morocco', searchTerms: ['morocco', 'ma'] },
  { code: 'mz', name: 'Mozambique', searchTerms: ['mozambique', 'mz'] },
  { code: 'mm', name: 'Myanmar', searchTerms: ['myanmar', 'mm'] },
  
  // N
  { code: 'na', name: 'Namibia', searchTerms: ['namibia', 'na'] },
  { code: 'nr', name: 'Nauru', searchTerms: ['nauru', 'nr'] },
  { code: 'np', name: 'Nepal', searchTerms: ['nepal', 'np'] },
  { code: 'nl', name: 'Netherlands', searchTerms: ['netherlands', 'nl'] },
  { code: 'nz', name: 'New Zealand', searchTerms: ['new', 'zealand', 'nz'] },
  { code: 'ni', name: 'Nicaragua', searchTerms: ['nicaragua', 'ni'] },
  { code: 'ne', name: 'Niger', searchTerms: ['niger', 'ne'] },
  { code: 'ng', name: 'Nigeria', searchTerms: ['nigeria', 'ng'] },
  { code: 'mk', name: 'North Macedonia', searchTerms: ['north', 'macedonia', 'mk'] },
  { code: 'no', name: 'Norway', searchTerms: ['norway', 'no'] },
  
  // O
  { code: 'om', name: 'Oman', searchTerms: ['oman', 'om'] },
  
  // P
  { code: 'pk', name: 'Pakistan', searchTerms: ['pakistan', 'pk'] },
  { code: 'pw', name: 'Palau', searchTerms: ['palau', 'pw'] },
  { code: 'pa', name: 'Panama', searchTerms: ['panama', 'pa'] },
  { code: 'pg', name: 'Papua New Guinea', searchTerms: ['papua', 'new', 'guinea', 'pg'] },
  { code: 'py', name: 'Paraguay', searchTerms: ['paraguay', 'py'] },
  { code: 'pe', name: 'Peru', searchTerms: ['peru', 'pe'] },
  { code: 'ph', name: 'Philippines', searchTerms: ['philippines', 'ph'] },
  { code: 'pl', name: 'Poland', searchTerms: ['poland', 'pl'] },
  { code: 'pt', name: 'Portugal', searchTerms: ['portugal', 'pt'] },
  
  // Q
  { code: 'qa', name: 'Qatar', searchTerms: ['qatar', 'qa'] },
  
  // R
  { code: 'ro', name: 'Romania', searchTerms: ['romania', 'ro'] },
  { code: 'ru', name: 'Russia', searchTerms: ['russia', 'ru'] },
  { code: 'rw', name: 'Rwanda', searchTerms: ['rwanda', 'rw'] },
  
  // S
  { code: 'kn', name: 'Saint Kitts and Nevis', searchTerms: ['saint', 'kitts', 'nevis', 'kn'] },
  { code: 'lc', name: 'Saint Lucia', searchTerms: ['saint', 'lucia', 'lc'] },
  { code: 'vc', name: 'Saint Vincent and the Grenadines', searchTerms: ['saint', 'vincent', 'grenadines', 'vc'] },
  { code: 'ws', name: 'Samoa', searchTerms: ['samoa', 'ws'] },
  { code: 'sm', name: 'San Marino', searchTerms: ['san', 'marino', 'sm'] },
  { code: 'st', name: 'São Tomé and Príncipe', searchTerms: ['sao', 'tome', 'principe', 'st'] },
  { code: 'sa', name: 'Saudi Arabia', searchTerms: ['saudi', 'arabia', 'sa'] },
  { code: 'sn', name: 'Senegal', searchTerms: ['senegal', 'sn'] },
  { code: 'rs', name: 'Serbia', searchTerms: ['serbia', 'rs'] },
  { code: 'sc', name: 'Seychelles', searchTerms: ['seychelles', 'sc'] },
  { code: 'sl', name: 'Sierra Leone', searchTerms: ['sierra', 'leone', 'sl'] },
  { code: 'sg', name: 'Singapore', searchTerms: ['singapore', 'sg'] },
  { code: 'sk', name: 'Slovakia', searchTerms: ['slovakia', 'sk'] },
  { code: 'si', name: 'Slovenia', searchTerms: ['slovenia', 'si'] },
  { code: 'sb', name: 'Solomon Islands', searchTerms: ['solomon', 'islands', 'sb'] },
  { code: 'so', name: 'Somalia', searchTerms: ['somalia', 'so'] },
  { code: 'za', name: 'South Africa', searchTerms: ['south', 'africa', 'za'] },
  { code: 'ss', name: 'South Sudan', searchTerms: ['south', 'sudan', 'ss'] },
  { code: 'es', name: 'Spain', searchTerms: ['spain', 'es'] },
  { code: 'lk', name: 'Sri Lanka', searchTerms: ['sri', 'lanka', 'lk'] },
  { code: 'sd', name: 'Sudan', searchTerms: ['sudan', 'sd'] },
  { code: 'sr', name: 'Suriname', searchTerms: ['suriname', 'sr'] },
  { code: 'sz', name: 'Swaziland', searchTerms: ['swaziland', 'sz'] },
  { code: 'se', name: 'Sweden', searchTerms: ['sweden', 'se'] },
  { code: 'ch', name: 'Switzerland', searchTerms: ['switzerland', 'ch'] },
  { code: 'sy', name: 'Syria', searchTerms: ['syria', 'sy'] },
  
  // T
  { code: 'tw', name: 'Taiwan', searchTerms: ['taiwan', 'tw'] },
  { code: 'tj', name: 'Tajikistan', searchTerms: ['tajikistan', 'tj'] },
  { code: 'tz', name: 'Tanzania', searchTerms: ['tanzania', 'tz'] },
  { code: 'th', name: 'Thailand', searchTerms: ['thailand', 'th'] },
  { code: 'tl', name: 'Timor-Leste', searchTerms: ['timor', 'leste', 'tl'] },
  { code: 'tg', name: 'Togo', searchTerms: ['togo', 'tg'] },
  { code: 'to', name: 'Tonga', searchTerms: ['tonga', 'to'] },
  { code: 'tt', name: 'Trinidad and Tobago', searchTerms: ['trinidad', 'tobago', 'tt'] },
  { code: 'tn', name: 'Tunisia', searchTerms: ['tunisia', 'tn'] },
  { code: 'tr', name: 'Turkey', searchTerms: ['turkey', 'tr'] },
  { code: 'tm', name: 'Turkmenistan', searchTerms: ['turkmenistan', 'tm'] },
  { code: 'tv', name: 'Tuvalu', searchTerms: ['tuvalu', 'tv'] },
  
  // U
  { code: 'ug', name: 'Uganda', searchTerms: ['uganda', 'ug'] },
  { code: 'ua', name: 'Ukraine', searchTerms: ['ukraine', 'ua'] },
  { code: 'ae', name: 'United Arab Emirates', searchTerms: ['united', 'arab', 'emirates', 'uae', 'ae'] },
  { code: 'gb', name: 'United Kingdom', searchTerms: ['united', 'kingdom', 'uk', 'gb'] },
  { code: 'us', name: 'United States', searchTerms: ['united', 'states', 'usa', 'us'] },
  { code: 'uy', name: 'Uruguay', searchTerms: ['uruguay', 'uy'] },
  { code: 'uz', name: 'Uzbekistan', searchTerms: ['uzbekistan', 'uz'] },
  
  // V
  { code: 'vu', name: 'Vanuatu', searchTerms: ['vanuatu', 'vu'] },
  { code: 'va', name: 'Vatican City', searchTerms: ['vatican', 'city', 'va'] },
  { code: 've', name: 'Venezuela', searchTerms: ['venezuela', 've'] },
  { code: 'vn', name: 'Vietnam', searchTerms: ['vietnam', 'vn'] },
  
  // Y
  { code: 'ye', name: 'Yemen', searchTerms: ['yemen', 'ye'] },
  
  // Z
  { code: 'zm', name: 'Zambia', searchTerms: ['zambia', 'zm'] },
  { code: 'zw', name: 'Zimbabwe', searchTerms: ['zimbabwe', 'zw'] }
]

// Group countries by first letter for alphabetical navigation
export const countriesByLetter = countries.reduce((acc, country) => {
  const firstLetter = country.name.charAt(0).toUpperCase()
  if (!acc[firstLetter]) {
    acc[firstLetter] = []
  }
  acc[firstLetter].push(country)
  return acc
}, {} as Record<string, Country[]>)

// Get all unique first letters for navigation
export const alphabetLetters = Object.keys(countriesByLetter).sort()

// Search function
export const searchCountries = (query: string): Country[] => {
  if (!query.trim()) return countries
  
  const lowercaseQuery = query.toLowerCase()
  return countries.filter(country => 
    country.name.toLowerCase().includes(lowercaseQuery) ||
    country.searchTerms.some(term => term.includes(lowercaseQuery))
  )
}
