/** Site-specific newsletter fields not declared on Pliny's NewsletterConfig */
declare module 'pliny/newsletter/index.js' {
  interface NewsletterConfig {
    /** Buttondown embed username (newsletter slug) for iframe subscribe on the homepage */
    buttondownEmbedUsername?: string
  }
}

export {}
