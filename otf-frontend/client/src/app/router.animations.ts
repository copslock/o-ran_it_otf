/*  Copyright (c) 2019 AT&T Intellectual Property.                             #
#                                                                              #
#   Licensed under the Apache License, Version 2.0 (the "License");            #
#   you may not use this file except in compliance with the License.           #
#   You may obtain a copy of the License at                                    #
#                                                                              #
#       http://www.apache.org/licenses/LICENSE-2.0                             #
#                                                                              #
#   Unless required by applicable law or agreed to in writing, software        #
#   distributed under the License is distributed on an "AS IS" BASIS,          #
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
#   See the License for the specific language governing permissions and        #
#   limitations under the License.                                             #
##############################################################################*/


import { animate, group, query, state, style, transition, trigger } from '@angular/animations';

export function routerTransition() {
    return slideToTop();
}

export function routerLeftTransition() {
    return slideToLeft();
}

export function slideToRight() {
    return trigger('routerTransition', [
        state('void', style({})),
        state('*', style({})),
        transition(':enter', [
            style({ transform: 'translateX(-100%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
        ]),
        transition(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(100%)' }))
        ])
    ]);
}

export function slideToLeft() {
    return trigger('routerTransition', [
        state('void', style({})),
        state('*', style({})),
        transition(':enter', [
            style({ transform: 'translateX(100%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
        ]),
        transition(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(-100%)' }))
        ])
    ]);
}

export function slideToBottom() {
    return trigger('routerTransition', [
        state('void', style({})),
        state('*', style({})),
        transition(':enter', [
            style({ transform: 'translateY(-100%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateY(0%)' }))
        ]),
        transition(':leave', [
            style({ transform: 'translateY(0%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateY(100%)' }))
        ])
    ]);
}

export function slideToTop() {
    return trigger('routerTransition', [
        state('void', style({})),
        state('*', style({})),
        transition(':enter', [
            style({ transform: 'translateY(100%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateY(0%)' }))
        ]),
        transition(':leave', [
            style({ transform: 'translateY(0%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateY(-100%)' }))
        ])
    ]);
}

  
export function routerTransitionCustom() {
    alert("");
    return trigger('routerAnimation', [
        state('void', style({})),
        state('*', style({})),
      // LEFT TO RIGHT AKA RESET
      transition('* => 0', [
    // Initial state of new route
    query(':enter',
        style({
        position: 'fixed',
        width: '100%',
        transform: 'translateX(-100%)'
        }), { optional: true }),
    // move page off screen right on leave
    query(':leave',
        animate('500ms ease',
        style({
            position: 'fixed',
            width: '100%',
            transform: 'translateX(100%)',
        })
        ), { optional: true }),
    // move page in screen from left to right
    query(':enter',
        animate('500ms ease',
        style({
            opacity: 1,
            transform: 'translateX(0%)'
        })
        ), { optional: true }),
    ]),
    // LEFT TO RIGHT AKA PREVIOUS
    transition('* => 1', [
    // Initial state of new route
    query(':enter',
        style({
        position: 'fixed',
        width: '100%',
        transform: 'translateX(-100%)'
        }), { optional: true }),
    // move page off screen right on leave
    query(':leave',
        animate('500ms ease',
        style({
            position: 'fixed',
            width: '100%',
            transform: 'translateX(100%)',
        })
        ), { optional: true }),
    // move page in screen from left to right
    query(':enter',
        animate('500ms ease',
        style({
            opacity: 1,
            transform: 'translateX(0%)'
        })
        ), { optional: true }),
    ]),
    // RIGHT TO LEFT AKA NEXT
    transition('* => 2', [
    // Initial state of new route
    query(':enter',
        style({
        position: 'fixed',
        width: '100%',
        transform: 'translateX(100%)'
        }), { optional: true }),
    // move page off screen right on leave
    query(':leave',
        animate('500ms ease',
        style({
            position: 'fixed',
            width: '100%',
            transform: 'translateX(-100%)',
        })
        ), { optional: true }),
    // move page in screen from left to right
    query(':enter',
        animate('500ms ease',
        style({
            opacity: 1,
            transform: 'translateX(0%)'
        })
        ), { optional: true }),
    ])
    
    ]);
   
}
  