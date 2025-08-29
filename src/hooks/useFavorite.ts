'use client';

import { useCallback, useState, useOptimistic, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { $confirm } from '@/lib/alerts';

// 임시 로그인 플래그 (로그인 기능 도입 전까지 사용)
const TEMP_IS_LOGGED_IN = false;

type OptimisticAction = 'toggle' | boolean;

/**
 * useFavorite
 * - 단일 개체(예: 지역 키)에 대한 즐겨찾기 상태를 관리합니다.
 * - useOptimistic + startTransition 을 사용하여 낙관적 UI 업데이트를 수행합니다.
 * - 즐겨찾기 API는 아직 없으므로, 전송 부분은 TODO로 남겨둡니다.
 */
export function useFavorite(key: string, initial: boolean = false) {
  const router = useRouter();
  // 기본(실제) 상태: API 미구현이므로 현재 세션 내에서만 유지됩니다.
  const [isFav, setIsFav] = useState<boolean>(initial);

  // useOptimistic: 현재 상태 + 액션(토글/설정값)을 받아 낙관적 상태를 반환
  const [optimisticFav, addOptimistic] = useOptimistic<boolean, OptimisticAction>(isFav, (current, action) =>
    typeof action === 'boolean' ? action : !current,
  );

  const toggle = useCallback(async () => {
    // 임시 로그인 확인 시나리오
    if (!TEMP_IS_LOGGED_IN) {
      const goLogin = await $confirm('즐겨찾기는 로그인 후 사용할 수 있습니다. 로그인 페이지로 이동할까요?', {
        title: '로그인 필요',
        icon: 'info',
        confirmButtonText: '로그인',
        cancelButtonText: '취소',
        reverseButtons: true,
      });
      if (goLogin) router.push('/login');
      return; // 비로그인 상태에서는 토글 수행하지 않음
    }

    // 1) 낙관적 즉시 반영
    addOptimistic('toggle');

    // 2) 실제 전송 (미구현) - startTransition 을 사용해 백그라운드 처리
    startTransition(async () => {
      try {
        // TODO: 즐겨찾기 토글 API 호출
        // await api.toggleFavorite({ key, next: !isFav });

        // API 성공 가정: 실제 상태 동기화
        setIsFav(prev => !prev);
      } catch (e) {
        // 실패 시 롤백: 동일 토글을 다시 적용하여 이전 상태로 복귀
        console.log('favorite toggle error ', e);
        addOptimistic('toggle');
      }
    });
  }, [addOptimistic, router]);

  return { isFavorite: optimisticFav, toggle };
}
