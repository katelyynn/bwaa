//
// bleh, an extension for the music site Last.fm
// Copyright (c) 2025 katelyn and contributors
// Licensed under GPLv3
//

import {patch_avatar, return_name_from_avatar} from "../avatar";
import {log} from "../build/log";
import {page} from "../build/page";
import {sanitise} from "../build/tools";
import {checkup_page_structure} from "../components/structure";
import {update_page} from "../page";
import {bleh_notification_list} from "../components/notifications.js";

export function bleh_inbox() {
    page.structure.container = document.body.querySelector('.page-content');
    try {
        page.structure.row = page.structure.container.querySelector('.row');
        page.structure.main = page.structure.row.querySelector('.col-main');
        page.structure.side = page.structure.row.querySelector('.col-sidebar');
    } catch(e) {
        log('unable to find elements', 'page structure');
    }

    let content_top = document.body.querySelector('.content-top');


    checkup_page_structure(false, content_top);
    log('status is', 'page', 'info', page);
    update_page();


    if (page.subpage == 'notifications') {
        let form = page.structure.container.querySelector('form');
        let notifications = page.structure.container.querySelector('.inbox-notifications');
        let pagination = page.structure.container.querySelector('.pagination');

        let panel = document.createElement('section');
        panel.classList.add('inbox-panel', 'notifications-panel');

        if (form)
            panel.appendChild(form);

        if (notifications)
            panel.appendChild(notifications);

        if (pagination)
            panel.appendChild(pagination);

        page.structure.main.appendChild(panel);


        if (!notifications) return;

        bleh_notification_list(notifications);

        return;

        let notif_links = notifications.querySelectorAll('.inbox-notifications__item-link');

        notif_links.forEach((notification) => {
            let link = notification.getAttribute('href');
            if (link.endsWith('/obsessions/set') || link.endsWith('/listening-report/month')) return;

            let avatar = notification.querySelector('.avatar');
            let name = notification.querySelector('.inbox-notifications__item-description strong');
            if (!name) return;

            let name_text = sanitise(return_name_from_avatar(avatar.querySelector('img')));

            let badge = patch_avatar(avatar, name_text);
            name.classList.add('notification-user-name', `user-status--bleh-${badge.type}`, `user-status--bleh-user-${name_text}`);

            if (notification.classList.contains('inbox-notifications__item--highlight'))
                notification.classList.add('notification-user-name', `user-status--bleh-${badge.type}`, `user-status--bleh-user-${name_text}`);
        });
    } else if (page.subpage == 'message_overview' || page.subpage == 'sent_message') {
        let inbox = page.structure.container.querySelector('.inbox-message-view');
        page.structure.main.appendChild(inbox);


        let sender_panel = inbox.querySelector('.inbox-message-sender-avatar');
        let sender_name = inbox.querySelector('.inbox-message-sender-name');
        let sender_time = inbox.querySelector('.inbox-message-timestamp');

        sender_panel.appendChild(sender_name);
        sender_panel.appendChild(sender_time);

        let avatar = sender_panel.querySelector('.avatar');
        let name_text = sanitise(sender_name.textContent.trim());
        let badge = patch_avatar(avatar, name_text);

        sender_panel.classList.add(`user-status--bleh-${badge.type}`, `user-status--bleh-user-${name_text}`);
    } else if (page.subpage == 'compose') {
        let inbox = page.structure.container.querySelector('.inbox-compose-view');
        page.structure.main.appendChild(inbox);
    } else {
        let inbox = page.structure.container.querySelector('.inbox');
        page.structure.main.appendChild(inbox);
    }
}
