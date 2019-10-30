import { trigger, state, style, animate, transition } from '@angular/animations';


export const EXPAND_ANIMATION = [
  trigger('expand', [
    state('open', style({
      'width': 'auto',
      'min-width': '380px'
    })),
    state('closed', style({
      'width': 0,
      'padding': 0
    })),
    transition('open <=> closed', [
      animate('0ms')
    ])
  ]),
];
