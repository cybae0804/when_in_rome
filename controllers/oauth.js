const { googlePassport } = require('../config/passport-setup');

exports.login = googlePassport.authenticate('google', {
  scope: ['profile', 'email'],
});

exports.logout = (req, res) => {
  req.session = null;
  req.logout();
  res.redirect('/');
};

exports.redirect = googlePassport.authenticate('google', {
  failureRedirect: '/oauth/loginFailure',
  successRedirect: '/dashboard',
  session: true,
});

exports.getUser = (req, res) => {
  if(!req.user){
    return res.status(401).send('Unauthorized');
  }

  res.send({
    success: true,
    user: req.user,
  });
}
