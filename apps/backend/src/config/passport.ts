import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { container } from './container';
import { IUserService } from '../interfaces/services/IUserService';
import { ISocialProfile } from '../interfaces/entities/IAuth';

// Carregar configurações do ambiente
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.APP_URL || 'http://localhost:3001';

export const setupPassport = () => {
  const userService = container.resolve<IUserService>('UserService');

  // Função para processar perfil social
  const processProfile = async (profile: ISocialProfile, done: any) => {
    try {
      const email = profile.emails?.[0]?.value;
      
      if (!email) {
        return done(new Error('Email não disponível pelo provedor social'), null);
      }
      
      const result = await userService.loginWithSocialProvider({
        id: profile.id,
        provider: profile.provider as 'google' | 'facebook' | 'Github',
        email,
        name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
        photo: profile.photos?.[0]?.value,
      });
      
      return done(null, result);
    } catch (error) {
      return done(error, null);
    }
  };

  // Configurar Google Strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${CALLBACK_URL}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    }, (accessToken, refreshToken, profile, done) => processProfile(profile as unknown as ISocialProfile, done)));
  }

  // Configurar Facebook Strategy
  if (FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: `${CALLBACK_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    }, (accessToken, refreshToken, profile, done) => processProfile(profile as unknown as ISocialProfile, done)));
  }

  // Configurar Github Strategy
  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${CALLBACK_URL}/api/auth/github/callback`,
      scope: ['user:email'] // Para garantir acesso ao email
    }, (accessToken: any, refreshToken: any, profile: { id: any; emails: any; photos: any; displayName: any; username: any; }, done: any) => {
      // Adaptação do formato do perfil do GitHub para seu padrão comum
      const adaptedProfile: ISocialProfile = {
        id: profile.id,
        provider: 'github' as any,
        emails: profile.emails,
        photos: profile.photos,
        displayName: profile.displayName || profile.username || '',
      };
      
      processProfile(adaptedProfile, done);
    }));
  }

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });

  return passport;
};