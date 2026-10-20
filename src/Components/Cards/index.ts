import { Card, type CardProps } from "./Card";
export { contentPaddingClassName } from "./Card";
import { StatCard, type StatCardProps } from "./StatCard";

// Création d'un namespace Cards qui contient les deux composants
export const Cards = {
  Card,
  StatCard,
};

// Exportation directe des types pour faciliter l'import
export type { CardProps, StatCardProps };

// Exportation individuelle des composants pour la rétrocompatibilité
export { Card, StatCard };
