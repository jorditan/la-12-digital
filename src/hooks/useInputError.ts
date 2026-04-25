import { useState, useCallback } from "react";
import { INPUT_ERROR_DURATION_MS } from "../utils/gameConfig";

export function useInputError(inputRef: React.RefObject<HTMLInputElement>) {
  const [inputError, setInputError] = useState(false);

  const triggerError = useCallback(
    (onClear: () => void) => {
      setInputError(true);
      setTimeout(() => {
        setInputError(false);
        onClear();
        inputRef.current?.focus();
      }, INPUT_ERROR_DURATION_MS);
    },
    [inputRef],
  );

  return { inputError, triggerError };
}
