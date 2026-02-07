import { OAuth2Client } from 'google-auth-library';
import { Request, Response, NextFunction } from 'express';

export interface GoogleAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes?: string[];
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    picture?: string;
    verified_email?: boolean;
}

export class GoogleAuth {
    private oauth2Client: OAuth2Client;
    private scopes: string[];

    constructor(config: GoogleAuthConfig) {
        if (!config.clientId || !config.clientSecret || !config.redirectUri) {
            throw new Error('clientId, clientSecret, and redirectUri are required');
        }

        this.oauth2Client = new OAuth2Client(
            config.clientId,
            config.clientSecret,
            config.redirectUri
        );

        this.scopes = config.scopes || [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];
    }

    /**
     * Generate authorization URL for Google OAuth
     */
    getAuthUrl(): string {
        const authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.scopes,
            prompt: 'consent',
        });
        return authUrl;
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokens(code: string) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            return tokens;
        } catch (error) {
            throw new Error(`Failed to get tokens: ${error}`);
        }
    }

    /**
     * Get user profile information
     */
    async getUserProfile(accessToken: string): Promise<UserProfile> {
        try {
            this.oauth2Client.setCredentials({ access_token: accessToken });
            const userInfoClient = this.oauth2Client;
            
            const response = await userInfoClient.request({
                url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
            });

            const data: any = response.data;
            return {
                id: data.id,
                email: data.email,
                name: data.name,
                picture: data.picture,
                verified_email: data.verified_email,
            };
        } catch (error) {
            throw new Error(`Failed to get user profile: ${error}`);
        }
    }

    /**
     * Verify ID token
     */
    async verifyIdToken(idToken: string) {
        try {
            const ticket = await this.oauth2Client.verifyIdToken({
                idToken,
                audience: this.oauth2Client._clientId,
            });
            return ticket.getPayload();
        } catch (error) {
            throw new Error(`Failed to verify ID token: ${error}`);
        }
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string) {
        try {
            this.oauth2Client.setCredentials({
                refresh_token: refreshToken,
            });
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            return credentials;
        } catch (error) {
            throw new Error(`Failed to refresh token: ${error}`);
        }
    }

    /**
     * Revoke token
     */
    async revokeToken(token: string) {
        try {
            await this.oauth2Client.revokeToken(token);
            return true;
        } catch (error) {
            throw new Error(`Failed to revoke token: ${error}`);
        }
    }

    /**
     * Express middleware to protect routes
     */
    middleware() {
        return async (req: Request, res: Response, next: NextFunction) => {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const idToken = authHeader.substring(7);

            try {
                const payload = await this.verifyIdToken(idToken);
                (req as any).user = payload;
                next();
            } catch (error) {
                return res.status(401).json({ error: 'Invalid token' });
            }
        };
    }
}

export default GoogleAuth;
