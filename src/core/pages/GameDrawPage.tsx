import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStartGame, useDrawGame, useNextPrize } from "../api/game";
import type { GameStartResponse } from "../api/game";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Loader2,
  Crown,
  Trophy,
  Gift,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  // Star,Star
  Coins,
  Gem,
  Star,
  // Gem,
} from "lucide-react";

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
  ordering?: number;
}

interface Client {
  id: number;
  full_name: string;
  phone_number: string;
  total_bonuses: number;
}

interface GameWinner {
  id: number;
  prize: {
    id: number;
    name: string;
    type: "item" | "money";
    image: string;
  };
  client: {
    id: number;
    full_name: string;
    phone_number: string;
  };
  awarded_at: string;
}

// Prize tier colors based on ordering/rarity
const getPrizeTheme = (prize: Prize, t: (key: string) => string) => {
  const order = prize.ordering || 1;

  if (order <= 2) {
    // Legendary - Gold/Purple
    return {
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      cardBorder: "border-yellow-400",
      cardBg: "bg-gradient-to-br from-yellow-900/30 to-orange-900/30",
      textColor: "text-yellow-300",
      glow: "shadow-yellow-400/50",
      particles: "yellow",
      icon: Crown,
      rarity: t("lottery.rarity.legendary"),
    };
  } else if (order <= 4) {
    // Epic - Purple/Pink
    return {
      gradient: "from-purple-400 via-pink-500 to-purple-600",
      cardBorder: "border-purple-400",
      cardBg: "bg-gradient-to-br from-purple-900/30 to-pink-900/30",
      textColor: "text-purple-300",
      glow: "shadow-purple-400/50",
      particles: "purple",
      icon: Gem,
      rarity: t("lottery.rarity.epic"),
    };
  } else if (order <= 6) {
    // Rare - Blue/Cyan
    return {
      gradient: "from-blue-400 via-cyan-500 to-blue-600",
      cardBorder: "border-blue-400",
      cardBg: "bg-gradient-to-br from-blue-900/30 to-cyan-900/30",
      textColor: "text-blue-300",
      glow: "shadow-blue-400/50",
      particles: "blue",
      icon: Star,
      rarity: t("lottery.rarity.rare"),
    };
  }

  // Common - Green
  return {
    gradient: "from-green-400 via-emerald-500 to-green-600",
    cardBorder: "border-green-400",
    cardBg: "bg-gradient-to-br from-green-900/30 to-emerald-900/30",
    textColor: "text-green-300",
    glow: "shadow-green-400/50",
    particles: "green",
    icon: prize.type === "money" ? Coins : Gift,
    rarity: t("lottery.rarity.common"),
  };
};

