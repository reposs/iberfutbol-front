import { InjectionToken } from '@angular/core';

export type MonetizationChannel =
  | 'editorial-placeholder'
  | 'adsense'
  | 'direct-sponsor'
  | 'affiliate'
  | 'premium-pro';

export interface MonetizationSlotSpec {
  slotId: string;
  format: 'LEADERBOARD' | 'IN_FEED' | 'FOOTER_BANNER';
  dimensionsLabel: string;
  channel: MonetizationChannel;
  headline: string;
  ctaLabel: string;
}

export interface MonetizationConfig {
  /**
   * Fase 9 (Secciones 40 y 41):
   * Inicialmente desactivada la publicidad comercial intrusiva (`activeCommercialAds: false`)
   * hasta alcanzar masa crítica de tráfico SEO. Los slots mantienen dimensiones fijas (CLS = 0)
   * y están listos para conectar Google AdSense, patrocinadores directos o suscripción IberFútbol PRO.
   */
  activeCommercialAds: boolean;
  adsenseClientId?: string;
  premiumSubscriptionEnabled: boolean;
}

export const DEFAULT_MONETIZATION_CONFIG: MonetizationConfig = {
  activeCommercialAds: false,
  premiumSubscriptionEnabled: false,
};

export const MONETIZATION_CONFIG = new InjectionToken<MonetizationConfig>(
  'MONETIZATION_CONFIG',
  {
    providedIn: 'root',
    factory: () => DEFAULT_MONETIZATION_CONFIG,
  },
);
