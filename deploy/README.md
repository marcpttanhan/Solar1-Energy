# Local preview service

`solar1-preview.service` runs `.claude/serve.py` (static server with HTTP Range
support, needed for the background videos) on 127.0.0.1:8080 as a systemd user
service, restarting on failure and starting at boot.

Install on a new machine:

    mkdir -p ~/.config/systemd/user
    cp deploy/solar1-preview.service ~/.config/systemd/user/
    # edit WorkingDirectory/ExecStart if the project lives elsewhere
    systemctl --user daemon-reload
    systemctl --user enable --now solar1-preview.service
    loginctl enable-linger "$USER"   # start at boot without a login session

This is for local preview only; production is served by Vercel.
