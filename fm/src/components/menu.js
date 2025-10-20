//
// bleh, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { html } from 'lighterhtml';
import tippy from 'tippy.js';
import { tl, trans } from '../build/trans';
import { ff } from '../sku';
import { log } from '../build/log';

export function register_menu(element, menu) {
    element.setAttribute('data-has-bleh-menu', true);

    element.addEventListener(
        'contextmenu',
        (e) => {
            e.preventDefault();
            log('requested', 'menu', 'info', { e });

            menu.setProps({
                placement: 'right-start',
                offset: [0, 0],
                getReferenceClientRect: () => ({
                    width: 0,
                    height: 0,
                    top: e.clientY,
                    bottom: e.clientY,
                    left: e.clientX,
                    right: e.clientX
                })
            });

            menu.show();
        },
        true
    );
}

export function page_menu() {
    if (!ff('menus')) return;

    const menu = tippy(document.body, {
        theme: 'context-menu',
        placement: 'right-start',
        trigger: 'manual',
        interactive: true,
        interactiveBorder: 10,
        offset: [0, 0],
        appendTo: document.body,

        onShow(instance) {
            instance.popper.addEventListener('click', (event) => {
                instance.hide();
            });
        }
    });

    document.addEventListener('contextmenu', (e) => {
        if (!show_menu(e)) return;

        e.preventDefault();

        const elem = e.target;
        const is_image = elem.tagName == 'IMG';
        const has_link = elem.href;

        const contents = html.node`
            ${
                is_image ?
                    html.node`
                        <button class="dropdown-menu-clickable-item" data-type="image" onclick=${() => {
                            open(elem.src, '_blank');
                        }}>
                            ${tl(trans.view_image)}
                        </button>
                    `
                :   ''
            }
            ${
                has_link ?
                    html.node`
                        <a class="dropdown-menu-clickable-item" data-type="link" href=${elem.href} target=${elem.target}>
                            ${tl(trans.open)}
                        </a>
                    `
                :   ''
            }
        `;

        if (
            ![...contents.childNodes].some(
                (node) => node.nodeType == Node.ELEMENT_NODE
            )
        )
            return;

        menu.setProps({
            getReferenceClientRect: () => ({
                width: 0,
                height: 0,
                top: e.clientY,
                bottom: e.clientY,
                left: e.clientX,
                right: e.clientX
            })
        });

        menu.setContent(contents);

        menu.show();
    });
}

function show_menu(e) {
    const target = e.target;
    console.info('menu target', target);

    if (target.closest('[data-has-bleh-menu]')) return false;

    return true;
}
