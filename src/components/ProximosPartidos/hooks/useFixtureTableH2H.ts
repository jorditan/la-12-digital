import { useCallback, useMemo, useState } from "react";

interface SelectedH2H {
  rivalId: number;
  rivalName: string;
}

export function useFixtureTableH2H() {
  const [selected, setSelected] = useState<SelectedH2H | null>(null);

  const openH2H = useCallback((rivalId: number, rivalName: string) => {
    setSelected({ rivalId, rivalName });
  }, []);

  const closeH2H = useCallback(() => {
    setSelected(null);
  }, []);

  return useMemo(
    () => ({
      selected,
      openH2H,
      closeH2H,
    }),
    [closeH2H, openH2H, selected],
  );
}
