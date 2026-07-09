import React from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "./Card";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <ShieldCheck size={48} className={styles.defaultIcon} />,
  title,
  description,
  action
}) => {
  return (
    <Card glass={true} hoverEffect={false} padding="lg" className={styles.card}>
      <div className={styles.iconContainer}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </Card>
  );
};
