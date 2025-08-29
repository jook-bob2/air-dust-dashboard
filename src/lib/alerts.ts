/*
  Centralized SweetAlert2 helpers
  - Lazy-loads sweetalert2 for performance (no bundle impact until first use)
  - Single place to manage defaults for modals/alerts/confirms/toasts
  - Simple API surface for consumers

  Usage (client components only):
    import { $alert, $confirm, $modal, $toast } from '@/lib/alerts';

    await $alert('완료되었습니다');
    const ok = await $confirm('정말 삭제하시겠어요?');
    // if (ok) { ... }

    await $modal({ title: '커스텀', html: '<b>내용</b>' });
    await $toast('업데이트됨', 'success');
*/

import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

// Keep a cached promise so we only load the library once.
type SwalInstance = (typeof import('sweetalert2'))['default'];
let _swalPromise: Promise<SwalInstance> | null = null;

async function getSwal(): Promise<SwalInstance> {
  if (typeof window === 'undefined') {
    throw new Error('alerts can only be used in the browser (client components)');
  }
  if (!_swalPromise) {
    _swalPromise = import('sweetalert2').then(m => m.default as SwalInstance);
  }
  return _swalPromise;
}

// Centralized defaults (tweak here to adjust app-wide behaviour)
const BASE_DEFAULTS: SweetAlertOptions = {
  heightAuto: false, // prevent layout shifts on mobile
  backdrop: true,
  buttonsStyling: true,
  // Minimal animation for faster UI feedback
  showClass: { popup: 'swal2-noanimation' },
  hideClass: { popup: '' },
  confirmButtonColor: '#3b82f6', // tailwind blue-500
  cancelButtonColor: '#6b7280', // tailwind gray-500
};

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'question';

function withDefaults<T extends SweetAlertOptions>(options?: T): T {
  // Preserve the discriminated union subtype of SweetAlertOptions by returning the same generic T.
  // BASE_DEFAULTS only contains common fields, so this cast is safe and avoids union-widening errors.
  return { ...BASE_DEFAULTS, ...(options ?? {}) } as T;
}

// Alert helper (simple OK dialog)
export async function $alert(
  message: string,
  options?: SweetAlertOptions & { title?: string; type?: AlertType },
): Promise<SweetAlertResult<unknown>> {
  const Swal = await getSwal();
  const { title, type, ...rest } = options ?? {};
  return Swal.fire(
    withDefaults({
      icon: type ?? 'info',
      title,
      text: message,
      confirmButtonText: rest.confirmButtonText ?? '확인',
      ...rest,
    }),
  );
}

// Confirm helper returning boolean
export async function $confirm(message: string, options?: SweetAlertOptions & { title?: string }): Promise<boolean> {
  const Swal = await getSwal();
  const { title, ...rest } = options ?? {};
  const result = await Swal.fire(
    withDefaults({
      icon: rest.icon ?? 'question',
      title: title ?? '확인',
      text: message,
      showCancelButton: true,
      reverseButtons: true,
      focusCancel: true,
      confirmButtonText: rest.confirmButtonText ?? '예',
      cancelButtonText: rest.cancelButtonText ?? '아니오',
      allowOutsideClick: rest.allowOutsideClick ?? false,
      ...rest,
    }),
  );
  return !!result.isConfirmed;
}

// Generic modal for full control
export async function $modal(options: SweetAlertOptions): Promise<SweetAlertResult<unknown>> {
  const Swal = await getSwal();
  return Swal.fire(withDefaults(options));
}

// Toast helper (non-blocking)
type SwalToast = ReturnType<SwalInstance['mixin']>;
let _toastMixin: SwalToast | null = null;
export async function $toast(message: string, type: AlertType = 'info', options?: SweetAlertOptions) {
  const Swal = await getSwal();
  if (!_toastMixin) {
    _toastMixin = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }
  return _toastMixin.fire(
    withDefaults({
      icon: type,
      title: message,
      ...options,
    }),
  );
}
