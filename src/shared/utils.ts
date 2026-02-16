export class Utils {

  static normalizeColumnName(str: string): string {
    // Mapa de caracteres acentuados para suas versões normalizadas
    const accentMap: Record<string, string> = {
      'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
      'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
      'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
      'ç': 'c', 'ñ': 'n',
    };

    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .split('')
      .map(char => accentMap[char] || char)
      .join('')
      .replace(/[^a-z0-9_]/g, '_');
  }
}