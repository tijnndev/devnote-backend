# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of DevNote Backend seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please DO NOT:

- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please DO:

1. **Report via GitHub Security Advisories** (preferred method):
   - Go to the Security tab
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Report via email**:
   - Send details to: [tijnnotkamp@gmail.com]
   - Include "SECURITY" in the subject line

### What to Include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (optional)
- Your name/handle for acknowledgment (optional)

### What to Expect:

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### Disclosure Policy:

- We will acknowledge your report within 48 hours
- We will provide a detailed response within 5 business days
- We will keep you informed about our progress
- Once the issue is resolved, we will publicly disclose it (with your permission)
- We will credit you in the security advisory (if you wish)

## Security Best Practices

When deploying DevNote Backend:

### 1. API Key Security
- Use strong, randomly generated API keys (32+ characters)
- Never commit API keys to version control
- Rotate API keys regularly
- Use different keys for different environments

### 2. Database Security
- Use strong database passwords
- Restrict database access to necessary IPs only
- Enable SSL/TLS for database connections
- Regular backups with encryption

### 3. Environment Variables
- Never commit `.env` files
- Use secrets management in production (AWS Secrets Manager, Azure Key Vault, etc.)
- Validate all environment variables on startup

### 4. HTTPS/TLS
- Always use HTTPS in production
- Use valid SSL/TLS certificates
- Enable HSTS (HTTP Strict Transport Security)
- Configure secure cipher suites

### 5. Dependencies
- Regularly update dependencies: `npm audit fix`
- Monitor for security advisories
- Use `npm audit` in CI/CD pipeline
- Consider using automated tools like Dependabot

### 6. Access Control
- Implement rate limiting
- Use IP whitelisting where appropriate
- Monitor for unusual access patterns
- Implement request logging

### 7. Data Protection
- Encrypt sensitive data at rest
- Use secure session management
- Implement proper CORS policies
- Sanitize user inputs

### 8. Monitoring
- Set up logging and monitoring
- Alert on suspicious activities
- Regular security audits
- Implement intrusion detection

## Known Security Considerations

### API Key Authentication
- Current implementation uses simple API key validation
- Consider implementing JWT tokens for production
- Add token expiration and refresh mechanisms
- Implement rate limiting per API key

### Database Access
- Use connection pooling properly
- Implement query timeouts
- Protect against SQL injection (Prisma provides protection)
- Regular security audits of database queries

### CORS Configuration
- In development, CORS is set to allow all origins
- In production, configure specific allowed origins
- Review CORS settings regularly

## Security Updates

Security updates will be released as:
- Patch versions for minor security issues
- Minor versions for moderate security issues
- Major versions for breaking security changes

Subscribe to:
- GitHub Security Advisories
- Repository releases
- Repository watch (security alerts only)

## Acknowledgments

We appreciate the security research community's efforts to improve the security of DevNote. Security researchers who responsibly disclose vulnerabilities will be acknowledged in:

- Security advisories
- Release notes
- Hall of fame (if we create one)

Thank you for helping keep DevNote and its users safe!

## Contact

For security-related questions or concerns:
- GitHub Security Advisories: [Preferred]
- Email: [tijnnotkamp@gmail.com]

For general questions, please use GitHub Discussions or Issues.
