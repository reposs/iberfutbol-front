import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Match, Player, Team } from '../../domain/entities/football.models';

export interface BreadcrumbSeoItem {
  label: string;
  path: string;
}

export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  robots?: string;
  breadcrumbs?: BreadcrumbSeoItem[];
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

@Injectable({ providedIn: 'root' })
export class SeoMetaService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);

  private readonly siteBaseUrl = 'https://iberfutbol.es';
  private readonly defaultOgImage =
    'https://iberfutbol.es/assets/og-iberfutbol.png';

  updatePageSeo(config: PageSeoConfig): void {
    const fullTitle = config.title.includes('IberFútbol')
      ? config.title
      : `${config.title} | IberFútbol`;

    const rawPath = config.canonicalPath ?? this.router.url.split('?')[0] ?? '/';
    const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    const canonicalUrl = `${this.siteBaseUrl}${normalizedPath}`;
    const ogType = config.ogType ?? 'website';
    const ogImage = config.ogImage ?? this.defaultOgImage;
    const robots =
      config.robots ??
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    this.titleService.setTitle(fullTitle);

    this.metaService.updateTag({
      name: 'description',
      content: config.description,
    });
    this.metaService.updateTag({
      name: 'robots',
      content: robots,
    });

    // Open Graph
    this.metaService.updateTag({
      property: 'og:title',
      content: fullTitle,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: config.description,
    });
    this.metaService.updateTag({
      property: 'og:type',
      content: ogType,
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: canonicalUrl,
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: ogImage,
    });

    // Twitter Cards
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.updateTag({
      name: 'twitter:title',
      content: fullTitle,
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: config.description,
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: ogImage,
    });

    this.updateCanonicalLink(canonicalUrl);
    this.injectStructuredData(config, canonicalUrl);
  }

  buildWebsiteSchema(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'IberFútbol',
      alternateName: 'IberFútbol — El Fútbol Español, en un solo lugar',
      url: this.siteBaseUrl,
      inLanguage: 'es-ES',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.siteBaseUrl}/buscar?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };
  }

  buildMatchSchema(match: Match): Record<string, unknown> {
    const eventStatus =
      match.status === 'FINISHED'
        ? 'https://schema.org/EventCompleted'
        : match.status === 'LIVE'
          ? 'https://schema.org/EventInProgress'
          : 'https://schema.org/EventScheduled';

    return {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${match.homeTeam.name} vs ${match.awayTeam.name} (${match.competitionName})`,
      description: `Partido de ${match.competitionName} (${match.roundLabel}) entre ${match.homeTeam.name} y ${match.awayTeam.name} en ${match.stadium}.`,
      startDate: `${match.dateIso}T${match.kickoffTime}:00+02:00`,
      eventStatus,
      sport: 'Soccer',
      url: `${this.siteBaseUrl}/partidos/${match.slug}`,
      location: {
        '@type': 'StadiumOrArena',
        name: match.stadium,
        address: {
          '@type': 'PostalAddress',
          addressLocality: match.city,
          addressCountry: 'ES',
        },
      },
      homeTeam: {
        '@type': 'SportsTeam',
        name: match.homeTeam.name,
        url: `${this.siteBaseUrl}/equipos/${match.homeTeam.slug}`,
      },
      awayTeam: {
        '@type': 'SportsTeam',
        name: match.awayTeam.name,
        url: `${this.siteBaseUrl}/equipos/${match.awayTeam.slug}`,
      },
    };
  }

  buildTeamSchema(team: Team): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsTeam',
      name: team.name,
      alternateName: team.shortName,
      sport: 'Soccer',
      foundingDate: String(team.foundedYear),
      url: `${this.siteBaseUrl}/equipos/${team.slug}`,
      coach: {
        '@type': 'Person',
        name: team.coach,
      },
      location: {
        '@type': 'StadiumOrArena',
        name: team.stadium,
        address: {
          '@type': 'PostalAddress',
          addressLocality: team.city,
          addressRegion: team.autonomousCommunity,
          addressCountry: 'ES',
        },
      },
      memberOf: {
        '@type': 'SportsOrganization',
        name: team.competitionName,
        url: `${this.siteBaseUrl}/competiciones/${team.competitionSlug}`,
      },
    };
  }

  buildPlayerSchema(player: Player): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: player.name,
      jobTitle: `Futbolista profesional (${player.position})`,
      nationality: {
        '@type': 'Country',
        name: player.nationality,
      },
      url: `${this.siteBaseUrl}/jugadores/${player.slug}`,
      affiliation: {
        '@type': 'SportsTeam',
        name: player.teamName,
        url: `${this.siteBaseUrl}/equipos/${player.teamSlug}`,
      },
    };
  }

  buildCompetitionSchema(
    name: string,
    slug: string,
    season: string,
  ): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsOrganization',
      name: `${name} (${season})`,
      sport: 'Soccer',
      url: `${this.siteBaseUrl}/competiciones/${slug}`,
    };
  }

  private updateCanonicalLink(canonicalUrl: string): void {
    let link = this.doc.getElementById('canonical-link') as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('id', 'canonical-link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  }

  private injectStructuredData(config: PageSeoConfig, canonicalUrl: string): void {
    const graph: Record<string, unknown>[] = [];

    if (config.breadcrumbs && config.breadcrumbs.length > 0) {
      graph.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: config.breadcrumbs.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.label,
          item: `${this.siteBaseUrl}${item.path.startsWith('/') ? item.path : '/' + item.path}`,
        })),
      });
    }

    if (config.structuredData) {
      if (Array.isArray(config.structuredData)) {
        graph.push(...config.structuredData);
      } else {
        graph.push(config.structuredData);
      }
    } else if (canonicalUrl === `${this.siteBaseUrl}/`) {
      graph.push(this.buildWebsiteSchema());
    }

    const scriptId = 'iberfutbol-jsonld';
    let scriptEl = this.doc.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = this.doc.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      this.doc.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify(
      graph.length === 1 ? graph[0] : { '@context': 'https://schema.org', '@graph': graph },
    )
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
  }
}
