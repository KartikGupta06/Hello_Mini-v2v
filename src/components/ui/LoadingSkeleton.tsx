import React from "react";
import styles from "./LoadingSkeleton.module.css";

interface LoadingSkeletonProps {
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = "rect",
  width = "100%",
  height,
  count = 1
}) => {
  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    
    if (height) {
      style.height = typeof height === "number" ? `${height}px` : height;
    } else {
      if (variant === "text") style.height = "16px";
      else if (variant === "circle") style.height = "40px";
      else style.height = "80px";
    }

    if (variant === "circle") {
      style.borderRadius = "50%";
      if (!width) style.width = style.height;
    }

    return style;
  };

  const items = Array.from({ length: count });

  return (
    <div className={styles.container}>
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`${styles.skeleton} ${styles[variant]} shimmer`}
          style={getStyle()}
        />
      ))}
    </div>
  );
};
