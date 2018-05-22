const routes = require('next-routes')();

routes
  .add('/', '/index')
  .add('/results', '/results')
  .add('/thankyou', '/thankyou');

module.exports = routes;
