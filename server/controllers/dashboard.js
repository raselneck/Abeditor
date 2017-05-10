const shared = require('./shared.js');

// Renders a user's dashboard
const renderDashboard = (req, res) => {
  shared.renderPage(req, res, 'dashboard', { room: res.room });
};

module.exports = {
  renderDashboard,
};
