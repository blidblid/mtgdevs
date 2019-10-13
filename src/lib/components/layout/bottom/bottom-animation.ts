import { trigger, state, style, transition, animate } from '@angular/animations';


export const slideUp = trigger('slideUp', [
  state('open', style({
    height: '50vh'
  })),
  state('closed', style({
    height: '0',
    padding: '0'
  })),
  transition('open <=> closed', [
    animate('0ms')
  ])
]);
