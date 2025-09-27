import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  useStartGame,
  useDrawGame,
  useNextPrize,
  type GameStartResponse,
} from "../api/game";
import { toast } from "sonner";
import "./LotteryGame.css";

interface LotteryGameProps {
  gameId: number;
  onClose: () => void;
}

interface Winner {
  store_client_id: number;
  full_name: string;
  phone_number: string;
  total_bonuses: number;
}

interface Prize {
  id: number;
  name: string;
  type: "item" | "money";
  image: string;
}

export const LotteryGame: React.FC<LotteryGameProps> = ({
  gameId,
  onClose,
}) => {
  const { t } = useTranslation();
  const [gameData, setGameData] = useState<GameStartResponse | null>(null);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [drawnPrizes, setDrawnPrizes] = useState<number[]>([]);
  const [showWinner, setShowWinner] = useState(false);

  const startGameMutation = useStartGame();
  const drawGameMutation = useDrawGame();
  const nextPrizeMutation = useNextPrize();

  const handleStartGame = async () => {
    try {
      const response = await startGameMutation.mutateAsync(gameId);
      setGameData(response);
      setCurrentPrize(response.current_prize);
      setGameStarted(true);
      toast.success(t("messages.success.game_created"));
    } catch {
      toast.error(t("messages.error.create_game"));
    }
  };

  const handleDrawWinner = async () => {
    if (!currentPrize) return;

    setIsDrawing(true);

    // Add delay for animation effect
    setTimeout(async () => {
      try {
        const response = await drawGameMutation.mutateAsync(gameId);
        setWinner(response.winner);
        setCurrentPrize(response.current_prize);
        setDrawnPrizes((prev) => [...prev, currentPrize.id]);
        setShowWinner(true);
        setIsDrawing(false);
      } catch {
        toast.error(t("messages.error.delete"));
        setIsDrawing(false);
      }
    }, 3000); // 3 second animation
  };

  const handleNextPrize = async () => {
    try {
      const response = await nextPrizeMutation.mutateAsync(gameId);
      setCurrentPrize(response.current_prize);
      setWinner(null);
      setShowWinner(false);
    } catch {
      toast.error(t("messages.error.update"));
    }
  };

  const getRemainingPrizes = () => {
    if (!gameData) return [];
    return gameData.game.prizes.filter(
      (prize: {
        id: number;
        name: string;
        type: "item" | "money";
        quantity: number;
        ordering: number;
        image: string;
      }) => !drawnPrizes.includes(prize.id),
    );
  };

  const isGameComplete = () => {
    return gameData ? drawnPrizes.length >= gameData.game.prizes.length : false;
  };

  // Confetti particles for winner celebration
  const confettiParticles = Array.from({ length: 30 }, (_, i) => (
    <div
      key={i}
      className="lottery-confetti"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        backgroundColor: [
          "#f39c12",
          "#e74c3c",
          "#9b59b6",
          "#3498db",
          "#2ecc71",
        ][Math.floor(Math.random() * 5)],
      }}
    />
  ));

  if (!gameStarted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="text-6xl mb-4">🎰</div>
          <h2 className="text-2xl font-bold mb-4">
            {t("lottery.start_lottery_game")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("lottery.ready_to_begin")} "{gameData?.game?.name || "this game"}
            "?
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              {t("buttons.cancel")}
            </button>
            <button
              onClick={handleStartGame}
              disabled={startGameMutation.isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 lottery-button"
            >
              {startGameMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 lottery-loading-spinner"></div>
                  Starting...
                </div>
              ) : (
                t("lottery.start_game")
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 lottery-gradient-bg flex items-center justify-center z-50">
      {/* Floating particles background */}
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="lottery-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
          }}
        />
      ))}

      {/* Confetti for winner celebration */}
      {showWinner && confettiParticles}

      <div className="max-w-4xl w-full mx-4 h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center py-6"
        >
          <h1 className="text-4xl font-bold text-white mb-2 lottery-shimmer">
            🎰 {gameData?.game.name}
          </h1>
          <p className="text-purple-200">
            🎯 Participants: {gameData?.participating_clients_count}
          </p>
        </motion.div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border border-white border-opacity-20">
            {/* Current Prize Display */}
            <motion.div
              key={currentPrize?.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={isDrawing ? { rotate: 360 } : {}}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className={`mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-4 shadow-2xl ${isDrawing ? "lottery-prize-glow" : ""}`}
                >
                  {currentPrize && (
                    <img
                      src={currentPrize.image}
                      alt={currentPrize.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </motion.div>

                {isDrawing && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 border-4 border-dashed border-white rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-2 border-2 border-dotted border-yellow-300 rounded-full"
                    />
                  </>
                )}
              </div>

              {currentPrize && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4"
                >
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {currentPrize.name}
                  </h3>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      currentPrize.type === "money"
                        ? "prize-money"
                        : "prize-item"
                    } text-white shadow-lg`}
                  >
                    {currentPrize.type === "money"
                      ? "💰 Money Prize"
                      : "🎁 Item Prize"}
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Winner Display */}
            <AnimatePresence>
              {showWinner && winner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -50 }}
                  className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 mb-6 text-center lottery-winner-reveal border-2 border-white border-opacity-30"
                >
                  <div className="text-white">
                    <div className="text-4xl mb-2">🎉</div>
                    <h2 className="text-2xl font-bold mb-2">
                      Congratulations!
                    </h2>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-2">
                      <p className="text-xl font-semibold">
                        {winner.full_name}
                      </p>
                      <p className="opacity-90">{winner.phone_number}</p>
                    </div>
                    <p className="text-sm">
                      💎 Total Bonuses: {winner.total_bonuses}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drawing State Display */}
            {isDrawing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-6"
              >
                <div className="text-white text-lg font-semibold mb-2">
                  {t("lottery.drawing_winner")}
                </div>
                <div className="w-16 h-16 mx-auto lottery-loading-spinner"></div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              {!showWinner && !isDrawing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDrawWinner}
                  disabled={isDrawing || isGameComplete()}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed lottery-button"
                >
                  {t("lottery.draw_winner")}
                </motion.button>
              )}

              {showWinner && !isGameComplete() && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextPrize}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all lottery-button"
                >
                  ➡️ {t("lottery.next_prize")}
                </motion.button>
              )}

              {isGameComplete() && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all lottery-button"
                >
                  🏁 Game Complete
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center py-6"
        >
          <div className="flex justify-center items-center gap-6 text-white">
            <motion.div
              className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-semibold">
                🎁 Prizes Left: {getRemainingPrizes().length}
              </span>
            </motion.div>
            <motion.div
              className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-semibold">
                ✅ Drawn: {drawnPrizes.length}
              </span>
            </motion.div>
            <motion.div
              className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-semibold">
                👥 Total: {gameData?.game.prizes.length || 0}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all text-xl font-bold backdrop-blur-sm"
        >
          {t("lottery.close")}
        </motion.button>
      </div>
    </div>
  );
};
