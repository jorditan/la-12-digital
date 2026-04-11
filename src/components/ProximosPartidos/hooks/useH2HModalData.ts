import { useMemo } from 'react';
import { useHeadToHead } from '../../../hooks/useHeadToHead';
import { isFinishedH2HResult } from '../utils';

export function useH2HModalData(rivalId: number) {
  const { status, data, error, retry } = useHeadToHead(rivalId);

  const finished = useMemo(
    () => (data ?? []).filter(isFinishedH2HResult),
    [data],
  );

  const summary = useMemo(() => ({
    win: finished.filter((match) => match.result === 'win').length,
    draw: finished.filter((match) => match.result === 'draw').length,
    loss: finished.filter((match) => match.result === 'loss').length,
  }), [finished]);

  return {
    status,
    finished,
    summary,
    error,
    retry,
  };
}
