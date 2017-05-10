// Renders a page with common options
const renderPage = (req, res, page, options) => {
  const opt = options || {};
  const account = req.session.account;

  if (account) {
    opt.account = {
      username: account.username,
      id: account._id,
      githubName: account.githubName,
      githubToken: account.githubToken,
    };
  }

  return res.render(page, opt);
};

module.exports = {
  renderPage,
};
