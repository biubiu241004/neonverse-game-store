import Game from "../models/Game.js";

// GET all games
export const getAllGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    console.error(error);
    res.status(500).json({ message: err.message });
  }
};

// POST new game
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
      createdBy: req.user._id, // 🆕 Admin pembuat
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menambahkan game" });
  }
};

export const updateGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game tidak ditemukan" });
    }

    // hanya admin pemilik game yang boleh edit
    if (game.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Tidak punya akses edit game ini" });
    }

    game.title = req.body.title || game.title;
    game.description = req.body.description || game.description;
    game.price = req.body.price || game.price;
    game.stock = req.body.stock || game.stock;
    game.rating = req.body.rating || game.rating;
    game.image = req.body.image || game.image;

    const updatedGame = await game.save();

    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game tidak ditemukan" });
    }

    // 🧠 Cek apakah admin yang hapus adalah pembuatnya
    if (game.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Tidak bisa menghapus game milik admin lain" });
    }

    await game.deleteOne();
    res.json({ message: "Game berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus game" });
  }
};
