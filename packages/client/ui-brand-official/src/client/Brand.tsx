import { BrandWordmark, FishLogo } from '@deepseek-ai/dsh-client-ui-primitives'
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'

/** Render the custom local-build planet mark. */
export function LocalPlanetBrandMark({ size, className }: HeroBrandMarkOwnerProps) {
  return (
    <span
      className={className}
      data-local-brand-mark="planet"
      style={{
        alignItems: 'center',
        display: 'inline-flex',
        filter: 'hue-rotate(235deg) saturate(1.65) contrast(1.08) drop-shadow(0 0 3px rgb(139 92 246 / 55%))',
        flexShrink: 0,
        fontSize: Math.round(size * 1.15),
        height: size,
        justifyContent: 'center',
        lineHeight: 1,
        width: size,
      }}
      aria-hidden="true"
    >
      🪐
    </span>
  )
}

/** Render the localized custom name without development metadata. */
export function LocalBrandName({ name }: { readonly name: string }) {
  return (
    <span
      data-local-brand-name="true"
      style={{ fontSize: 12, letterSpacing: 0, lineHeight: '13px', whiteSpace: 'nowrap' }}
    >
      {name}
    </span>
  )
}

/**
 * Render the official mark with the presentation requested by its host surface.
 * @param props - Host-supplied mark presentation.
 * @returns the official whale mark.
 */
export function OfficialBrandMark({ size }: SidebarBrandMarkOwnerProps) {
  return <FishLogo size={size} />
}

/**
 * Render the official name artwork without its independently slotted mark.
 * @returns the official name wordmark.
 */
export function OfficialBrandName() {
  return <BrandWordmark includeMark={false} />
}
