# Login Page Handover

The canonical login page no longer depends on `AuthContext`, client Supabase,
roles, local storage, or a client-controlled redirect. Email/password is the
primary path. Existing-user Google compatibility is shown only when the server
reports complete provider configuration plus the explicit compatibility flag.
