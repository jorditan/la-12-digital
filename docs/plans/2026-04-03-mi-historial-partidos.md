# Mi Historial de Partidos — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Agregar una ruta `/mi-historial` donde el usuario autenticado puede ver partidos recientes de Boca, marcar cuáles presenció y agregar notas personales, con persistencia en Supabase.

**Architecture:** SPA sin React Router — se extiende el routing manual existente basado en `window.location.pathname` (patrón ya documentado en el proyecto). Supabase provee auth (email/password) y base de datos con RLS. El cliente Supabase corre en el browser; no hay interacción con el Cloudflare Worker existente.

**Tech Stack:** React 18 + TypeScript strict + Tailwind CSS v3 + Supabase JS v2 + Vite env vars compilados en bundle

---

## Contexto del proyecto (leer antes de empezar)

### Routing actual
El proyecto **NO usa React Router**. `App.tsx` renderiza todos los componentes directamente sin lógica de rutas. El `wrangler.jsonc` tiene `"not_found_handling": "single-page-application"` lo que permite manejar rutas como `/mi-historial` client-side. La convención documentada es "SPA simple con `window.location.pathname`".

### API de partidos
- `src/services/apifootball.ts` expone `fetchLastMatches()` → `MatchResult[]` y `fetchUpcomingMatches()` → `ProximoPartido[]`
- `MatchResult.fixtureId` (number) es el identificador único de partido
- `MatchResult` tiene: `fixtureId`, `date` (ISO string), `homeTeam`, `awayTeam`, `goalsHome`, `goalsAway`, `competition`, `venueName`

### Design tokens disponibles
```
bg-boca-blue (#001529)         bg-boca-blue-light (#002140)    bg-boca-blue-mid (#031d46)
border-boca-border (#00396e)   border-boca-border-card (#003d7a)
text-boca-gold (#FFD700)       text-text-nav (#e0e7ff)         text-text-muted (#64748b)
bg-status-win  bg-status-loss  bg-status-draw
.type-section-title  .type-card-title  .type-body  .type-caption  .type-button
```

### Componentes de referencia para patrones de UI
- `src/components/UltimosPartidos/UltimosPartidos.tsx` → patrón para listar partidos
- `src/components/shared/SectionHeader/SectionHeader.tsx` → título de sección
- `src/components/Button/Button.tsx` → botón estándar
- `src/components/Badge/Badge.tsx` → badge/pill

### Variables de entorno
- Dev: archivo `.env` (git-ignored). Vite expone `VITE_*` como `import.meta.env.VITE_*`
- Deploy: `npm run deploy` = `tsc && vite build && wrangler deploy`. Las vars VITE_* se **compilan en el bundle** → deben estar en el entorno al momento del build
- La `SUPABASE_ANON_KEY` es pública por diseño (RLS protege los datos); puede estar en vars de entorno sin ser secret

---

## Interfaces TypeScript (src/types/attendance.ts)

```typescript
// src/types/attendance.ts

import type { MatchResult } from '@/services/apifootball';

/** Usuario autenticado de Supabase */
export interface AuthUser {
  id: string;       // UUID de auth.users
  email: string;
}

/** Fila en la tabla match_attendance de Supabase */
export interface MatchAttendance {
  id: string;           // UUID primary key
  userId: string;       // FK → auth.users.id
  matchId: string;      // fixtureId.toString()
  attended: boolean;
  note: string | null;  // max 280 chars
  createdAt: string;    // ISO timestamptz
  updatedAt: string;    // ISO timestamptz
}

/** Partido enriquecido con datos de asistencia del usuario */
export interface MatchWithAttendance extends MatchResult {
  attendance: MatchAttendance | null;
}

/** Payload para crear/actualizar asistencia */
export interface UpsertAttendancePayload {
  matchId: string;
  attended: boolean;
  note?: string | null;
}

/** Estado async estándar del proyecto */
export type AsyncState = 'loading' | 'error' | 'ok';
```

---

## Schema SQL completo (Supabase)

