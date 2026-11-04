"use client";

import React, { useState } from "react";
import { RotateCcw } from "lucide-react";

interface ColorPickerItemProps {
  label: string;
  description?: string;
  value: string;
  defaultValue?: string;
  onChange: (newVal: string) => void;
  onReset?: () => void;
}

export const ColorPickerItem: React.FC<ColorPickerItemProps> = ({
  label,
  description,
  value,
  defaultValue,
  onChange,
  onReset,
}) => {
  const [localInput, setLocalInput] = useState(value);

  // Sync when prop changes
  React.useEffect(() => {
    setLocalInput(value);
  }, [value]);

  const handleHexBlur = () => {
    let clean = localInput.trim();
    if (!clean.startsWith("#")) {
      clean = "#" + clean;
    }
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(clean)) {
      onChange(clean);
      setLocalInput(clean);
    } else {
      setLocalInput(value);
    }
  };

  const isChanged = defaultValue && value.toLowerCase() !== defaultValue.toLowerCase();

  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-surface-subtle transition-colors group">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-text-primary leading-tight truncate">
          {label}
        </p>
        {description && (
          <p className="text-[10px] text-text-muted truncate mt-0.5">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Color Swatch & Native Color Picker */}
        <div className="relative w-7 h-7 rounded-lg border border-border shadow-2xs overflow-hidden cursor-pointer shrink-0">
          <input
            type="color"
            value={value.startsWith("#") && value.length === 7 ? value : "#087A55"}
            onChange={(e) => {
              onChange(e.target.value);
              setLocalInput(e.target.value);
            }}
            className="absolute -inset-2 w-12 h-12 opacity-0 cursor-pointer"
            title={`Select ${label}`}
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor: value }}
          />
        </div>

        {/* HEX Input */}
        <input
          type="text"
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onBlur={handleHexBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleHexBlur();
          }}
          className="w-20 px-2 py-1 text-[11px] font-mono rounded border border-border bg-surface text-text-primary focus:outline-none focus:border-brand"
        />

        {/* Reset button */}
        {isChanged && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-1 rounded text-text-muted hover:text-brand hover:bg-brand-soft transition-colors"
            title={`Reset ${label} to default (${defaultValue})`}
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

