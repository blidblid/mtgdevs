import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import { RegisteredIcon } from './icon-registry-model';


@Injectable({ providedIn: 'root' })
export class IconRegistryService {

  private icons: RegisteredIcon[] = [
    this.createIconResource('github'),
    this.createIconResource('patreon')
  ];

  constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) { }

  registerDefaults(): void {
    this.icons.forEach(icon => {
      this.iconRegistry.addSvgIcon(icon.name, this.sanitizer.bypassSecurityTrustResourceUrl(icon.url));
    });
  }

  private createIconResource(name: string): RegisteredIcon {
    return { name, url: `../../assets/${name}.svg` }
  }
}