```sql
-- 1. Tabla principal
CREATE TABLE public.match_attendance (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id    varchar(32) NOT NULL,
  attended    boolean     NOT NULL DEFAULT true,
  note        text        CHECK (char_length(note) <= 280),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id)
);

-- 2. Índices
CREATE INDEX idx_match_attendance_user_id ON public.match_attendance(user_id);
CREATE INDEX idx_match_attendance_match_id ON public.match_attendance(match_id);
CREATE INDEX idx_match_attendance_user_match ON public.match_attendance(user_id, match_id);

-- 3. Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_match_attendance_updated_at
  BEFORE UPDATE ON public.match_attendance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Row Level Security
ALTER TABLE public.match_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attendance"
  ON public.match_attendance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance"
  ON public.match_attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance"
  ON public.match_attendance FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attendance"
  ON public.match_attendance FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Estructura de archivos nueva

```
src/
├── lib/
│   └── supabase.ts                  # Cliente Supabase singleton
├── types/
│   └── attendance.ts                # Interfaces TypeScript (definidas arriba)
├── hooks/
│   ├── useAuth.ts                   # Sesión + login/logout
│   └── useMatchAttendance.ts        # CRUD asistencia
└── components/
    ├── Auth/
    │   ├── index.ts
    │   ├── AuthGate.tsx             # Wrapper que requiere auth
    │   └── LoginForm.tsx            # Formulario email/password
    └── MiHistorial/
        ├── index.ts
        ├── MiHistorial.tsx          # Página principal
        ├── MatchAttendanceCard.tsx  # Card por partido con toggle + nota
        ├── AttendanceModal.tsx      # Modal para editar nota
        └── AttendanceDashboardCard.tsx  # Mini-card para dashboard (App.tsx)
```

---

## Contratos de hooks

### `useAuth` (src/hooks/useAuth.ts)
```typescript
interface UseAuthReturn {
  user: AuthUser | null;
  estado: AsyncState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}
function useAuth(): UseAuthReturn
```
- Lee sesión inicial con `supabase.auth.getSession()`
- Suscribe a `supabase.auth.onAuthStateChange`
- `login` → `supabase.auth.signInWithPassword`
- `register` → `supabase.auth.signUp`
- `logout` → `supabase.auth.signOut`

### `useMatchAttendance` (src/hooks/useMatchAttendance.ts)
```typescript
interface UseMatchAttendanceReturn {
  attendanceMap: Record<string, MatchAttendance>;  // matchId → MatchAttendance
  estado: AsyncState;
  error: string | null;
  upsert: (payload: UpsertAttendancePayload) => Promise<void>;
  remove: (matchId: string) => Promise<void>;
  totalAttended: number;
}
function useMatchAttendance(userId: string | null): UseMatchAttendanceReturn
```
- `fetchAll`: `SELECT * FROM match_attendance WHERE user_id = userId` (solo cuando userId no es null)
- `upsert`: `INSERT ... ON CONFLICT (user_id, match_id) DO UPDATE SET ...`
- `remove`: `DELETE FROM match_attendance WHERE user_id = userId AND match_id = matchId`
- `attendanceMap` es un objeto keyed por `matchId` para O(1) lookup en la UI
- `totalAttended` = `Object.values(attendanceMap).filter(a => a.attended).length`

---

## Plan de implementación por fases

---

### FASE 1 — Setup Supabase

#### Task 1: Instalar @supabase/supabase-js

**Files:**
- Modify: `package.json` (via npm)
- Create: `.env` (si no existe)
- Create: `src/lib/supabase.ts`

**Step 1: Instalar dependencia**
```bash
cd E:/desarrollo/react/la-12-digital
npm install @supabase/supabase-js
```
Expected output: `added 1 package` (sin errores)

**Step 2: Verificar que TypeScript lo encuentra**
```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: sin errores relacionados a supabase

**Step 3: Agregar variables de entorno al .env**

Crear/modificar `.env` (si no existe, crearlo; si existe, agregar al final):
```bash
# Verificar si .env existe
ls -la E:/desarrollo/react/la-12-digital/.env 2>/dev/null && echo "exists" || echo "not found"
```

