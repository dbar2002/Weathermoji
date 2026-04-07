// ISO 3166-1 alpha-2 → country name + flag emoji
const COUNTRIES: Record<string, { name: string; flag: string }> = {
  AF: { name: 'Afghanistan', flag: '🇦🇫' }, AL: { name: 'Albania', flag: '🇦🇱' }, DZ: { name: 'Algeria', flag: '🇩🇿' },
  AD: { name: 'Andorra', flag: '🇦🇩' }, AO: { name: 'Angola', flag: '🇦🇴' }, AR: { name: 'Argentina', flag: '🇦🇷' },
  AM: { name: 'Armenia', flag: '🇦🇲' }, AU: { name: 'Australia', flag: '🇦🇺' }, AT: { name: 'Austria', flag: '🇦🇹' },
  AZ: { name: 'Azerbaijan', flag: '🇦🇿' }, BS: { name: 'Bahamas', flag: '🇧🇸' }, BH: { name: 'Bahrain', flag: '🇧🇭' },
  BD: { name: 'Bangladesh', flag: '🇧🇩' }, BB: { name: 'Barbados', flag: '🇧🇧' }, BY: { name: 'Belarus', flag: '🇧🇾' },
  BE: { name: 'Belgium', flag: '🇧🇪' }, BZ: { name: 'Belize', flag: '🇧🇿' }, BJ: { name: 'Benin', flag: '🇧🇯' },
  BT: { name: 'Bhutan', flag: '🇧🇹' }, BO: { name: 'Bolivia', flag: '🇧🇴' }, BA: { name: 'Bosnia', flag: '🇧🇦' },
  BW: { name: 'Botswana', flag: '🇧🇼' }, BR: { name: 'Brazil', flag: '🇧🇷' }, BN: { name: 'Brunei', flag: '🇧🇳' },
  BG: { name: 'Bulgaria', flag: '🇧🇬' }, KH: { name: 'Cambodia', flag: '🇰🇭' }, CM: { name: 'Cameroon', flag: '🇨🇲' },
  CA: { name: 'Canada', flag: '🇨🇦' }, CL: { name: 'Chile', flag: '🇨🇱' }, CN: { name: 'China', flag: '🇨🇳' },
  CO: { name: 'Colombia', flag: '🇨🇴' }, CR: { name: 'Costa Rica', flag: '🇨🇷' }, HR: { name: 'Croatia', flag: '🇭🇷' },
  CU: { name: 'Cuba', flag: '🇨🇺' }, CY: { name: 'Cyprus', flag: '🇨🇾' }, CZ: { name: 'Czechia', flag: '🇨🇿' },
  DK: { name: 'Denmark', flag: '🇩🇰' }, DO: { name: 'Dominican Republic', flag: '🇩🇴' }, EC: { name: 'Ecuador', flag: '🇪🇨' },
  EG: { name: 'Egypt', flag: '🇪🇬' }, SV: { name: 'El Salvador', flag: '🇸🇻' }, EE: { name: 'Estonia', flag: '🇪🇪' },
  ET: { name: 'Ethiopia', flag: '🇪🇹' }, FI: { name: 'Finland', flag: '🇫🇮' }, FR: { name: 'France', flag: '🇫🇷' },
  GE: { name: 'Georgia', flag: '🇬🇪' }, DE: { name: 'Germany', flag: '🇩🇪' }, GH: { name: 'Ghana', flag: '🇬🇭' },
  GR: { name: 'Greece', flag: '🇬🇷' }, GT: { name: 'Guatemala', flag: '🇬🇹' }, HN: { name: 'Honduras', flag: '🇭🇳' },
  HK: { name: 'Hong Kong', flag: '🇭🇰' }, HU: { name: 'Hungary', flag: '🇭🇺' }, IS: { name: 'Iceland', flag: '🇮🇸' },
  IN: { name: 'India', flag: '🇮🇳' }, ID: { name: 'Indonesia', flag: '🇮🇩' }, IR: { name: 'Iran', flag: '🇮🇷' },
  IQ: { name: 'Iraq', flag: '🇮🇶' }, IE: { name: 'Ireland', flag: '🇮🇪' }, IL: { name: 'Israel', flag: '🇮🇱' },
  IT: { name: 'Italy', flag: '🇮🇹' }, JM: { name: 'Jamaica', flag: '🇯🇲' }, JP: { name: 'Japan', flag: '🇯🇵' },
  JO: { name: 'Jordan', flag: '🇯🇴' }, KZ: { name: 'Kazakhstan', flag: '🇰🇿' }, KE: { name: 'Kenya', flag: '🇰🇪' },
  KR: { name: 'South Korea', flag: '🇰🇷' }, KW: { name: 'Kuwait', flag: '🇰🇼' }, LV: { name: 'Latvia', flag: '🇱🇻' },
  LB: { name: 'Lebanon', flag: '🇱🇧' }, LT: { name: 'Lithuania', flag: '🇱🇹' }, LU: { name: 'Luxembourg', flag: '🇱🇺' },
  MO: { name: 'Macao', flag: '🇲🇴' }, MY: { name: 'Malaysia', flag: '🇲🇾' }, MX: { name: 'Mexico', flag: '🇲🇽' },
  MA: { name: 'Morocco', flag: '🇲🇦' }, MM: { name: 'Myanmar', flag: '🇲🇲' }, NP: { name: 'Nepal', flag: '🇳🇵' },
  NL: { name: 'Netherlands', flag: '🇳🇱' }, NZ: { name: 'New Zealand', flag: '🇳🇿' }, NG: { name: 'Nigeria', flag: '🇳🇬' },
  NO: { name: 'Norway', flag: '🇳🇴' }, OM: { name: 'Oman', flag: '🇴🇲' }, PK: { name: 'Pakistan', flag: '🇵🇰' },
  PA: { name: 'Panama', flag: '🇵🇦' }, PY: { name: 'Paraguay', flag: '🇵🇾' }, PE: { name: 'Peru', flag: '🇵🇪' },
  PH: { name: 'Philippines', flag: '🇵🇭' }, PL: { name: 'Poland', flag: '🇵🇱' }, PT: { name: 'Portugal', flag: '🇵🇹' },
  QA: { name: 'Qatar', flag: '🇶🇦' }, RO: { name: 'Romania', flag: '🇷🇴' }, RU: { name: 'Russia', flag: '🇷🇺' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦' }, RS: { name: 'Serbia', flag: '🇷🇸' }, SG: { name: 'Singapore', flag: '🇸🇬' },
  SK: { name: 'Slovakia', flag: '🇸🇰' }, SI: { name: 'Slovenia', flag: '🇸🇮' }, ZA: { name: 'South Africa', flag: '🇿🇦' },
  ES: { name: 'Spain', flag: '🇪🇸' }, LK: { name: 'Sri Lanka', flag: '🇱🇰' }, SE: { name: 'Sweden', flag: '🇸🇪' },
  CH: { name: 'Switzerland', flag: '🇨🇭' }, TW: { name: 'Taiwan', flag: '🇹🇼' }, TH: { name: 'Thailand', flag: '🇹🇭' },
  TR: { name: 'Turkey', flag: '🇹🇷' }, UA: { name: 'Ukraine', flag: '🇺🇦' }, AE: { name: 'UAE', flag: '🇦🇪' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' }, US: { name: 'United States', flag: '🇺🇸' }, UY: { name: 'Uruguay', flag: '🇺🇾' },
  UZ: { name: 'Uzbekistan', flag: '🇺🇿' }, VE: { name: 'Venezuela', flag: '🇻🇪' }, VN: { name: 'Vietnam', flag: '🇻🇳' },
};

export function getCountryName(code: string): string {
  return COUNTRIES[code]?.name ?? code;
}

export function getCountryFlag(code: string): string {
  return COUNTRIES[code]?.flag ?? '';
}
