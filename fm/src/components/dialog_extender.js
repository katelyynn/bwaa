//
// bwaa, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import { page, root } from '../build/page.js';
import { tl, trans } from '../build/trans.js';
import { html, render } from 'lighterhtml';
import { toggle } from './toggle.js';
import { log } from '../build/log.js';
import { correct_artist, correct_item_by_artist } from './lotus.js';

export function dialog_extender() {
    log('dialog extender', 'loop');
    // data-processed=true is signature of bulk edit
    let wrappers = document.body.querySelectorAll(
        ':scope > .popup_wrapper, :scope > div > .popup_wrapper'
    );

    wrappers.forEach((wrapper) => {
        let modal_dialog = wrapper.querySelector(
            '.modal-dialog:not([data-dialog-extender])'
        );
        if (!modal_dialog) return;

        modal_dialog.setAttribute('data-dialog-extender', 'true');

        let body = modal_dialog.querySelector('.modal-body');
        let title = body.querySelector('.modal-title');

        let contents = body.querySelector(':scope > div');

        let form = contents.querySelector('form');
        if (!form) return;

        let dismiss = modal_dialog.querySelector('.modal-dismiss');

        let token = form.querySelector('[name="csrfmiddlewaretoken"]');
        if (token) page.token = token.getAttribute('value');

        const content_form = body.querySelector('.content-form');
        if (content_form) {
            content_form.classList.remove('content-form');
            content_form.classList.add('settings-form');
        }

        if (body.classList.contains('automatic-edit-modal-body-v2')) {
            // automatic edit v2


        }
    });
}
