import { trigger, state, style, transition, animate } from '@angular/animations';

export const expandCollapseAnimation = trigger('expandCollapse', [
  state('open', style({
    maxHeight: '500px',
    opacity: 1,
    paddingTop: '*',
    paddingBottom: '*',
    marginBottom: '*'
  })),
  state('closed', style({
    maxHeight: '0px',
    opacity: 0,
    paddingTop: '0px',
    paddingBottom: '0px',
    marginBottom: '0px'
  })),
  transition('open <=> closed', [
    animate('300ms cubic-bezier(0.4,0,0.2,1)')
  ])
]); 