const checkBanned = (req, res, next) => {
  if (req.user?.isBanned) {
    return res.status(403).json({
      message: "Akun kamu diblokir",
    });
  }
  next();
};

export default checkBanned;
