import { trigger, state, transition, animate, style } from '@angular/animations';


export const NORMALIZE_ANIMATION = [
  trigger('normalize', [
    state('open', style({})),
    state('closed', style({
      height: '0',
      padding: 0,
      overflow: 'hidden',
      display: 'none'
    })),
    transition('open => closed', [
      animate('0.2s')
    ]),
    transition('closed => open', [
      animate('0.2s')
    ]),
  ]),
]