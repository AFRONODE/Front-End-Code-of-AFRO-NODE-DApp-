import { useEffect, useState } from "react";

// This is a utility hook used by useTonClient to initialize the TonClient instance only once.
export function useAsyncInitialize(func, deps = []) {
  const [state, setState] = useState(null);

  useEffect(() => {
    (async () => {
      setState(await func());
    })();
  }, deps);

  return state;
}
