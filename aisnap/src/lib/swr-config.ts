import useSWR from 'swr';

// 数据获取函数
export const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 用户信息获取hook
export function useUser(userId: string | null) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/users/${userId}` : null,
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: error,
  };
}

// 转换历史获取hook
export function useConversions(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/conversions?userId=${userId}` : '/api/conversions',
    fetcher
  );

  return {
    conversions: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// 单个转换记录获取hook
export function useConversion(conversionId: string | null) {
  const { data, error, isLoading } = useSWR(
    conversionId ? `/api/conversions/${conversionId}` : null,
    fetcher
  );

  return {
    conversion: data,
    isLoading,
    isError: error,
  };
}