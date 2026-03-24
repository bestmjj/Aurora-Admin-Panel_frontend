import { useState, useCallback } from "react";
import { useApolloClient, type DocumentNode, type TypedDocumentNode } from "@apollo/client";

interface UseSubscribeResult<TData = Record<string, unknown>> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  subscribe: () => (() => void);
}

function useSubscribe<TData = Record<string, unknown>, TVariables = Record<string, unknown>>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
): UseSubscribeResult<TData> {
  const client = useApolloClient();
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const subscribe = useCallback(() => {
    setLoading(true);
    setError(null);
    const subscription = client
      .subscribe({
        query,
        variables,
      })
      .subscribe({
        next: (result) => {
          setData(result.data as TData);
          setLoading(false);
        },
        error: (err) => {
          setError(err);
          setLoading(false);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, variables, query]);

  return { data, loading, error, subscribe };
}

export default useSubscribe;
