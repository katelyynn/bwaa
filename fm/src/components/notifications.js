export function load_notifs() {
    if (!page.structure.notifications) {
        let notification_host = html.node`
            <div class="bwaa-notification-feed" />
        `;
        page.structure.notifications = notification_host;
        document.body.appendChild(notification_host);
    }
}

unsafeWindow._deliver_notif = function(content, dev_only=false, quick=true, persist=false) {
    deliver_notif(content, dev_only, quick, persist);
}
/**
 * deliver notification to the user
 * @param {string} content text content displayed to the user
 * @param {boolean} dev_only display only when developer mode is enabled
 * @param {boolean} quick only show for a short notice
 * @param {boolean} persist persist until user dismisses
 */
function deliver_notif(content, dev_only=false, quick=true, persist=false) {
    if (dev_only && !settings.developer)
        return;

    console.info('bwaa - notification sent', {
        content: content,
        dev_only: dev_only,
        quick: quick,
        persist: persist
    });

    let notif = document.createElement('button');
    notif.classList.add('bwaa-notification');
    notif.setAttribute('onclick', '_kill_notif(this)');
    notif.innerHTML = content;

    document.getElementById('bwaa-notifs').appendChild(notif);

    if (persist)
        return;

    let timeout_length = (quick) ? 2500 : 7000;

    setTimeout(function() {
        kill_notif(notif);
    }, timeout_length);
}

unsafeWindow._kill_notif = function(notif) {
    kill_notif(notif);
}
function kill_notif(notif) {
    notif.classList.add('fade-out');
    setTimeout(function() {
        document.getElementById('bwaa-notifs').removeChild(notif);
    }, 200);
}