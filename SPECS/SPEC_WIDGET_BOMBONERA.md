# SPEC: Migración de clima — OWM → Open-Meteo
**Fecha:** Marzo 2026
**Stack:** React + Vite + TypeScript (frontend) · Go (backend/Worker)
**Scope:** Reemplazar el cliente de OWM por Open-Meteo en el backend y actualizar el contrato de datos con el frontend

---

## Por qué se migra

OpenWeatherMap (OWM) free tier tiene un límite de **5 días de forecast**. El widget de La Bombonera necesita mostrar el pronóstico para el próximo partido de local, que puede estar a más de 5 días. Con OWM, el componente queda en skeleton vacío en esos casos.

Open-Meteo resuelve esto: **gratis, sin API key, hasta 16 días de forecast, resolución horaria.**

---

## Endpoint de Open-Meteo a usar

```
GET https://api.open-meteo.com/v1/forecast
```

### Parámetros para La Bombonera (Brandsen 805, CABA)

```
latitude=-34.6345
longitude=-58.3699
hourly=temperature_2m,relative_humidity_2m,precipitation_probability,windspeed_10m,weathercode
forecast_days=16
timezone=America/Argentina/Buenos_Aires
```

### URL completa de ejemplo

```
https://api.open-meteo.com/v1/forecast?latitude=-34.6345&longitude=-58.3699&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,windspeed_10m,weathercode&forecast_days=16&timezone=America%2FArgentina%2FBuenos_Aires
```

### Shape de la respuesta

```json
{
  "latitude": -34.625,
  "longitude": -58.375,
  "timezone": "America/Argentina/Buenos_Aires",
  "hourly": {
    "time": ["2026-03-15T00:00", "2026-03-15T01:00", "..."],
    "temperature_2m": [22.1, 21.8, "..."],
    "relative_humidity_2m": [61, 63, "..."],
    "precipitation_probability": [0, 5, "..."],
    "windspeed_10m": [14.2, 12.8, "..."],
    "weathercode": [0, 1, "..."]
  }
}
```

> `hourly.time` es un array de strings ISO en la timezone solicitada.
> Todos los arrays tienen la misma longitud: 16 días × 24 horas = 384 items.

### Tabla de WMO Weather Codes relevantes

| Code | Descripción |
|---|---|
| 0 | Cielo despejado |
| 1, 2, 3 | Mayormente despejado / Parcialmente nublado / Nublado |
| 45, 48 | Niebla |
| 51, 53, 55 | Llovizna leve / moderada / intensa |
| 61, 63, 65 | Lluvia leve / moderada / intensa |
| 80, 81, 82 | Chaparrones leve / moderado / violento |
| 95 | Tormenta eléctrica |

---

## Cambios en el backend (Go)

### 1. Eliminar cliente de OWM

Buscar y eliminar el archivo o función que hace el request a `api.openweathermap.org`, y eliminar la variable de entorno `OWM_API_KEY` de `wrangler.toml` o de los secrets de Cloudflare.

### 2. Crear cliente de Open-Meteo