// Floating particles component
const FloatingParticles = ({
  color,
  count = 20,
}: {
  color: string;
  count?: number;
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${
            color === "yellow"
              ? "bg-yellow-400"
              : color === "purple"
                ? "bg-purple-400"
                : color === "blue"
                  ? "bg-blue-400"
                  : "bg-green-400"
          }`}
          initial={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 1200),
            y: (typeof window !== "undefined" ? window.innerHeight : 800) + 10,
            opacity: 0,
          }}
          animate={{
            y: -10,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Background effects component
const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        animate={{
          background: [
            "linear-gradient(45deg, #0f172a, #581c87, #0f172a)",
            "linear-gradient(45deg, #0f172a, #7c3aed, #581c87)",
            "linear-gradient(45deg, #581c87, #0f172a, #7c3aed)",
            "linear-gradient(45deg, #0f172a, #581c87, #0f172a)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating orbs */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-xl opacity-20"
          style={{
            width: Math.random() * 200 + 50,
            height: Math.random() * 200 + 50,
            background: `radial-gradient(circle, ${
              ["#fbbf24", "#8b5cf6", "#06b6d4", "#10b981"][
                Math.floor(Math.random() * 4)
              ]
            }, transparent)`,
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
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function GameDrawPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const gameId = Number(id);

  // State
  const [gameState, setGameState] = useState<GameStartResponse | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWinnerEffects, setShowWinnerEffects] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [winners, setWinners] = useState<GameWinner[]>([]);
  const [gameFinishedMessage, setGameFinishedMessage] = useState<string | null>(
    null,
  );

  // API Mutations
  const { mutate: startGame, isPending: isStarting } = useStartGame();
  const { mutate: drawWinner, isPending: isDrawingWinner } = useDrawGame();
  const { mutate: nextPrize, isPending: isLoadingNext } = useNextPrize();

  // Initial game load
  useEffect(() => {
    if (gameId) {
      startGame(gameId, {
        onSuccess: (data) => {
          setGameState(data);
          // Set clients data if available
          if ("clients" in data) {
            setClients(data.clients || []);
          }
          // Set winners data if game is finished
          if ("winners" in data) {
            setWinners(data.winners || []);
          }
          // Set finish message if available
          if ("message" in data) {
            setGameFinishedMessage(data.message || null);
          }
        },
        onError: () => {
          toast.error(t("messages.error.game_not_found"));
          setTimeout(() => navigate("/games"), 2000);
        },
      });
    }
  }, [gameId, startGame, navigate, t]);

  const handleDraw = () => {
    setIsDrawing(true);
    setShowConfetti(false);
    setShowWinnerEffects(false);

    // Simulate a draw animation for a few seconds
    setTimeout(() => {
      drawWinner(gameId, {
        onSuccess: (data) => {
          if (data.winner) {
            setWinner(data.winner);
          }
          // Update game state with the next prize
          setGameState((prev) =>
            prev
              ? {
                  ...prev,
                  current_prize: data.current_prize,
                }
              : null,
          );

          // Check if game is finished and handle winners
          if (data.winners) {
            setWinners(data.winners);
          }
          if (data.message) {
            setGameFinishedMessage(data.message);
          }

          setShowConfetti(true);
          setShowWinnerEffects(true);
          setDrawError(null);
        },
        onError: (error: unknown) => {
          const errorMessage =
            error && typeof error === "object" && "response" in error
              ? (error as { response?: { data?: { error?: string } } }).response
                  ?.data?.error
              : null;

          if (errorMessage === "No prizes available.") {
            setDrawError(t("lottery.no_prizes_available"));
          } else if (
            errorMessage === "No eligible clients left for this prize."
          ) {
            setDrawError(t("lottery.no_eligible_clients_for_prize"));
          } else {
            toast.error(t("messages.error.delete"));
          }
        },
        onSettled: () => setIsDrawing(false),
      });
    }, 4000); // 4-second animation
  };

  const handleNext = () => {
    setWinner(null);
    setShowConfetti(false);
    setShowWinnerEffects(false);
    setDrawError(null);

    nextPrize(gameId, {
      onSuccess: (data) => {
        setGameState((prev) =>
          prev
            ? {
                ...prev,
                current_prize: data.current_prize,
              }
            : null,
        );
      },
      onError: () => toast.error(t("lottery.next_prize")),
    });
  };

  const handleBackToGames = () => {
    navigate("/games");
  };

  if (isStarting || !gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white relative overflow-hidden">
        <BackgroundEffects />
        <div className="text-center z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-16 w-16 mx-auto mb-4 text-purple-400" />
          </motion.div>
          <motion.p
            className="text-2xl font-bold"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {t("lottery.initializing_game")}
          </motion.p>
        </div>
      </div>
    );
  }

  const {
    game,
    current_prize,
    participating_clients_count,
    eligible_clients_count,
  } = gameState;
  const isGameOver = !current_prize;
  const prizeTheme = current_prize ? getPrizeTheme(current_prize, t) : null;
  const isGameFinished = game.status === "finished" || winners.length > 0;
  const isGameDraft = game.status === "draft";
  const hasNoEligibleClients = eligible_clients_count === 0;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundEffects />

      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 1200}
          height={typeof window !== "undefined" ? window.innerHeight : 800}
          numberOfPieces={200}
          recycle={false}
          colors={[
            "#fbbf24",
            "#8b5cf6",
            "#06b6d4",
            "#10b981",
            "#f59e0b",
            "#ec4899",
          ]}
        />
      )}

      {showWinnerEffects && prizeTheme && (
        <FloatingParticles color={prizeTheme.particles} count={30} />
      )}

      {/* Back Button */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-20 left-6 z-20 group"
      >
        <Button
          variant="outline"
          onClick={handleBackToGames}
          className="text-white border-white/30 hover:bg-white/10 hover:text-white backdrop-blur-sm bg-white/5 transition-all duration-300 overflow-hidden group-hover:w-auto w-12 h-12"
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          <span className="ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-0 group-hover:max-w-xs">
            {t("lottery.back_to_games")}
          </span>
        </Button>
      </motion.div>

      {/* Main Layout */}
      <div className="flex h-screen text-white z-10 relative">
        {/* Left Sidebar - Participating Clients */}
        <div className="w-80 pt-20 px-6 pb-6 overflow-y-auto">
          <ParticipatingClientsDisplay clients={clients} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Game Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <h1 className="text-6xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {game.name}
            </h1>
            <div className="space-y-2">
              <motion.div
                className="flex items-center justify-center space-x-2 text-xl text-cyan-300"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6" />
                <span>
                  {participating_clients_count} {t("lottery.players_ready")}
                </span>
                <Sparkles className="h-6 w-6" />
              </motion.div>

              {/* Show detailed client info when there's a mismatch */}
              {/*{participating_clients_count > 0 &&*/}
              {/*  eligible_clients_count !== participating_clients_count && (*/}
              {/*    <motion.div*/}
              {/*      className="flex items-center justify-center space-x-4 text-sm text-gray-300 mt-2"*/}
              {/*      initial={{ opacity: 0, y: 10 }}*/}
              {/*      animate={{ opacity: 1, y: 0 }}*/}
              {/*      transition={{ delay: 0.2 }}*/}
              {/*    >*/}
              {/*      <span className="bg-gray-800/50 px-3 py-1 rounded-full">*/}
              {/*        {t("lottery.eligible_clients")}: {eligible_clients_count}*/}
              {/*      </span>*/}
              {/*      <span className="bg-gray-800/50 px-3 py-1 rounded-full">*/}
              {/*        {t("lottery.total_participants")}:{" "}*/}
              {/*        {participating_clients_count}*/}
              {/*      </span>*/}
              {/*    </motion.div>*/}
              {/*        */}
              {/*  )}*/}

              {/* Show eligible clients count if it's 0 */}
              {hasNoEligibleClients && (
                <motion.div
                  className="flex items-center justify-center space-x-2 text-lg text-red-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="bg-red-900/30 px-4 py-2 rounded-full border border-red-400/30">
                    {t("lottery.no_eligible_clients")}: {eligible_clients_count}
                  </span>
                </motion.div>
              )}

              {/* Show game status if finished */}
              {isGameFinished && (
                <motion.div
                  className="flex items-center justify-center space-x-2 text-lg text-orange-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="bg-orange-900/30 px-4 py-2 rounded-full border border-orange-400/30">
                    {t("lottery.game_status")}: {t("lottery.status_finished")}
                  </span>
                </motion.div>
              )}

              {/* Show game status if draft */}
              {isGameDraft && (
                <motion.div
                  className="flex items-center justify-center space-x-2 text-lg text-blue-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="bg-blue-900/30 px-4 py-2 rounded-full border border-blue-400/30">
                    {t("lottery.game_status")}: {t("lottery.status_draft")}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Game Content */}
          <AnimatePresence mode="wait">
            {drawError ? (
              <ErrorDisplay error={drawError} onBack={handleBackToGames} />
            ) : isGameOver ? (
              <GameOverScreen onBack={handleBackToGames} />
            ) : isDrawing ? (
              <DrawingAnimation prizeTheme={prizeTheme} />
            ) : winner ? (
              <WinnerDisplay
                winner={winner}
                onNext={handleNext}
                isLoading={isLoadingNext}
                hasNextPrize={!!current_prize}
                prizeTheme={prizeTheme}
              />
            ) : (
              <PrizeDisplay
                prize={current_prize}
                onDraw={handleDraw}
                isLoading={isDrawingWinner}
                prizeTheme={prizeTheme}
                canDraw={
                  !hasNoEligibleClients && !isGameFinished && !isGameDraft
                }
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Winners */}
        {isGameFinished && (
          <div className="w-80 pt-20 px-6 pb-6 overflow-y-auto">
            <WinnersDisplay
              winners={winners}
              gameFinishedMessage={gameFinishedMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components for better organization

const PrizeDisplay = ({
  prize,
  onDraw,
  isLoading,
  prizeTheme,
  canDraw = true,
}: {
  prize: Prize;
  onDraw: () => void;
  isLoading: boolean;
  canDraw?: boolean;
  prizeTheme: {
    gradient: string;
    cardBorder: string;
    cardBg: string;
    textColor: string;
    glow: string;
    particles: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    rarity: string;
  } | null;
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key="prize"
      initial={{ scale: 0, rotateY: 180, opacity: 0 }}
      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
      exit={{ scale: 0, rotateY: -180, opacity: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
    >
      <Card
        className={`${prizeTheme?.cardBg} backdrop-blur-lg ${prizeTheme?.cardBorder} border-2 text-white w-[500px] mx-auto shadow-2xl ${prizeTheme?.glow} shadow-2xl`}
      >
        <CardHeader className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center justify-center mb-4"
          >
            {prizeTheme?.icon && <prizeTheme.icon className="h-8 w-8" />}
          </motion.div>
          <CardTitle
            className={`${prizeTheme?.textColor} text-3xl font-black flex items-center justify-center`}
          >
            <span className="mr-2">{prizeTheme?.rarity}</span>
            <Zap className="h-6 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {prize.image && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.img
                src={prize.image}
                alt={prize.name}
                className="w-64 h-64 rounded-2xl object-cover shadow-2xl border-4 border-white/20"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              />
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${prizeTheme?.gradient} opacity-20`}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}

          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-3 text-white">{prize.name}</h2>
            <div
              className={`flex items-center justify-center text-lg ${prizeTheme?.textColor} mb-6`}
            >
              {prize.type === "money" ? (
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
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: canDraw ? 1.05 : 1 }}
            whileTap={{ scale: canDraw ? 0.95 : 1 }}
          >
            <Button
              onClick={onDraw}
              disabled={isLoading || !canDraw}
              className={`bg-gradient-to-r ${canDraw ? prizeTheme?.gradient : "from-gray-600 to-gray-700"} hover:shadow-2xl text-white text-2xl font-black px-12 py-8 rounded-full shadow-lg transform transition-all duration-300 ${canDraw ? "hover:scale-105" : "cursor-not-allowed"} border-2 border-white/30 ${!canDraw ? "opacity-50" : ""}`}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-8 w-8" />
              ) : (
                <>
                  <Trophy className="mr-3 h-8 w-8" />
                  {canDraw
                    ? t("lottery.spin_to_win")
                    : t("lottery.cannot_draw")}
                </>
              )}
            </Button>
            {!canDraw && (
              <motion.p
                className="text-red-400 text-sm mt-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {t("lottery.draw_not_available")}
              </motion.p>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const WinnerDisplay = ({
  winner,
  onNext,
  isLoading,
  hasNextPrize,
  prizeTheme,
}: {
  winner: Winner;
  onNext: () => void;
  isLoading: boolean;
  hasNextPrize: boolean;
  prizeTheme: {
    gradient: string;
    cardBorder: string;
    cardBg: string;
    textColor: string;
    glow: string;
    particles: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    rarity: string;
  } | null;
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key="winner"
      initial={{ scale: 0, rotateX: 180, opacity: 0 }}
      animate={{ scale: 1, rotateX: 0, opacity: 1 }}
      exit={{ scale: 0, rotateX: -180, opacity: 0 }}
      transition={{ duration: 1, type: "spring", stiffness: 80 }}
    >
      <Card
        className={`${prizeTheme?.cardBg} backdrop-blur-lg border-4 ${prizeTheme?.cardBorder} text-white w-[500px] mx-auto shadow-2xl ${prizeTheme?.glow}`}
      >
        <CardHeader className="text-center">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity },
              scale: { duration: 1, repeat: Infinity, repeatType: "reverse" },
            }}
            className={`${prizeTheme?.textColor} mb-4`}
          >
            <Crown className="h-16 w-16 mx-auto" />
          </motion.div>
          <CardTitle className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {t("lottery.winner")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="text-center bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20"
          >
            <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text mb-3">
              {winner.full_name}
            </h2>
            <p className="text-xl text-cyan-300 mb-2">{winner.phone_number}</p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex space-x-4"
          >
            {hasNextPrize ? (
              <Button
                onClick={onNext}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:to-blue-700 text-xl font-bold px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/30"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-6 w-6" />
                    {t("lottery.next_prize")}
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </>
                )}
              </Button>
            ) : (
              <div className="text-center">
                <motion.p
                  className="text-2xl font-bold text-green-300 mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {t("lottery.all_prizes_drawn")}
                </motion.p>
                <Button
                  onClick={() => (window.location.href = "/games")}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xl font-bold px-10 py-6 rounded-full shadow-xl"
                >
                  <Trophy className="mr-2 h-6 w-6" />
                  {t("lottery.finish_game")}
                </Button>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DrawingAnimation = ({
  prizeTheme,
}: {
  prizeTheme: {
    gradient: string;
    cardBorder: string;
    cardBg: string;
    textColor: string;
    glow: string;
    particles: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    rarity: string;
  } | null;
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key="drawing"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="text-center w-[500px] h-96 flex flex-col items-center justify-center"
    >
      {/* Main spinning element */}
      <motion.div
        className="relative mb-8"
        animate={{
          rotate: 360,
          scale: [1, 1.3, 1],
        }}
        transition={{
          rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity },
        }}
      >
        <div
          className={`relative w-32 h-32 rounded-full bg-gradient-to-r ${prizeTheme?.gradient} p-2`}
        >
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            <Trophy className="h-16 w-16 text-yellow-400" />
          </div>
        </div>

        {/* Rotating rings */}
        <motion.div
          className={`absolute inset-0 border-4 ${prizeTheme?.cardBorder} rounded-full`}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-white/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Animated text */}
      <motion.div
        className="space-y-4"
        animate={{
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        <h2 className="text-5xl font-black tracking-widest bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
          {t("lottery.drawing_dots")}
        </h2>
        <p className={`text-xl ${prizeTheme?.textColor} font-bold`}>
          {t("lottery.rolling_dice")}
        </p>
      </motion.div>

      {/* Bouncing dots */}
      <motion.div
        className="flex justify-center mt-6 space-x-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`w-4 h-4 rounded-full bg-gradient-to-r ${prizeTheme?.gradient}`}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>

      {/* Pulsing circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`absolute w-40 h-40 border-2 ${prizeTheme?.cardBorder} rounded-full opacity-20`}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.7,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const ErrorDisplay = ({
  error,
  onBack,
}: {
  error: string;
  onBack: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key="error"
      initial={{ y: 100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
    >
      <Card className="bg-gradient-to-br from-red-900/50 to-pink-900/50 backdrop-blur-lg border-2 border-red-400 text-white w-[500px] mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-red-300 mb-4"
          >
            <Gift className="h-20 w-20 mx-auto" />
          </motion.div>
          <CardTitle className="text-4xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            {t("lottery.draw_error")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-center bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-4 text-red-300">{error}</h2>
            <p className="text-lg text-red-200">
              {t("lottery.contact_administrator")}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 hover:from-red-700 hover:to-pink-700 text-xl font-bold px-12 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/30"
            >
              <ArrowLeft className="mr-3 h-6 w-6" />
              {t("lottery.back_to_games")}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ParticipatingClientsDisplay = ({ clients }: { clients: Client[] }) => {
  const { t } = useTranslation();

  if (clients.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-lg border-2 border-cyan-400/20 text-white shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
            <Star className="h-5 w-5 text-cyan-400" />
            {t("lottery.participating_clients")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {clients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-3 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-cyan-300 truncate">
                      {client.full_name}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {client.phone_number}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins className="h-3 w-3" />
                      <span className="text-sm font-bold">
                        {client.total_bonuses}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const WinnersDisplay = ({
  winners,
  gameFinishedMessage,
}: {
  winners: GameWinner[];
  gameFinishedMessage: string | null;
}) => {
  const { t } = useTranslation();

  if (winners.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
      className="mb-6"
    >
      {gameFinishedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg border-2 border-yellow-400/30 rounded-xl p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-400 mb-1">
                <Sparkles className="h-5 w-5" />✨ Все призы распределены! ✨
              </div>
              <p className="text-sm text-orange-300">Спасибо за лотерею!</p>
            </div>
          </div>
        </motion.div>
      )}

      <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-lg border-2 border-green-400/20 text-white shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-400" />
            {t("lottery.winners")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {winners.map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-green-800/20 to-emerald-800/20 p-3 rounded-lg backdrop-blur-sm border border-green-400/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    >
                      <Crown className="h-6 w-6 text-yellow-400" />
                    </motion.div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-green-300 truncate">
                          {winner.client.full_name}
                        </h3>
                        <p className="text-xs text-green-400 truncate">
                          {winner.client.phone_number}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-400 ml-2">
                        {winner.awarded_at}
                      </div>
                    </div>

                    <div className="bg-white/5 p-2 rounded border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <img
                            src={winner.prize.image}
                            alt={winner.prize.name}
                            className="w-8 h-8 object-cover rounded border border-yellow-400/50"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-yellow-300 truncate">
                            {winner.prize.name}
                          </h4>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Gift className="h-3 w-3" />
                            <span className="text-xs capitalize">
                              {winner.prize.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const GameOverScreen = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      key="gameover"
      initial={{ y: 100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
    >
      <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg border-2 border-purple-400 text-white w-[500px] mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-purple-300 mb-4"
          >
            <Trophy className="h-20 w-20 mx-auto" />
          </motion.div>
          <CardTitle className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t("lottery.game_complete")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-center bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20"
          >
            <h2 className="text-3xl font-bold mb-4">
              {t("lottery.all_prizes_distributed")}
            </h2>
            <p className="text-xl text-purple-200">
              {t("lottery.thank_you_amazing")}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:to-pink-700 text-xl font-bold px-12 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/30"
            >
              <ArrowLeft className="mr-3 h-6 w-6" />
              {t("lottery.back_to_games")}
              <Sparkles className="ml-3 h-6 w-6" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
