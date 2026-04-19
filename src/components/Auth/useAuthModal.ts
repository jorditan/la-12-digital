import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UseAuthModalProps {
  onLogin: (email: string, password: string) => Promise<{ error?: string }>;
  onRegister: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  onClose: () => void;
}

export function useAuthModal({
  onLogin,
  onRegister,
  onClose,
}: UseAuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset error when switching mode
  useEffect(() => {
    setLocalError(null);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (mode === "register") {
      if (displayName.trim().length < 2) {
        setLocalError("El nombre debe tener al menos 2 caracteres.");
        return;
      }
      if (password.length < 8) {
        setLocalError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const result = await onLogin(email, password);
        if (result.error) setLocalError(translateError(result.error));
        // If success, user state changes → App closes modal automatically
      } else {
        const result = await onRegister(email, password, displayName.trim());
        if (result.error) {
          setLocalError(translateError(result.error));
        } else if (result.needsConfirmation) {
          toast.info("¡Revisá tu correo!", {
            description: `Te enviamos un link de confirmación a ${email}`,
            duration: 6000,
          });
          onClose();
        }
        // If no confirmation needed, user state change closes the modal
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    showPassword,
    setShowPassword,
    mode,
    setMode,
    loading,
    localError,
    handleSubmit,
  };
}

function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "Email o contraseña incorrectos.";
  if (msg.includes("Email not confirmed"))
    return "Confirmá tu email antes de iniciar sesión.";
  if (msg.includes("User already registered"))
    return "Ya existe una cuenta con ese email.";
  if (msg.includes("Password should be at least"))
    return "La contraseña debe tener al menos 8 caracteres.";
  if (msg.includes("Unable to validate email")) return "El email no es válido.";
  return msg;
}