```go
// internal/weather/openmeteo.go

package weather

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

const (
    BomboneraLat = -34.6345
    BomboneraLon = -58.3699
    OpenMeteoURL = "https://api.open-meteo.com/v1/forecast"
)

type openMeteoResponse struct {
    Hourly struct {
        Time              []string  `json:"time"`
        Temperature2m     []float64 `json:"temperature_2m"`
        RelativeHumidity  []int     `json:"relative_humidity_2m"`
        PrecipitationProb []int     `json:"precipitation_probability"`
        WindSpeed10m      []float64 `json:"windspeed_10m"`
        WeatherCode       []int     `json:"weathercode"`
    } `json:"hourly"`
}

// HourlyForecast es el contrato de datos que se envía al frontend.
type HourlyForecast struct {
    Time                 string  `json:"time"`
    TempC                float64 `json:"tempC"`
    HumidityPct          int     `json:"humidityPct"`
    PrecipitationProbPct int     `json:"precipitationProbPct"`
    WindSpeedKmh         float64 `json:"windSpeedKmh"`
    WeatherCode          int     `json:"weatherCode"`
    Description          string  `json:"description"`
    IsGoodConditions     bool    `json:"isGoodConditions"`
}

// FetchForecastForTime devuelve el pronóstico para una hora específica (hora del partido).
func FetchForecastForTime(matchTime time.Time) (*HourlyForecast, error) {
    url := fmt.Sprintf(
        "%s?latitude=%f&longitude=%f&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,windspeed_10m,weathercode&forecast_days=16&timezone=America%%2FArgentina%%2FBuenos_Aires",
        OpenMeteoURL, BomboneraLat, BomboneraLon,
    )

    resp, err := http.Get(url)
    if err != nil {
        return nil, fmt.Errorf("open-meteo request failed: %w", err)
    }
    defer resp.Body.Close()

    var data openMeteoResponse
    if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
        return nil, fmt.Errorf("open-meteo decode failed: %w", err)
    }

    return extractHourForecast(data, matchTime)
}

func extractHourForecast(data openMeteoResponse, target time.Time) (*HourlyForecast, error) {
    targetStr := target.Format("2006-01-02T15:04")

    for i, t := range data.Hourly.Time {
        if t == targetStr {
            return &HourlyForecast{
                Time:                 t,
                TempC:                data.Hourly.Temperature2m[i],
                HumidityPct:          data.Hourly.RelativeHumidity[i],
                PrecipitationProbPct: data.Hourly.PrecipitationProb[i],
                WindSpeedKmh:         data.Hourly.WindSpeed10m[i],
                WeatherCode:          data.Hourly.WeatherCode[i],
                Description:          wmoDescription(data.Hourly.WeatherCode[i]),
                IsGoodConditions:     isGoodConditions(
                    data.Hourly.Temperature2m[i],
                    data.Hourly.PrecipitationProb[i],
                    data.Hourly.WindSpeed10m[i],
                ),
            }, nil
        }
    }

    return nil, fmt.Errorf("no forecast data for time %s (beyond 16-day window?)", targetStr)
}

func wmoDescription(code int) string {
    switch {
    case code == 0:
        return "Cielo despejado"
    case code <= 3:
        return "Parcialmente nublado"
    case code <= 48:
        return "Niebla"
    case code <= 55:
        return "Llovizna"
    case code <= 65:
        return "Lluvia"
    case code <= 82:
        return "Chaparrones"
    case code == 95:
        return "Tormenta"
    default:
        return "Variable"
    }
}

// Buenas condiciones: > 5°, < 40% prob. lluvia, viento < 50 km/h
func isGoodConditions(tempC float64, precipProb int, windKmh float64) bool {
    return tempC > 5 && precipProb < 40 && windKmh < 50
}
```

### 3. Actualizar el handler `/api/weather`

El handler ahora recibe `matchTime` como query param en formato `YYYY-MM-DDTHH:MM`:

```go
// handler: GET /api/weather?matchTime=2026-03-22T20:00
func WeatherHandler(w http.ResponseWriter, r *http.Request) {
    matchTimeStr := r.URL.Query().Get("matchTime")
    if matchTimeStr == "" {
        http.Error(w, "matchTime query param required (format: YYYY-MM-DDTHH:MM)", http.StatusBadRequest)
        return
    }

    loc, _ := time.LoadLocation("America/Argentina/Buenos_Aires")
    matchTime, err := time.ParseInLocation("2006-01-02T15:04", matchTimeStr, loc)
    if err != nil {
        http.Error(w, "invalid matchTime format, expected YYYY-MM-DDTHH:MM", http.StatusBadRequest)
        return
    }

    forecast, err := weather.FetchForecastForTime(matchTime)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Cache-Control", "public, max-age=3600") // cachear 1 hora
    json.NewEncoder(w).Encode(forecast)
}
```

---

## Cambios en el frontend (React + TypeScript)

### 1. Actualizar el tipo de clima

