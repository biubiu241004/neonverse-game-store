import Game from "../models/Game.js";

// GET all games
export const getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST new game
export const createGame = async (req, res) => {
  try {
    const game = new Game({
      ...req.body,
      owner: req.user._id, // simpan admin yang buat
    });
    const savedGame = await game.save();
    res.status(201).json(savedGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
