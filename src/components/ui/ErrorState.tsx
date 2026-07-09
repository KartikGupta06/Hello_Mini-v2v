import React from "react";
import { AlertCircle } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Connection Interrupted",
  description,
  onRetry,
  retryText = "Re-establish Connection"
}) => {
  return (
    <Card glass={true} hoverEffect={false} padding="lg" className={styles.card}>
      <div className={styles.iconContainer}>
        <AlertCircle size={44} className={styles.errorIcon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </Card>
  );
};
