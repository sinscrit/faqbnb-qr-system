# Password Reset Page Handover

This page expects a cookie recovery session established by `/auth/confirm`.
It shares the password policy with the server, updates through the recovery API,
and accepts only `/dashboard2` as a successful destination. Invalid sessions
collapse to one action: request another link.

Standalone desktop/mobile browser acceptance confirms client rule/mismatch
validation, the disabled loading state, one expired-link recovery action, and a
specific localized new-password document title. A real recovery cookie remains
a staging gate.