```ts
// src/types/weather.ts — reemplazar la interfaz existente

export interface HourlyForecast {
  time: string;
  tempC: number;
  humidityPct: number;
  precipitationProbPct: number; // ← nuevo campo
  windSpeedKmh: number;
  weatherCode: number;
  description: string;
  isGoodConditions: boolean;    // ← nuevo campo
}
```

### 2. Actualizar el fetch de clima

Buscar la llamada actual a `/api/weather` y agregar `matchTime` como query param:

```ts
// src/hooks/useMatchForecast.ts (renombrar o adaptar el hook existente)

export function useMatchForecast(matchDate: string, matchTime: string) {
  // matchDate: "2026-03-22" · matchTime: "20:00"
  const matchTimeParam = `${matchDate}T${matchTime}`;

  return useQuery({
    queryKey: ['forecast', matchTimeParam],
    queryFn: async (): Promise<HourlyForecast> => {
      const res = await fetch(`/api/weather?matchTime=${matchTimeParam}`);
      if (!res.ok) throw new Error('Weather fetch failed');
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
```

### 3. Actualizar el componente de La Bombonera

Reemplazar las referencias a los campos de OWM por los nuevos:

```tsx
// ANTES (OWM)           → DESPUÉS (Open-Meteo)
// weather.main.temp     → forecast.tempC
// weather.main.humidity → forecast.humidityPct
// weather.wind.speed    → forecast.windSpeedKmh
// weather.weather[0].description → forecast.description

// Agregar el nuevo stat de probabilidad de lluvia:
<div className="stat">
  <span
    className="stat-val"
    style={{ color: forecast.precipitationProbPct > 40 ? '#f87171' : '#fff' }}
  >
    {forecast.precipitationProbPct}
    <span style={{ fontSize: '0.6rem', color: '#8BA3C7' }}>%</span>
  </span>
  <span className="lbl muted">Lluvia</span>
</div>

// El badge de condiciones usa isGoodConditions del backend:
<span className={`fc-tag ${
  forecast.isGoodConditions
    ? 'bg-green-500/[0.2] border-l-green-400 text-green-400'
    : 'bg-red-500/[0.2] border-l-red-400 text-red-400'
}`}>
  {forecast.isGoodConditions ? 'Buenas condiciones' : 'Clima adverso'}
</span>
```

---

## Variables de entorno

### Eliminar
```
OWM_API_KEY=...
```

### No agregar nada nuevo
Open-Meteo no requiere API key ni configuración adicional.

---

## Checklist de implementación

```
[ ] 1. Eliminar cliente OWM del backend Go
[ ] 2. Crear internal/weather/openmeteo.go con FetchForecastForTime()
[ ] 3. Actualizar handler /api/weather para aceptar ?matchTime=YYYY-MM-DDTHH:MM
[ ] 4. Eliminar OWM_API_KEY de wrangler.toml y/o secrets de Cloudflare
[ ] 5. Actualizar interfaz HourlyForecast en src/types/weather.ts
[ ] 6. Actualizar hook de clima para pasar matchTime como query param
[ ] 7. Actualizar componente Bombonera: renombrar campos + agregar precipitationProbPct
[ ] 8. npm run build — verificar que no rompe
[ ] 9. Probar: partido a < 5 días → debe mostrar pronóstico ✓
[ ] 10. Probar: partido a > 5 días → ahora también debe mostrar pronóstico ✓ (era el bug)
```

---

## Criterios de aceptación

- [ ] El widget muestra el pronóstico del día del partido sin importar cuántos días falten (hasta 16)
- [ ] Se muestran temperatura, humedad, viento, probabilidad de lluvia y descripción del estado
- [ ] El badge "Buenas condiciones" / "Clima adverso" se calcula con `isGoodConditions` del backend
- [ ] No hay skeleton vacío cuando el partido está a más de 5 días
- [ ] No existe ninguna referencia a `OWM_API_KEY` ni a `openweathermap.org` en el proyecto
- [ ] El endpoint responde a `/api/weather?matchTime=2026-03-22T20:00` con el JSON correcto