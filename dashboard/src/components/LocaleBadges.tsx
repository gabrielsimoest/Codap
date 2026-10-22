import { Badge } from '@/components/ui/badge'
import { missingLocales } from '@/lib/mergeContent'
import { LOCALES, type LocaleCode, type TranslationMap } from '@/types/api'

/**
 * Mostra em quais idiomas a entidade ainda não tem tradução.
 *
 * Não é enfeite: as rotas de escrita aceitam um mapa parcial de propósito (o
 * conteúdo é escrito em português e traduzido depois), e uma entidade sem
 * tradução chega ao app com o campo **vazio**, sem erro nenhum. Este selo é o
 * que impede isso de passar despercebido.
 */
export function LocaleBadges ({
  translations,
  locales = LOCALES
}: {
  translations: TranslationMap<unknown>;
  locales?: LocaleCode[];
}) {
  const missing = missingLocales(translations, locales)

  if (missing.length === 0) {
    return null
  }

  return (
    <span className="flex gap-1">
      {missing.map((locale) => (
        <Badge
          key={locale}
          variant="outline"
          className="border-destructive/50 px-1 py-0 text-[10px] uppercase text-destructive"
          title={`Sem tradução em ${locale}`}
        >
          sem {locale}
        </Badge>
      ))}
    </span>
  )
}
