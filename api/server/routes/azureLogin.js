const express = require('express');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const bp = require("body-parser");
router.use(bp.urlencoded({ extended : true }));
// WARNING!
// THIS IS NOT A READY TO USE USER SYSTEM
// PLEASE IMPLEMENT YOUR OWN USER SYSTEM

// const userSystemEnabled = process.env.ENABLE_USER_SYSTEM || false;
const azureADTenantId = process.env.AZURE_AD_TENANT_ID || null;
const azureADCliendId = process.env.AZURE_AD_CLIENT_ID || null;
const azureADClientSecret = process.env.AZURE_AD_CLIENT_SECRET || null;
const websiteHostName = process.env.WEBSITE_HOSTNAME || "localhost:3080";
const azureADCallbackUrl = process.env.AZURE_AD_CALLBACK_URL ||  `http://${websiteHostName}/auth/azuread/openid/return`;

const config = {
  identityMetadata: `https://login.microsoftonline.com/${azureADTenantId}/v2.0/.well-known/openid-configuration`,
  clientID: azureADCliendId,
  responseType: 'code id_token',
  responseMode: 'form_post',
  redirectUrl: azureADCallbackUrl,
  allowHttpForRedirectUrl: true,
  clientSecret: azureADClientSecret,
  validateIssuer: false,
  passReqToCallback: false,
  scope: ['profile', 'offline_access', 'email'],
  loggingLevel: 'debug',
};

passport.use(new OIDCStrategy(config,
  (iss, sub, profile, accessToken, refreshToken, done) => {
    const user = {
      displayName: profile.displayName,
      username: profile.upn,
    };
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure express-session
router.use(session({
  secret: 'chatgpt-clone-random-secrect',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

router.use(passport.initialize());
router.use(passport.session());

//Create /auth/openid/return endpoint to get token from Azure AD authentication
router.post('/openid/return', passport.authenticate('azuread-openidconnect', { failureRedirect: '/login' }), (req, res) => {
  req.session.user = {
    display: req.user.displayName,
    username: req.user.username,
  };
  res.redirect('/');
});


// Logout
// Logout endpoint
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
  
    // Your custom callback logic here
    console.log('User logged out successfully');
      
    res.redirect('/');
  });
});

// Login endpoint
router.get('/', passport.authenticate('azuread-openidconnect', { failureRedirect: '/login' }), (req, res) => {
  req.session.user = {
    display: req.user.displayName,
    username: req.user.username,
  };
  res.redirect('/');
});

module.exports = router;
