const renderDashboard = (req, res) => {
  const account = req.session.account;
  res.render('dashboard', { username: account.username });
};

module.exports = {
  renderDashboard,
};
