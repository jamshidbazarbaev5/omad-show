import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Play,
  Trophy,
  Gift,
  Coins,
  Crown,
  Star,
  Gem,
  Sparkles,
} from "lucide-react";

// Mock data for testing
const mockGames = [
  {
    id: 1,
    name: "🎉 Grand Prize Extravaganza",
    participating_clients_count: 156,
    prizes: [
      {
        id: 1,
        name: "MacBook Pro",
        type: "item" as const,
        ordering: 1,
        image:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      },
      {
        id: 2,
        name: "$1000 Cash",
        type: "money" as const,
        ordering: 2,
        image:
          "https://images.unsplash.com/photo-1554672723-d42a16e533db?w=400",
      },
      {
        id: 3,
        name: "iPhone 15",
        type: "item" as const,
        ordering: 3,
        image:
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
      },
      {
        id: 4,
        name: "Gaming Chair",
        type: "item" as const,
        ordering: 5,
        image:
          "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400",
      },
    ],
  },
  {
    id: 2,
    name: "🎮 Tech Bonanza",
    participating_clients_count: 89,
    prizes: [
      {
        id: 5,
        name: "Gaming Setup",
        type: "item" as const,
        ordering: 2,
        image:
          "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=400",
      },
      {
        id: 6,
        name: "$500 Bonus",
        type: "money" as const,
        ordering: 4,
        image:
          "https://images.unsplash.com/photo-1554672723-d42a16e533db?w=400",
      },
    ],
  },
];

const mockWinners = [
  {
    full_name: "Ahmad Karimov",
    phone_number: "+998901234567",
    total_bonuses: 1250,
  },
  {
    full_name: "Malika Usmanova",
    phone_number: "+998907654321",
    total_bonuses: 890,
  },
  {
    full_name: "Davron Toshmatov",
    phone_number: "+998909876543",
    total_bonuses: 2100,
  },
];

// Get prize theme based on rarity
const getPrizeTheme = (ordering: number, t: (key: string) => string) => {
  if (ordering <= 2) {
    return {
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      cardBorder: "border-yellow-400",
      textColor: "text-yellow-300",
      icon: <Crown className="h-6 w-6" />,
      rarity: t("lottery.rarity.legendary"),
      rarityColor: "text-yellow-400",
    };
  } else if (ordering <= 4) {
    return {
      gradient: "from-purple-400 via-pink-500 to-purple-600",
      cardBorder: "border-purple-400",
      textColor: "text-purple-300",
      icon: <Gem className="h-6 w-6" />,
      rarity: t("lottery.rarity.epic"),
      rarityColor: "text-purple-400",
    };
  } else {
    return {
      gradient: "from-blue-400 via-cyan-500 to-blue-600",
      cardBorder: "border-blue-400",
      textColor: "text-blue-300",
      icon: <Star className="h-6 w-6" />,
      rarity: t("lottery.rarity.rare"),
      rarityColor: "text-blue-400",
    };
  }
};

