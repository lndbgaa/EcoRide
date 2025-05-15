import { Suspense } from "react";

import Loader from "@/components/Loader/Loader";

/**
 * Fonction pour charger les pages de manière lazy
 * @param Component - Composant à charger
 * @returns - Composant chargé
 */
const lazyLoad = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

export default lazyLoad;
