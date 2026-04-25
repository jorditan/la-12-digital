import { useBomboneraWidget } from "./hooks/useBomboneraWidget";
import { ModoNormal } from "./ModoNormal";
import { ModoMatchDay } from "./ModoMatchDay";

export function BomboneraWidget() {
  const {
    proximoLocal,
    proximosLocales,
    diasHastaPartido,
    matchForecast,
    matchDayMode,
    loading,
    error,
  } = useBomboneraWidget();

  if (matchDayMode && proximoLocal) {
    return (
      <ModoMatchDay proximoLocal={proximoLocal} matchForecast={matchForecast} />
    );
  }

  return (
    <ModoNormal
      proximoLocal={proximoLocal}
      proximosLocales={proximosLocales}
      diasHastaPartido={diasHastaPartido}
      matchForecast={matchForecast}
      loading={loading}
      error={error}
    />
  );
}
