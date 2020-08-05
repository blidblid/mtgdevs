import { InjectionToken } from '@angular/core';



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
  Constructed,
  Math
}

export interface Subcategory {
  name: string;
  components: SideNavItem[];
}

const rootWallpaperUrl = 'https://media.magic.wizards.com/images/wallpaper/';
const wallpaperSuffix = '_1920x1080_wallpaper.jpg';
export const PLAY_MATS = [
  'gallia-endless-dance_thb',
  'nyx-lotus_thb',
  'liliana-waker-of-the-dead_m21'
].map(playmat => `${rootWallpaperUrl}${playmat}${wallpaperSuffix}`);

