import { AnimationTriggerMetadata, trigger, state, style, animate, transition } from '@angular/animations';
export const MessageAnimation: AnimationTriggerMetadata = trigger(
  'messageAnimation',
  [
    state('*', style({
      opacity: 0,
      top: '20px',
      visibility: 'hidden'
    })),
    state('false', style({
      opacity: 0,
      top: '20px',
      visibility: 'hidden'
    })),
    state('true', style({
      opacity: 1,
      visibility: 'inherit',
      top: '*'
    })),
    transition('* <=> *', animate('250ms ease-out'))
  ]
);
export const MessageItemAnimation: AnimationTriggerMetadata = trigger(
  'messageItemAnimation', [
    state('in', style({
      opacity: 1,
      transform: 'translateX(0)'
    })),
    transition('void => *', [
      style({
        opacity: 0,
        transform: 'translateX(-100%)'
      }),
      animate('0.6s ease-in')
    ]),
    transition('* => void', [
      animate('0.2s 0.1s ease-out', style({
        opacity: 0,
        transform: 'translateX(100%)'
      }))
    ])
  ]
);
