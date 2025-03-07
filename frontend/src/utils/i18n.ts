import heTranslations from "../locales/he.json";

/**
 * Simple i18n utility for handling translations
 */
class I18n {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private translations: Record<string, any>;
  private currentLocale: string;

  constructor() {
    // Default to Hebrew locale
    this.currentLocale = "he";
    this.translations = {
      he: heTranslations,
    };
  }

  /**
   * Get a translation by key using dot notation
   * e.g., t('auth.login')
   *
   * @param key - The translation key using dot notation
   * @param params - Optional parameters for string interpolation
   * @returns The translated string or the key if translation not found
   */
  t(key: string, params?: Record<string, string>): string {
    // Split the key by dots to navigate the nested structure
    const keys = key.split(".");
    let translation = this.translations[this.currentLocale];

    // Navigate through the nested structure
    for (const k of keys) {
      if (!translation || !translation[k]) {
        // Return the key if translation not found
        return key;
      }
      translation = translation[k];
    }

    // If the translation is not a string, return the key
    if (typeof translation !== "string") {
      return key;
    }

    // Replace parameters in the translation if provided
    if (params) {
      let result = translation;
      Object.entries(params).forEach(([paramKey, value]) => {
        result = result.replace(`{${paramKey}}`, value);
      });
      return result;
    }

    return translation;
  }

  /**
   * Set the current locale
   *
   * @param locale - The locale to set
   */
  setLocale(locale: string): void {
    if (this.translations[locale]) {
      this.currentLocale = locale;
    } else {
      console.warn(
        `Locale '${locale}' not available, using '${this.currentLocale}' instead.`
      );
    }
  }

  /**
   * Get the current locale
   *
   * @returns The current locale
   */
  getLocale(): string {
    return this.currentLocale;
  }

  /**
   * Add translations for a locale
   *
   * @param locale - The locale to add translations for
   * @param translations - The translations object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTranslations(locale: string, translations: Record<string, any>): void {
    this.translations[locale] = translations;
  }
}

// Create singleton instance
const i18n = new I18n();

export default i18n;
