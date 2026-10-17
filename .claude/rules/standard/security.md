# Security

Before any commit: no hardcoded secrets (use env vars or a secret manager, gitignored), user input
validated, queries parameterized, HTML output sanitized, auth checked on every endpoint and Firestore
rule, error messages that leak nothing sensitive. Never commit confidential or personal data to a
public repo (TMV-Web and personal-lessons are public).

If a security issue is found: stop, run the security-reviewer agent, fix critical issues before
continuing, rotate any exposed secret, and check the codebase for the same pattern.
