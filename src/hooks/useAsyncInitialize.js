import { useEffect, useState } from "react";

/**
 * @dev Async state initializer for TON provider instances
 */
export function useAsyncInitialize(func, deps = []) {
  const [state, setState] = useState(null);

  useEffect(() => {
    (async () => {
      setState(await func());
    })();
  }, deps);

  return state;
}
