# Password Reset Page Handover

This page expects a cookie recovery session established by `/auth/confirm`.
It shares the password policy with the server, updates through the recovery API,
and accepts only `/dashboard2` as a successful destination. Invalid sessions
collapse to one action: request another link.
