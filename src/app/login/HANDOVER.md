# Login Page Handover

The canonical login page no longer depends on `AuthContext`, client Supabase,
roles, local storage, or a client-controlled redirect. Email/password is the
primary path. Existing-user Google compatibility is shown only when the server
reports complete provider configuration plus the explicit compatibility flag.

Standalone browser acceptance covers `1440x900` and `390x844`, safe mocked
401/503 responses, malicious-next denial, loading suppression, and canonical
dashboard navigation intent. The password field intentionally precedes the
recovery link in keyboard order even though the link remains visually beside
the password label.
