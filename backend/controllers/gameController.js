import Game from "../models/Game.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";

// GET all games
export const getAllGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD new game
export const addGame = async (req, res) => {
  try {
    const { title, description, price, image, stock, rating } = req.body;

    const newGame = new Game({
      title,
      description,
      price,
      image,
      stock,
      rating,
      createdBy: req.user._id,
    });

    const saved = await newGame.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan game" });
  }
};

// UPDATE game
export const updateGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Game tidak ditemukan" });

    if (game.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Tidak punya akses edit game" });
    }

    Object.assign(game, req.body);
    res.json(await game.save());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE game
export const deleteGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Game tidak ditemukan" });

    if (game.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Tidak bisa menghapus game milik admin lain" });
    }

    await game.deleteOne();
    res.json({ message: "Game berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus game" });
  }
};

// GET game by ID
export const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate("createdBy", "username");
    if (!game) return res.status(404).json({ message: "Game tidak ditemukan" });
    res.json(game);
  } catch {
    res.status(500).json({ message: "Gagal mengambil game" });
  }
};

// GET related games
export const getRelatedGames = async (req, res) => {
  try {
    const current = await Game.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Game tidak ditemukan" });

    const related = await Game.find({ _id: { $ne: current._id } })
      .sort({ rating: -1 })
      .limit(4);

    res.json(related);
  } catch {
    res.status(500).json({ message: "Gagal mengambil game terkait" });
  }
};

// GET reviews
export const getReviews = async (req, res) => {
  try {
    const rev = await Review.find({ game: req.params.id }).populate("user", "username");
    res.json(rev);
  } catch {
    res.status(500).json({ message: "Gagal mengambil review" });
  }
};

// ADD review
export const addReview = async (req, res) => {
  try {
    const hasBought = await Order.findOne({
      user: req.user._id,
      "items.game": req.params.id,
      status: "received",
    });

    if (!hasBought) {
      return res
        .status(403)
        .json({ message: "Kamu harus membeli dan menerima pesanan untuk review." });
    }

    const rev = await Review.create({
      game: req.params.id,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json(rev);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah review" });
  }
};