export default function LotteryDemo() {
  const { t } = useTranslation();
  const [selectedGame, setSelectedGame] = useState<
    (typeof mockGames)[0] | null
  >(null);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [winner, setWinner] = useState<(typeof mockWinners)[0] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleStartGame = (game: (typeof mockGames)[0]) => {
    setSelectedGame(game);
    setCurrentPrizeIndex(0);
    setWinner(null);
    setIsDrawing(false);
  };

  const handleDraw = () => {
    setIsDrawing(true);
    setTimeout(() => {
      const randomWinner =
        mockWinners[Math.floor(Math.random() * mockWinners.length)];
      setWinner(randomWinner);
      setIsDrawing(false);
    }, 3000);
  };

  const handleNext = () => {
    setWinner(null);
    if (selectedGame && currentPrizeIndex < selectedGame.prizes.length - 1) {
      setCurrentPrizeIndex(currentPrizeIndex + 1);
    } else {
      // Game over
      setSelectedGame(null);
      setCurrentPrizeIndex(0);
    }
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
    setCurrentPrizeIndex(0);
    setWinner(null);
    setIsDrawing(false);
  };

  if (selectedGame) {
    const currentPrize = selectedGame.prizes[currentPrizeIndex];
    const prizeTheme = getPrizeTheme(currentPrize.ordering, t);
    const isGameOver = currentPrizeIndex >= selectedGame.prizes.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-8">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-xl opacity-10"
              style={{
                width: Math.random() * 100 + 30,
                height: Math.random() * 100 + 30,
                background: `radial-gradient(circle, ${["#fbbf24", "#8b5cf6", "#06b6d4"][Math.floor(Math.random() * 3)]}, transparent)`,
              }}
              initial={{
                x:
                  Math.random() *
                  (typeof window !== "undefined" ? window.innerWidth : 1200),
                y:
                  Math.random() *
                  (typeof window !== "undefined" ? window.innerHeight : 800),
              }}
              animate={{
                x:
                  Math.random() *
                  (typeof window !== "undefined" ? window.innerWidth : 1200),
                y:
                  Math.random() *
                  (typeof window !== "undefined" ? window.innerHeight : 800),
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <Button
            onClick={handleBackToGames}
            className="absolute -top-16 left-0 text-white border-white/30 hover:bg-white/10 backdrop-blur-sm bg-white/5"
            variant="outline"
          >
            ← {t("lottery.back_to_games")}
          </Button>

          <motion.h1
            className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {selectedGame.name}
          </motion.h1>

          <motion.p
            className="text-xl text-cyan-300 mb-8 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {selectedGame.participating_clients_count}{" "}
            {t("lottery.players_ready")}
            <Sparkles className="ml-2 h-5 w-5" />
          </motion.p>

          {isGameOver ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg border-2 border-purple-400">
                <CardHeader>
                  <CardTitle className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    {t("lottery.game_complete")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl text-purple-200 mb-6">
                    {t("lottery.game_complete_desc")}
                  </p>
                  <Button
                    onClick={handleBackToGames}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-lg px-8 py-4 rounded-full"
                  >
                    <Trophy className="mr-2" />
                    {t("lottery.back_to_games")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : isDrawing ? (
            <motion.div
              key="drawing"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="relative mb-8">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                  transition={{
                    rotate: { duration: 1.5, repeat: Infinity },
                    scale: { duration: 2, repeat: Infinity },
                  }}
                  className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r ${prizeTheme.gradient} p-2`}
                >
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Trophy className="h-16 w-16 text-yellow-400" />
                  </div>
                </motion.div>
              </div>

              <motion.h2
                className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {t("lottery.drawing")}
              </motion.h2>

              <p className={`text-xl ${prizeTheme.textColor} font-bold`}>
                🎲 Rolling the dice of fate... 🎲
              </p>
            </motion.div>
          ) : winner ? (
            <motion.div
              key="winner"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <Card
                className={`bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-lg border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50`}
              >
                <CardHeader>
                  <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                    transition={{
                      rotate: { duration: 2, repeat: Infinity },
                      scale: { duration: 1, repeat: Infinity },
                    }}
                    className="text-yellow-300 mb-4"
                  >
                    <Crown className="h-16 w-16 mx-auto" />
                  </motion.div>
                  <CardTitle className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    {t("lottery.winner")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 mb-6">
                    <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text mb-2">
                      {winner.full_name}
                    </h2>
                    <p className="text-xl text-cyan-300 mb-2">
                      {winner.phone_number}
                    </p>
                    <div className="flex items-center justify-center text-lg text-green-300">
                      <Coins className="mr-2 h-5 w-5" />
                      <span className="font-bold">
                        {winner.total_bonuses} {t("lottery.bonus_points")}
                      </span>
                    </div>
                  </div>

                  {currentPrizeIndex < selectedGame.prizes.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-xl font-bold px-10 py-6 rounded-full"
                    >
                      <Sparkles className="mr-2" />
                      {t("lottery.next_prize")} →
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-xl font-bold px-10 py-6 rounded-full"
                    >
                      <Trophy className="mr-2" />
                      Finish Game
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="prize"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <Card
                className={`${prizeTheme.cardBorder} border-2 bg-gradient-to-br from-slate-900/50 to-purple-900/50 backdrop-blur-lg shadow-2xl`}
              >
                <CardHeader>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center justify-center mb-4"
                  >
                    {prizeTheme.icon}
                  </motion.div>
                  <CardTitle
                    className={`${prizeTheme.textColor} text-3xl font-black flex items-center justify-center`}
                  >
                    <span className={`mr-2 ${prizeTheme.rarityColor}`}>
                      {prizeTheme.rarity}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative">
                    <img
                      src={currentPrize.image}
                      alt={currentPrize.name}
                      className="w-64 h-64 mx-auto rounded-2xl object-cover shadow-2xl border-4 border-white/20"
                    />
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${prizeTheme.gradient} opacity-20`}
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-3 text-white">
                      {currentPrize.name}
                    </h2>
                    <div
                      className={`flex items-center justify-center text-lg ${prizeTheme.textColor} mb-6`}
                    >
                      {currentPrize.type === "money" ? (
                        <>
                          <Coins className="mr-2 h-5 w-5" />
                          {t("lottery.prize_types.cash_prize")}
                        </>
                      ) : (
                        <>
                          <Gift className="mr-2 h-5 w-5" />
                          {t("lottery.prize_types.physical_item")}
                        </>
                      )}
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleDraw}
                      disabled={isDrawing}
                      className={`bg-gradient-to-r ${prizeTheme.gradient} text-white text-2xl font-black px-12 py-8 rounded-full shadow-lg w-full`}
                    >
                      <Trophy className="mr-3 h-8 w-8" />
                      {t("lottery.spin_to_win")}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {t("lottery.lottery_demo")}
          </h1>
          <p className="text-xl text-cyan-300">
            Experience the amazing lottery game with stunning animations and
            effects!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {mockGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm border border-purple-400/30 hover:border-purple-400 transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {game.name}
                  </CardTitle>
                  <p className="text-purple-300 flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {game.participating_clients_count} Players
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-3">
                      🏆 Prizes ({game.prizes.length}):
                    </h3>
                    {game.prizes.map((prize) => {
                      const theme = getPrizeTheme(prize.ordering, t);
                      return (
                        <div
                          key={prize.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg bg-white/5 border ${theme.cardBorder}/30`}
                        >
                          <img
                            src={prize.image}
                            alt={prize.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {theme.icon}
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded ${theme.rarityColor} bg-white/10`}
                              >
                                {theme.rarity}
                              </span>
                            </div>
                            <p className="font-semibold text-white">
                              {prize.name}
                            </p>
                            <p className={`text-sm ${theme.textColor}`}>
                              {prize.type === "money"
                                ? `💰 ${t("lottery.prize_types.cash_prize")}`
                                : `🎁 ${t("lottery.prize_types.physical_item")}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleStartGame(game)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg font-bold py-6 rounded-xl"
                    >
                      <Play className="mr-2 h-6 w-6" />
                      🚀 {t("lottery.start_game")}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg text-gray-300 mb-4">
            ✨ Features: Prize Tiers • Animated Draws • Confetti Effects •
            Responsive Design ✨
          </p>
          <p className="text-sm text-gray-400">
            {t("lottery.click_start_game")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
