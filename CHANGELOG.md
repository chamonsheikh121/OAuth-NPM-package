# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-02-07

### Added
- Initial release of @chamonali/google-auth
- Google OAuth 2.0 authentication support
- User profile retrieval
- Token management (access, refresh, revoke)
- Express middleware for protected routes
- TypeScript support with full type definitions
- Comprehensive documentation in Bangla and English
- Example implementations (TypeScript and JavaScript)
- Session management examples

### Features
- `getAuthUrl()` - Generate Google OAuth authorization URL
- `getTokens()` - Exchange authorization code for tokens
- `getUserProfile()` - Retrieve user profile information
- `verifyIdToken()` - Verify Google ID tokens
- `refreshAccessToken()` - Refresh expired access tokens
- `revokeToken()` - Revoke tokens (logout)
- `middleware()` - Express middleware for route protection

### Documentation
- Complete README with usage examples
- Setup guide with Google Cloud Console instructions
- TypeScript and JavaScript examples
- Security best practices
