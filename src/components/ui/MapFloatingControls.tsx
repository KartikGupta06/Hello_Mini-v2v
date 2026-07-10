"use client";

import React from "react";
import { motion } from "framer-motion";
import { Crosshair, Layers, Volume2, VolumeX, Compass, Locate } from "lucide-react";
import styles from "./MapFloatingControls.module.css";

interface MapFloatingControlsProps {
  bottom?: string | number;
  onRecenter?: () => void;
  onToggleLayers?: () => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
  showMute?: boolean;
  onLocate?: () => void;
  onCompass?: () => void;
  className?: string;
}

export const MapFloatingControls: React.FC<MapFloatingControlsProps> = ({
  bottom = "120px",
  onRecenter = () => alert("Recentering map view..."),
  onToggleLayers = () => alert("Layer options toggled."),
  onToggleMute,
  isMuted = false,
  showMute = false,
  onLocate = () => alert("GPS verification active."),
  onCompass = () => alert("Compass orientation active."),
  className = ""
}) => {
  return (
    <div
      className={`${styles.floatingActionsCol} ${className}`}
      style={{ bottom }}
    >
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={styles.actionRoundBtn}
        aria-label="Recenter Map"
        onClick={onRecenter}
      >
        <Crosshair size={16} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={styles.actionRoundBtn}
        aria-label="Layer Options"
        onClick={onToggleLayers}
      >
        <Layers size={16} />
      </motion.button>

      {showMute && onToggleMute ? (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={styles.actionRoundBtn}
          aria-label="Mute voice guidance toggle"
          onClick={onToggleMute}
        >
          {isMuted ? (
            <VolumeX size={16} className={styles.muteActive} />
          ) : (
            <Volume2 size={16} />
          )}
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={styles.actionRoundBtn}
          aria-label="Compass Orientation"
          onClick={onCompass}
        >
          <Compass size={16} />
        </motion.button>
      )}

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={styles.actionRoundBtn}
        aria-label="Verify GPS status"
        onClick={onLocate}
      >
        <Locate size={16} className={styles.locateActive} />
      </motion.button>
    </div>
  );
};
