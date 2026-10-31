import { useEffect, useRef, useSyncExternalStore } from "react";

const dirtyEditors = new Set<symbol>();
let uploads = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
export function uploadStarted() {
  uploads++;
  emit();
}
export function uploadFinished() {
  uploads = Math.max(0, uploads - 1);
  emit();
}
export const hasUploads = () => uploads > 0;
export const hasUnsaved = () => dirtyEditors.size > 0;
export function confirmLeave() {
  if (hasUploads()) {
    window.alert("Зураг оруулж дуусахыг хүлээнэ үү.");
    return false;
  }
  return !hasUnsaved() || window.confirm("Хадгалаагүй өөрчлөлт байна. Хадгалахгүйгээр гарах уу?");
}
export function useUploadPending() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    hasUploads,
    () => false,
  );
}
export function useDirtyEditor() {
  const id = useRef(Symbol("editor"));
  useEffect(() => {
    const key = id.current;
    return () => {
      dirtyEditors.delete(key);
    };
  }, []);
  return {
    mark: () => dirtyEditors.add(id.current),
    clean: () => dirtyEditors.delete(id.current),
    set: (dirty: boolean) =>
      dirty ? dirtyEditors.add(id.current) : dirtyEditors.delete(id.current),
  };
}
