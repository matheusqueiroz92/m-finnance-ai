import express from 'express';
import passport from 'passport';
import { container } from '../config/container';
import { ApiResponse } from '../utils/ApiResponse';
import { setupPassport } from '../config/passport';

const router = express.Router();
const passportConfig = setupPassport();

// Rota para iniciar autenticação Google
router.get('/google', passportConfig.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// Callback para autenticação Google
router.get('/google/callback', 
  passportConfig.authenticate('google', { session: false }),
  (req, res) => {
    const { user, token } = req.user as { user: any, token: string };
    
    // Redirecionar para frontend com token
    res.redirect(`${process.env.FRONTEND_URL}/auth/social-callback?token=${token}`);
  }
);

// Rota para iniciar autenticação Facebook
router.get('/facebook', passportConfig.authenticate('facebook', {
  scope: ['email', 'public_profile']
}));

// Callback para autenticação Facebook
router.get('/facebook/callback',
  passportConfig.authenticate('facebook', { session: false }),
  (req, res) => {
    const { user, token } = req.user as { user: any, token: string };
    
    // Redirecionar para frontend com token
    res.redirect(`${process.env.FRONTEND_URL}/auth/social-callback?token=${token}`);
  }
);

// Rota para iniciar autenticação GitHub
router.get('/github', passportConfig.authenticate('github'));

// Callback para autenticação GitHub
router.get('/github/callback',
  passportConfig.authenticate('github', { session: false }),
  (req, res) => {
    const { user, token } = req.user as { user: any, token: string };
    
    // Redirecionar para frontend com token
    res.redirect(`${process.env.FRONTEND_URL}/auth/social-callback?token=${token}`);
  }
);

export default router;