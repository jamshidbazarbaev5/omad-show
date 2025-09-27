import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Prize } from "../api/types";

interface PrizeFormProps {
  prizes: Prize[];
  onPrizesChange: (prizes: Prize[]) => void;
}

export function PrizeForm({ prizes, onPrizesChange }: PrizeFormProps) {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addPrize = () => {
    const newPrize: Prize = {
      name: "",
      type: "item",
      quantity: 1,
      ordering: prizes.length + 1,
      game: 0, // Will be set when the game is created
    };
    onPrizesChange([...prizes, newPrize]);
  };

  const updatePrize = (
    index: number,
    field: keyof Prize,
    value: string | number | File | null,
  ) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    onPrizesChange(updatedPrizes);
  };

  const removePrize = (index: number) => {
    const updatedPrizes = prizes.filter((_, i) => i !== index);
    // Update ordering after removal
    const reorderedPrizes = updatedPrizes.map((prize, i) => ({
      ...prize,
      ordering: i + 1,
    }));
    onPrizesChange(reorderedPrizes);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const updatedPrizes = [...prizes];
    const [draggedPrize] = updatedPrizes.splice(draggedIndex, 1);
    updatedPrizes.splice(dropIndex, 0, draggedPrize);

    // Update ordering after reordering
    const reorderedPrizes = updatedPrizes.map((prize, i) => ({
      ...prize,
      ordering: i + 1,
    }));

    onPrizesChange(reorderedPrizes);
    setDraggedIndex(null);
  };

  const handleImageChange = (index: number, file: File | null) => {
    updatePrize(index, "image", file);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t("forms.prizes") || "Prizes"}
        </h3>
        <button
          type="button"
          onClick={addPrize}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center gap-1"
        >
          <span>➕</span>
          {t("actions.add_prize") || "Add Prize"}
        </button>
      </div>

      {prizes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">
            {t("messages.no_prizes") || "No prizes added yet"}
          </p>
          <button
            type="button"
            onClick={addPrize}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t("actions.add_first_prize") || "Add First Prize"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {prizes.map((prize, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white border rounded-lg p-4 shadow-sm transition-all duration-200 ${
                draggedIndex === index
                  ? "opacity-50 transform scale-95"
                  : "hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-gray-400 cursor-move"
                    title="Drag to reorder"
                  >
                    ⋮⋮
                  </span>
                  <span className="font-medium text-sm text-gray-600">
                    {t("forms.prize_order", { order: prize.ordering }) ||
                      `Prize #${prize.ordering}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removePrize(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title={t("actions.remove_prize") || "Remove prize"}
                >
                  🗑️
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Prize Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("forms.prize_name") || "Prize Name"} *
                  </label>
                  <input
                    type="text"
                    value={prize.name}
                    onChange={(e) => updatePrize(index, "name", e.target.value)}
                    placeholder={
                      t("placeholders.prize_name") || "Enter prize name"
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Prize Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("forms.prize_type") || "Prize Type"} *
                  </label>
                  <select
                    value={prize.type}
                    onChange={(e) =>
                      updatePrize(
                        index,
                        "type",
                        e.target.value as "item" | "money",
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="item">
                      {t("prize_types.item") || "Item"}
                    </option>
                    <option value="money">
                      {t("prize_types.money") || "Money"}
                    </option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("forms.quantity") || "Quantity"} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prize.quantity}
                    onChange={(e) =>
                      updatePrize(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Prize Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("forms.prize_image") || "Prize Image"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(index, e.target.files?.[0] || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {prize.image && (
                    <div className="mt-2">
                      {typeof prize.image === "string" ? (
                        <img
                          src={prize.image}
                          alt={prize.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ) : (
                        <div className="text-xs text-gray-600">
                          {t("messages.image_selected") || "Image selected: "}
                          {prize.image.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Prize Type Indicator */}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    prize.type === "money"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {prize.type === "money" ? "💰" : "🎁"}
                  {prize.type === "money"
                    ? t("prize_types.money") || "Money Prize"
                    : t("prize_types.item") || "Item Prize"}
                </span>
                <span className="text-xs text-gray-500">
                  {t("forms.qty_label", { quantity: prize.quantity }) ||
                    `Qty: ${prize.quantity}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {prizes.length > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <p className="font-medium mb-1">
            {t("messages.prize_instructions_title") || "Prize Management Tips:"}
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>
              {t("messages.drag_to_reorder") ||
                "Drag prizes using the ⋮⋮ handle to reorder them"}
            </li>
            <li>
              {t("messages.prize_ordering") ||
                "Prize order determines the sequence in the game"}
            </li>
            <li>
              {t("messages.required_fields") ||
                "Name, type, and quantity are required for each prize"}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
