import { AnimationTriggerMetadata,
  trigger,
  state,
  style,
  animate,
  transition } from '@angular/animations';
export const dropAnimation: AnimationTriggerMetadata = trigger(
  'dropAnimation', [
    state('*', style({
      opacity: 0,
      height: 0,
      border: 0,
      padding: 0,
      visibility: 'hidden',
      display: 'none'
    })),
    state('false', style({
      opacity: 0,
      height: 0,
      border: 0,
      padding: 0,
      visibility: 'hidden',
      display: 'none'
    })),
    state('true', style({
      opacity: 1,
      height: '*',
      border: '*',
      padding: '*',
      visibility: 'inherit',
      display: 'block'
    })),
    transition('* => *', animate('250ms ease-out'))
  ]
);
export const dialogAnimation: AnimationTriggerMetadata = trigger(
  'dialogAnimation', [
    state('*', style({
      opacity: 0,
      visibility: 'hidden',
      transform: 'translateY(-50px)'
    })),
    state('false', style({
      opacity: 0,
      visibility: 'hidden',
      transform: 'translateY(-50px)'
    })),
    state('true', style({
      opacity: 1,
      visibility: 'inherit',
      transform: 'translateY(0)'
    })),
    transition('* <=> *', animate('500ms ease-in-out'))
  ]
);
export const modalAnimation: AnimationTriggerMetadata = trigger(
  'modalAnimation', [
    state('*', style({
      opacity: 0,
      visibility: 'hidden',
      transform: 'translateX(100%)'
    })),
    state('false', style({
      opacity: 0,
      visibility: 'hidden',
      display: 'none',
      transform: 'translateX(100%)'
    })),
    state('true', style({
      opacity: 1,
      visibility: 'inherit',
      display: 'block',
      transform: 'translateX(0)'
    })),
    transition('* <=> *', animate('0.3s linear'))
  ]
);
