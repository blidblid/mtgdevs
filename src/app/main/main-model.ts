import { InjectionToken } from '@angular/core';


const rootWallpaperUrl = 'https://magic.wizards.com/sites/mtg/files/images/wallpaper/';

export const SIDE_NAV_ITEM = new InjectionToken<any>('Component displayed in the sidenav');

export interface SideNavItem {
  name: string;
  component: any;
  link: string;
  icon: string;
  subcategory: SideNavItemSubcategory;
}

export enum SideNavItemSubcategory {
  Limited,
  Arena,
  Deck,
  Math
}

export interface Subcategory {
  name: string;
  components: SideNavItem[]
}

export const PLAY_MATS = [
  `${rootWallpaperUrl}Ghost_Ship_A25_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Angelic-Page_A25_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Curious-Obsession_RIX_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Negate_RIX_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Zacama-Primal-Calamity_RIX_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}The-Immortal-Sun_RIX_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Azor-the-Lawbringer_RIX_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Blood_Sun_RIX_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Kumena-Tyrant-of-Orazca_RIX_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Silvergill-Adept_RIX_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Primal-Wellspring_XLN_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Perilous-Voyage_XLN_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Itlimoc-Cradle-of-the-Sun_XLN_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Unclaimed-Territory_XLN_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Kopala-Warden-of-Waves_XLN_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Jace-Cunning-Castaway_XLN_1920x1080_Wallpaper.jpg`,
  `${rootWallpaperUrl}Rootbound-Crag_XLN_1920x1080_Wallpaper.jpg`
];