Agregar al `.env`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```
> **Nota:** Reemplazar con los valores del proyecto Supabase. URL y anon key se obtienen en Supabase Dashboard → Project Settings → API.

Verificar que `.env` está en `.gitignore`:
```bash
grep -n "\.env" E:/desarrollo/react/la-12-digital/.gitignore
```
Si no está, agregar la línea `.env` al `.gitignore`.

**Step 4: Crear el cliente Supabase**

Crear `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 5: Verificar que compila**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```
Expected: sin errores

**Step 6: Commit**
```bash
git add src/lib/supabase.ts package.json package-lock.json
git commit -m "feat: add Supabase client (supabase.ts) and install @supabase/supabase-js"
```

---

#### Task 2: Crear schema en Supabase

**Files:**
- No hay archivos locales — se ejecuta en el Supabase Dashboard SQL Editor

**Step 1: Ejecutar SQL de creación de tabla**

En Supabase Dashboard → SQL Editor, ejecutar el SQL completo definido en la sección "Schema SQL completo" de este documento (tabla + índices + trigger + RLS policies).

**Step 2: Verificar en Table Editor**

En Supabase Dashboard → Table Editor → match_attendance:
- Verificar que existen las columnas: id, user_id, match_id, attended, note, created_at, updated_at
- Verificar que RLS está habilitado (candado cerrado en la tabla)

**Step 3: Verificar las policies en Authentication → Policies**

Deben aparecer 4 policies para match_attendance: SELECT, INSERT, UPDATE, DELETE.

**Step 4: Verificar que la restricción UNIQUE funciona**

```sql
-- En SQL Editor de Supabase
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'match_attendance';
```
Expected: aparece `match_attendance_user_id_match_id_key` como UNIQUE constraint.

---

### FASE 2 — Tipos e interfaces

#### Task 3: Crear src/types/attendance.ts

**Files:**
- Create: `src/types/attendance.ts`

**Step 1: Crear el archivo**

Crear `src/types/attendance.ts` con el contenido exacto definido en la sección "Interfaces TypeScript" de este documento.

**Step 2: Verificar tipado**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```
Expected: sin errores

**Step 3: Commit**
```bash
git add src/types/attendance.ts
git commit -m "feat: add TypeScript interfaces for attendance feature"
```

---

### FASE 3 — Auth

#### Task 4: Implementar hook useAuth

**Files:**
- Create: `src/hooks/useAuth.ts`

**Step 1: Crear el hook**

Crear `src/hooks/useAuth.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthUser, AsyncState } from '@/types/attendance';

interface UseAuthReturn {
  user: AuthUser | null;
  estado: AsyncState;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [estado, setEstado] = useState<AsyncState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
      }
      setEstado('ok');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) setError(authError.message);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, estado, error, login, register, logout };
}
```

**Step 2: Verificar tipado**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```
Expected: sin errores

**Step 3: Commit**
```bash
git add src/hooks/useAuth.ts
git commit -m "feat: implement useAuth hook with Supabase email/password auth"
```

---

#### Task 5: Crear componente LoginForm

**Files:**
- Create: `src/components/Auth/LoginForm.tsx`
- Create: `src/components/Auth/index.ts`

**Step 1: Crear LoginForm.tsx**

Crear `src/components/Auth/LoginForm.tsx`:
```typescript
import { useState } from 'react';
import type { UseAuthReturn } from '@/hooks/useAuth';

interface LoginFormProps {
  onLogin: UseAuthReturn['login'];
  onRegister: UseAuthReturn['register'];
  error: string | null;
}

