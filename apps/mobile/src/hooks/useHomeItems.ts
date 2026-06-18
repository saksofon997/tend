import type { ItemResponse } from "@/types";
import type { TendApi } from "@api/tendApi";
import { t } from "@i18n";
import type { LifeArea } from "@tend/domain";
import { getErrorMessage } from "@utils/networkError";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useHomeItems(api: TendApi) {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lifeAreaFilter, setLifeAreaFilter] = useState<LifeArea | null>(null);

  const loadItems = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) {
        setRefreshing(true);
      }

      setError(null);
      try {
        const body = await api.listItems();
        setItems(body.items);
      } catch (loadError) {
        setError(getErrorMessage(loadError, t("errors.item.load")));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [api],
  );

  useEffect(() => {
    let mounted = true;

    async function loadInitialItems() {
      await loadItems();
      if (!mounted) {
        return;
      }
    }

    loadInitialItems();
    return () => {
      mounted = false;
    };
  }, [loadItems]);

  const markTended = useCallback(
    async (itemId: string) => {
      const body = await api.tendItem(itemId);
      setItems((current) => current.map((item) => (item.id === itemId ? body.item : item)));
    },
    [api],
  );

  const filteredItems = useMemo(() => {
    if (!lifeAreaFilter) {
      return items;
    }

    return items.filter((item) => item.lifeArea === lifeAreaFilter);
  }, [items, lifeAreaFilter]);

  const groups = useMemo(() => groupItemsByAttention(filteredItems), [filteredItems]);

  return {
    error,
    groups,
    items,
    lifeAreaFilter,
    loadItems,
    loading,
    markTended,
    refreshing,
    setLifeAreaFilter,
  };
}

function groupItemsByAttention(items: ItemResponse[]) {
  return {
    needsAttention: items.filter((item) => item.status === "needs_attention"),
    gettingStale: items.filter((item) => item.status === "getting_stale"),
    lookingGood: items.filter((item) => item.status === "fresh"),
  };
}
