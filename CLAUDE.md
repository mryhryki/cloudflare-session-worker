# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Full check**: `npm run check` - Runs lint, type check, and tests
- **Linting**: `npm run lint` - Run Biome linter and formatter checks
- **Format code**: `npm run fmt` - Auto-format code with Biome
- **Type checking**: `npm run type` - Run TypeScript compiler checks
- **Testing**: `npm run test` - Run all tests with Vitest
- **Watch mode**: `npm run test:watch` - Run tests in watch mode
- **Type watch**: `npm run type:watch` - Run TypeScript in watch mode

## Project Architecture

This is a TypeScript library for Cloudflare Workers that provides OIDC authentication and session management.

### Core Architecture

The main entry point is `requireAuth()` function in `src/index.ts` which acts as middleware that:
1. Routes authentication-related requests (`/session*` paths) to specialized handlers
2. Protects application routes by checking session state
3. Redirects unauthenticated users to login flow

### Session Management Flow

**Session Storage**: Uses Cloudflare KV for persistent session storage with cookie-based session IDs.

**Session States**:
- `not-logged-in`: Stores PKCE code verifier and return URL for OAuth flow
- `logged-in`: Stores JWT ID token and decoded user information

**Session Lifecycle**:
- Sessions have both absolute expiration (`maxLifetimeSec`) and idle timeout (`idleLifetimeSec`)
- Session data is automatically renewed on each request when user is logged in

### OIDC Authentication Flow

**Reserved Paths** (all under `/session*`):
- `/session/login` - Initiates OIDC login with PKCE
- `/session/callback` - Handles OIDC callback, validates tokens
- `/session/logout` - Handles logout and optional provider logout

**Key Components**:
- `src/lib/oidc/` - OIDC protocol implementation
- `src/lib/session_store/` - Session storage abstraction over KV + cookies
- `src/handlers/` - Route handlers for login/callback/logout/default flows

### Configuration Structure

**OIDC Config** (`OidcParams`):
- `clientId`, `clientSecret` - OAuth client credentials  
- `baseUrl` - Provider's base URL (e.g., Cognito user pool)
- `postLogoutRedirectUri` - Where to redirect after logout

**Session Config** (`SessionConfiguration`):
- `fallbackPath` - Default redirect when no return URL specified
- `cookieName` - Session cookie name
- `maxLifetimeSec` - Absolute session lifetime
- `idleLifetimeSec` - Session idle timeout

### Testing and Code Quality

- **Test Framework**: Vitest with tests co-located in `src/` directory
- **Linting**: Biome for formatting and linting (not ESLint/Prettier)
- **Type Safety**: Strict TypeScript with Zod schemas for runtime validation
- **File Extensions**: Uses `.ts` extensions in imports (required for compatibility)