export function LoginForm({ onLogin, onRegister, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      await onLogin(email, password);
    } else {
      await onRegister(email, password);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-boca-blue flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-boca-blue-light border border-boca-border rounded-xl p-8">
        <div className="text-center mb-6">
          <span className="text-boca-gold type-section-title">La 12 Digital</span>
          <p className="text-text-muted type-caption mt-1">
            {mode === 'login' ? 'Iniciá sesión para ver tu historial' : 'Creá tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="type-caption text-text-nav block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-boca-blue border border-boca-border rounded-lg px-3 py-2 text-white type-body focus:outline-none focus:border-boca-gold"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="type-caption text-text-nav block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-boca-blue border border-boca-border rounded-lg px-3 py-2 text-white type-body focus:outline-none focus:border-boca-gold"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="type-caption text-status-negative text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-boca-gold text-text-on-gold type-button font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <button
          onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
          className="w-full mt-4 type-caption text-text-muted hover:text-text-nav transition-colors text-center"
        >
          {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </div>
    </div>
  );
}
```

> **Nota sobre tipos:** El prop `onLogin` debe tomar el tipo directamente, no referenciar `UseAuthReturn['login']` si genera problemas con exports. Alternativa: `onLogin: (email: string, password: string) => Promise<void>`.

**Step 2: Crear index.ts**
```typescript
// src/components/Auth/index.ts
export { LoginForm } from './LoginForm';
export { AuthGate } from './AuthGate';
```
> AuthGate aún no existe — se creará en Task 6. Comentar esa línea hasta entonces.

**Step 3: Verificar tipado**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```

**Step 4: Commit**
```bash
git add src/components/Auth/
git commit -m "feat: add LoginForm component with email/password auth"
```

---

#### Task 6: Crear componente AuthGate

**Files:**
- Create: `src/components/Auth/AuthGate.tsx`

`AuthGate` envuelve contenido que requiere autenticación. Si el usuario no está logueado, muestra `LoginForm`.

**Step 1: Crear AuthGate.tsx**
```typescript
// src/components/Auth/AuthGate.tsx
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, estado, error, login, register } = useAuth();

  if (estado === 'loading') {
    return (
      <div className="min-h-screen bg-boca-blue flex items-center justify-center">
        <p className="type-body text-text-muted">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} onRegister={register} error={error} />;
  }

  return <>{children}</>;
}
```

**Step 2: Descomentar la exportación en index.ts**

En `src/components/Auth/index.ts`, descomentar la línea `export { AuthGate }`.

**Step 3: Verificar tipado**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```

**Step 4: Commit**
```bash
git add src/components/Auth/AuthGate.tsx src/components/Auth/index.ts
git commit -m "feat: add AuthGate wrapper component for protected routes"
```

---

### FASE 4 — Hook useMatchAttendance

#### Task 7: Implementar useMatchAttendance

**Files:**
- Create: `src/hooks/useMatchAttendance.ts`

**Step 1: Crear el hook**

Crear `src/hooks/useMatchAttendance.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { MatchAttendance, UpsertAttendancePayload, AsyncState } from '@/types/attendance';

// Tipo que mapea la fila de Supabase (snake_case) a nuestra interfaz (camelCase)
type DBRow = {
  id: string;
  user_id: string;
  match_id: string;
  attended: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
};

function rowToAttendance(row: DBRow): MatchAttendance {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    attended: row.attended,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface UseMatchAttendanceReturn {
  attendanceMap: Record<string, MatchAttendance>;
  estado: AsyncState;
  error: string | null;
  upsert: (payload: UpsertAttendancePayload) => Promise<void>;
  remove: (matchId: string) => Promise<void>;
  totalAttended: number;
}

export function useMatchAttendance(userId: string | null): UseMatchAttendanceReturn {
  const [attendanceMap, setAttendanceMap] = useState<Record<string, MatchAttendance>>({});
  const [estado, setEstado] = useState<AsyncState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setAttendanceMap({});
      setEstado('ok');
      return;
    }

    setEstado('loading');
    supabase
      .from('match_attendance')
      .select('*')
      .eq('user_id', userId)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
          setEstado('error');
          return;
        }
        const map: Record<string, MatchAttendance> = {};
        for (const row of (data ?? []) as DBRow[]) {
          const attendance = rowToAttendance(row);
          map[attendance.matchId] = attendance;
        }
        setAttendanceMap(map);
        setEstado('ok');
      });
  }, [userId]);

  const upsert = useCallback(async ({ matchId, attended, note }: UpsertAttendancePayload) => {
    if (!userId) return;
    setError(null);

    const { data, error: upsertError } = await supabase
      .from('match_attendance')
      .upsert(
        { user_id: userId, match_id: matchId, attended, note: note ?? null },
        { onConflict: 'user_id,match_id' }
      )
      .select()
      .single();

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setAttendanceMap(prev => ({
      ...prev,
      [matchId]: rowToAttendance(data as DBRow),
    }));
  }, [userId]);

  const remove = useCallback(async (matchId: string) => {
    if (!userId) return;
    setError(null);

    const { error: deleteError } = await supabase
      .from('match_attendance')
      .delete()
      .eq('user_id', userId)
      .eq('match_id', matchId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setAttendanceMap(prev => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
  }, [userId]);

  const totalAttended = Object.values(attendanceMap).filter(a => a.attended).length;

  return { attendanceMap, estado, error, upsert, remove, totalAttended };
}
```

**Step 2: Verificar tipado**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```
Expected: sin errores

**Step 3: Commit**
```bash
git add src/hooks/useMatchAttendance.ts
git commit -m "feat: implement useMatchAttendance hook with Supabase CRUD"
```

---

### FASE 5 — UI de Mi Historial

#### Task 8: Crear AttendanceModal

**Files:**
- Create: `src/components/MiHistorial/AttendanceModal.tsx`

Modal para editar la nota de un partido. Se abre al hacer click en "Agregar nota".

**Step 1: Crear el componente**
```typescript
// src/components/MiHistorial/AttendanceModal.tsx
import { useState, useEffect } from 'react';
import type { MatchResult } from '@/services/apifootball';
import type { MatchAttendance } from '@/types/attendance';

const MAX_NOTE_LENGTH = 280;

interface AttendanceModalProps {
  match: MatchResult;
  attendance: MatchAttendance | null;
  onSave: (note: string | null) => void;
  onClose: () => void;
}

export function AttendanceModal({ match, attendance, onSave, onClose }: AttendanceModalProps) {
  const [note, setNote] = useState(attendance?.note ?? '');

  useEffect(() => {
    setNote(attendance?.note ?? '');
  }, [attendance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(note.trim() || null);
    onClose();
  };

  const homeTeamName = match.homeTeam.name;
  const awayTeamName = match.awayTeam.name;
  const dateStr = new Date(match.date).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-modal-backdrop)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-boca-blue-light border border-boca-border rounded-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4">
          <p className="type-caption text-text-muted">{dateStr} · {match.competition}</p>
          <p className="type-card-title text-white mt-0.5">
            {homeTeamName} vs {awayTeamName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="type-caption text-text-nav block mb-1">
              Tu nota sobre este partido
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
              rows={4}
              placeholder="Ej: Fue increíble, 3-0 en La Bombonera..."
              className="w-full bg-boca-blue border border-boca-border rounded-lg px-3 py-2 text-white type-body resize-none focus:outline-none focus:border-boca-gold"
            />
            <p className="type-caption text-text-muted text-right mt-1">
              {note.length}/{MAX_NOTE_LENGTH}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-boca-border text-text-nav type-button py-2 rounded-lg hover:border-boca-gold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-boca-gold text-text-on-gold type-button font-bold py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Step 2: Verificar tipado**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```

**Step 3: Commit**
```bash
git add src/components/MiHistorial/AttendanceModal.tsx
git commit -m "feat: add AttendanceModal component for editing match notes"
```

---

#### Task 9: Crear MatchAttendanceCard

**Files:**
- Create: `src/components/MiHistorial/MatchAttendanceCard.tsx`

Card por partido. Muestra el partido con el resultado, toggle de asistencia y botón para nota.

**Step 1: Crear el componente**
```typescript
// src/components/MiHistorial/MatchAttendanceCard.tsx
import { useState } from 'react';
import type { MatchResult } from '@/services/apifootball';
import type { MatchAttendance } from '@/types/attendance';
import { AttendanceModal } from './AttendanceModal';

interface MatchAttendanceCardProps {
  match: MatchResult;
  attendance: MatchAttendance | null;
  onToggle: (matchId: string, attended: boolean) => void;
  onUpdateNote: (matchId: string, note: string | null) => void;
  onRemove: (matchId: string) => void;
}

export function MatchAttendanceCard({
  match, attendance, onToggle, onUpdateNote, onRemove,
}: MatchAttendanceCardProps) {
  const [showModal, setShowModal] = useState(false);

  const matchId = match.fixtureId.toString();
  const attended = attendance?.attended ?? false;
  const dateStr = new Date(match.date).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  // Determinar resultado para badge de color
  const bocaIsHome = match.homeTeam.id === 451;
  const bocaGoals = bocaIsHome ? match.goalsHome : match.goalsAway;
  const rivalGoals = bocaIsHome ? match.goalsAway : match.goalsHome;
  const resultColor =
    bocaGoals !== null && rivalGoals !== null
      ? bocaGoals > rivalGoals ? 'bg-status-win' :
        bocaGoals < rivalGoals ? 'bg-status-loss' : 'bg-status-draw'
      : 'bg-boca-blue-mid';

  const handleToggle = () => {
    if (attended) {
      onRemove(matchId);
    } else {
      onToggle(matchId, true);
    }
  };

  const handleSaveNote = (note: string | null) => {
    onUpdateNote(matchId, note);
  };

  return (
    <>
      <div className="bg-boca-blue-light border border-boca-border rounded-xl p-4 flex flex-col gap-3">
        {/* Header: fecha, competencia, resultado */}
        <div className="flex items-center justify-between">
          <div>
            <p className="type-caption text-text-muted">{dateStr}</p>
            <p className="type-caption text-text-muted">{match.competition}</p>
          </div>
          {bocaGoals !== null && rivalGoals !== null && (
            <span className={`${resultColor} type-caption text-white px-2 py-0.5 rounded-md font-bold`}>
              {bocaGoals} – {rivalGoals}
            </span>
          )}
        </div>

        {/* Equipos */}
        <div className="flex items-center gap-2">
          <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-6 h-6 object-contain" />
          <span className="type-body text-white flex-1">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </span>
          <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-6 h-6 object-contain" />
        </div>

        {/* Nota (si existe) */}
        {attendance?.note && (
          <p className="type-caption text-text-muted italic border-l-2 border-boca-gold pl-2">
            "{attendance.note}"
          </p>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleToggle}
            className={[
              'flex-1 type-button py-2 rounded-lg border transition-colors',
              attended
                ? 'bg-boca-gold text-text-on-gold border-boca-gold font-bold'
                : 'bg-transparent text-text-muted border-boca-border hover:border-boca-gold hover:text-text-nav',
            ].join(' ')}
          >
            {attended ? '✓ Estuve ahí' : 'Estuve en este partido'}
          </button>

          {attended && (
            <button
              onClick={() => setShowModal(true)}
              className="type-caption text-text-muted border border-boca-border px-3 py-2 rounded-lg hover:border-boca-gold hover:text-text-nav transition-colors"
            >
              {attendance?.note ? 'Editar nota' : 'Nota'}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <AttendanceModal
          match={match}
          attendance={attendance}
          onSave={handleSaveNote}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

**Step 2: Verificar tipado**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```

**Step 3: Commit**
```bash
git add src/components/MiHistorial/MatchAttendanceCard.tsx
git commit -m "feat: add MatchAttendanceCard with attendance toggle and note editing"
```

---

#### Task 10: Crear AttendanceDashboardCard

**Files:**
- Create: `src/components/MiHistorial/AttendanceDashboardCard.tsx`

Mini-card para el dashboard principal que muestra el total de partidos asistidos.

**Step 1: Crear el componente**
```typescript
// src/components/MiHistorial/AttendanceDashboardCard.tsx
interface AttendanceDashboardCardProps {
  total: number;
  onNavigate: () => void;
}

export function AttendanceDashboardCard({ total, onNavigate }: AttendanceDashboardCardProps) {
  return (
    <button
      onClick={onNavigate}
      className="group w-full bg-boca-blue-light border border-boca-border rounded-xl p-5 flex items-center justify-between hover:border-boca-gold transition-colors text-left"
    >
      <div>
        <p className="type-caption text-text-muted">Mi Historial</p>
        <p className="type-section-title text-boca-gold mt-0.5">
          {total}
          <span className="type-body text-text-muted ml-2 font-normal">
            {total === 1 ? 'partido' : 'partidos'} asistidos
          </span>
        </p>
      </div>
      <span className="type-button text-text-muted group-hover:text-boca-gold transition-colors">
        Ver historial →
      </span>
    </button>
  );
}
```

**Step 2: Commit**
```bash
git add src/components/MiHistorial/AttendanceDashboardCard.tsx
git commit -m "feat: add AttendanceDashboardCard for dashboard integration"
```

---

#### Task 11: Crear página MiHistorial

**Files:**
- Create: `src/components/MiHistorial/MiHistorial.tsx`
- Create: `src/components/MiHistorial/index.ts`

**Step 1: Crear MiHistorial.tsx**
```typescript
// src/components/MiHistorial/MiHistorial.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMatchAttendance } from '@/hooks/useMatchAttendance';
import { fetchLastMatches } from '@/services/apifootball';
import { MatchAttendanceCard } from './MatchAttendanceCard';
import { AuthGate } from '@/components/Auth';
import type { MatchResult } from '@/services/apifootball';
import type { AsyncState } from '@/types/attendance';

interface MiHistorialProps {
  onNavigateHome: () => void;
}

function MiHistorialContent({ onNavigateHome }: MiHistorialProps) {
  const { user, logout } = useAuth();
  const { attendanceMap, estado: attendanceEstado, upsert, remove } = useMatchAttendance(user?.id ?? null);

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchEstado, setMatchEstado] = useState<AsyncState>('loading');

  useEffect(() => {
    fetchLastMatches()
      .then(data => { setMatches(data); setMatchEstado('ok'); })
      .catch(() => setMatchEstado('error'));
  }, []);

  const handleToggle = async (matchId: string, attended: boolean) => {
    await upsert({ matchId, attended });
  };

  const handleUpdateNote = async (matchId: string, note: string | null) => {
    const existing = attendanceMap[matchId];
    if (existing) {
      await upsert({ matchId, attended: existing.attended, note });
    }
  };

  const handleRemove = async (matchId: string) => {
    await remove(matchId);
  };

  const isLoading = matchEstado === 'loading' || attendanceEstado === 'loading';

  return (
    <div className="min-h-screen bg-app-bg text-white">
      {/* Header de la página */}
      <div className="border-b border-boca-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="type-caption text-text-muted hover:text-text-nav transition-colors"
          >
            ← Inicio
          </button>
          <span className="text-boca-border">|</span>
          <h1 className="type-section-title text-white">Mi Historial</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="type-caption text-text-muted">{user?.email}</span>
          <button
            onClick={logout}
            className="type-caption text-text-muted hover:text-status-negative transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading && (
          <p className="type-body text-text-muted text-center py-12">Cargando partidos...</p>
        )}

        {matchEstado === 'error' && (
          <p className="type-body text-status-negative text-center py-12">
            Error al cargar los partidos. Intentá de nuevo más tarde.
          </p>
        )}

        {matchEstado === 'ok' && matches.length === 0 && (
          <p className="type-body text-text-muted text-center py-12">
            No hay partidos recientes disponibles.
          </p>
        )}

        {matchEstado === 'ok' && matches.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="type-caption text-text-muted">
              Últimos {matches.length} partidos de Boca. Marcá los que presenciaste.
            </p>
            {matches.map(match => (
              <MatchAttendanceCard
                key={match.fixtureId}
                match={match}
                attendance={attendanceMap[match.fixtureId.toString()] ?? null}
                onToggle={handleToggle}
                onUpdateNote={handleUpdateNote}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MiHistorial(props: MiHistorialProps) {
  return (
    <AuthGate>
      <MiHistorialContent {...props} />
    </AuthGate>
  );
}
```

**Step 2: Crear index.ts**
```typescript
// src/components/MiHistorial/index.ts
export { MiHistorial } from './MiHistorial';
export { AttendanceDashboardCard } from './AttendanceDashboardCard';
```

**Step 3: Verificar tipado**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```
Expected: sin errores

**Step 4: Commit**
```bash
git add src/components/MiHistorial/
git commit -m "feat: add MiHistorial page component with matches list and attendance tracking"
```

---

### FASE 6 — Routing y dashboard

#### Task 12: Agregar routing a App.tsx

**Files:**
- Modify: `src/App.tsx`

Se agrega un mini-router basado en `window.location.pathname` + `window.history.pushState`.

**Step 1: Entender el patrón actual**

Leer `src/App.tsx` completo antes de modificar (ya leído en la exploración).

**Step 2: Modificar App.tsx**

En `src/App.tsx`, agregar:
1. El import de `MiHistorial` y `AttendanceDashboardCard`
2. El import de `useAuth` y `useMatchAttendance`
3. Estado `currentPath` con `window.location.pathname`
4. `useEffect` para `popstate`
5. Función `navigate`
6. Renderizado condicional por ruta

```typescript
// Agregar imports al inicio de App.tsx (mantener los existentes):
import { useState, useEffect } from 'react';
import { MiHistorial, AttendanceDashboardCard } from './components/MiHistorial';
import { useAuth } from './hooks/useAuth';
import { useMatchAttendance } from './hooks/useMatchAttendance';

// En el componente App, antes del return:
const [currentPath, setCurrentPath] = useState(window.location.pathname);

const navigate = (path: string) => {
  window.history.pushState({}, '', path);
  setCurrentPath(path);
};

useEffect(() => {
  const handler = () => setCurrentPath(window.location.pathname);
  window.addEventListener('popstate', handler);
  return () => window.removeEventListener('popstate', handler);
}, []);

// Ruta /mi-historial
if (currentPath === '/mi-historial') {
  return <MiHistorial onNavigateHome={() => navigate('/')} />;
}
```

Para el dashboard card, agregar `useAuth` y `useMatchAttendance` al scope del componente, y dentro del JSX del dashboard principal:
```tsx
// Dentro del return principal del dashboard, agregar en la sección de partidos:
const { user } = useAuth();
const { totalAttended } = useMatchAttendance(user?.id ?? null);

// Y en el JSX, agregar antes de ProximosPartidos:
<AttendanceDashboardCard
  total={totalAttended}
  onNavigate={() => navigate('/mi-historial')}
/>
```

> **Nota de implementación:** Leer el App.tsx actual completo antes de modificar para no romper la estructura existente. Los estados `sidebarCollapsed` y `currentPath` deben coexistir. El `useEffect` para popstate va dentro del componente App, junto con el existente (o combinado).

**Step 3: Verificar tipado**
```bash
cd E:/desarrollo/react/la-12-digital && npx tsc --noEmit
```

**Step 4: Verificar en browser**
```bash
npm run dev
```
- Navegar a `http://localhost:3000` → debe verse el dashboard normal con el card nuevo
- Hacer click en el card o ir a `http://localhost:3000/mi-historial` → debe mostrar LoginForm
- Loguearse → debe mostrar la lista de partidos
- Browser back button → debe volver al dashboard

**Step 5: Commit**
```bash
git add src/App.tsx
git commit -m "feat: add /mi-historial route and attendance dashboard card to App.tsx"
```

---

### FASE 7 — Link en Sidebar

#### Task 13: Agregar link al Sidebar

**Files:**
- Modify: `src/components/Sidebar/Sidebar.tsx` (o DesktopSidebarBubble.tsx / MobileSidebarButton.tsx según corresponda)

**Step 1: Leer el Sidebar actual**

Leer `src/components/Sidebar/Sidebar.tsx` para entender la estructura de nav items.

**Step 2: Agregar nav item**

En el array de navigation items del Sidebar, agregar:
```typescript
{ label: 'Mi Historial', path: '/mi-historial', icon: /* usar un ícono de lucide-react apropiado */ }
```

El ícono sugerido: `ClipboardList` o `History` de `lucide-react`.

El click en el item debe usar `window.history.pushState` + disparar un `popstate` event (o mejor: aceptar un prop `onNavigate` que venga de App.tsx).

> **Nota:** Evaluar si el Sidebar ya tiene un mecanismo de navegación o si solo usa `<a href>`. Si usa `<a href>`, el SPA routing ya funciona porque el Worker sirve `index.html` para cualquier path. Si prefiere no recargar la página, usar el prop `onNavigate`.

**Step 3: Verificar visualmente**
```bash
npm run dev
```
Verificar que el link aparece en el sidebar y navega correctamente.

**Step 4: Commit**
```bash
git add src/components/Sidebar/
git commit -m "feat: add Mi Historial link to Sidebar navigation"
```

---

## Consideraciones de deploy en Cloudflare Workers

### Variables de entorno en build time

Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son **compiladas en el bundle** por Vite durante `npm run build`. No son runtime secrets de Worker.

**Local (dev):** Agregar al `.env`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**Deploy desde CI (GitHub Actions):**
```yaml
- name: Deploy
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  run: npm run deploy
```

**Deploy manual desde la máquina:** Tener el `.env` presente antes de `npm run deploy`.

### Supabase JS y Cloudflare Workers — sin conflicto

El cliente `@supabase/supabase-js` corre **en el browser** (React app), no en el Cloudflare Worker. El Worker solo sirve los assets estáticos del build. No hay incompatibilidad.

El Worker en `worker.js` no necesita modificaciones para soportar esta feature.

### CORS de Supabase

Supabase permite requests desde cualquier origen por defecto. Para restringirlo, en Supabase Dashboard → Authentication → URL Configuration, agregar el dominio de producción (ej: `https://la-12-digital.workers.dev`) como sitio permitido.

### SPA routing

`wrangler.jsonc` ya tiene `"not_found_handling": "single-page-application"` — cualquier path devuelve `index.html`. La ruta `/mi-historial` funciona sin cambios en el Worker.

---

## Checklist de verificación final

- [ ] `npm run dev` arranca sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] `npm run lint` sin warnings
- [ ] Dashboard muestra el card de "Mi Historial" con contador
- [ ] Click en card navega a `/mi-historial` sin reload
- [ ] URL `/mi-historial` sin sesión muestra LoginForm
- [ ] Register crea cuenta en Supabase (verificar en Dashboard → Auth → Users)
- [ ] Login exitoso muestra lista de partidos
- [ ] Toggle "Estuve ahí" persiste en Supabase (verificar en Table Editor)
- [ ] Agregar nota guarda en la columna `note`
- [ ] Eliminar asistencia borra la fila
- [ ] Browser back/forward navega correctamente
- [ ] `npm run build` compila sin errores (con las VITE_ vars en entorno)
- [ ] `npm run deploy` deploya correctamente
- [ ] En producción, `/mi-historial` sirve el SPA correctamente

---

**Plan completo y guardado en `docs/plans/2026-04-03-mi-historial-partidos.md`.**

**Dos opciones de ejecución:**

**1. Subagent-Driven (esta sesión)** — Despacho un subagente fresco por tarea, revisión entre tareas, iteración rápida

**2. Parallel Session (sesión separada)** — Abrí una nueva sesión apuntando a este plan con el skill `executing-plans`, ejecución en batch con checkpoints

**¿Cuál preferís?**
