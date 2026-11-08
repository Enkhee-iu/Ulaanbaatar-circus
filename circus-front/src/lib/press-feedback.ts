// Two things CSS can't do alone, both drawn by the press rules at the end of styles.css:
// - The ripple on text buttons starts where the finger or pointer lands, so this records that point.
// - :active never turns on when a script cancels the pointer press, as the gallery carousel does to
//   allow dragging, so a press is also marked with data-pressing until the pointer lets go.
const PRESSABLE =
  "button:not(:disabled), .button, .ad-button, .icon-button, .section-heading .text-link, [role='button']";
const RIPPLE_TARGETS = ".button, .ad-button, .section-heading .text-link";

export function installPressFeedback() {
  let held: HTMLElement | null = null;
  const release = () => {
    if (held) delete held.dataset.pressing;
    held = null;
  };
  const press = (event: PointerEvent) => {
    if (event.button !== 0 || !(event.target instanceof Element)) return;
    release();
    const pressable = event.target.closest<HTMLElement>(PRESSABLE);
    if (!pressable || pressable.matches(":disabled, [aria-disabled='true']")) return;
    held = pressable;
    pressable.dataset.pressing = "";

    const target = event.target.closest<HTMLElement>(RIPPLE_TARGETS);
    if (!target || target.matches(":disabled, [aria-disabled='true']")) return;
    const box = target.getBoundingClientRect();
    target.style.setProperty("--press-x", `${event.clientX - box.left}px`);
    target.style.setProperty("--press-y", `${event.clientY - box.top}px`);
    // The ripple starts as an 8px dot, so this scale lets it reach the farthest corner from any point.
    target.style.setProperty(
      "--press-size",
      String(Math.ceil(Math.hypot(box.width, box.height) / 4)),
    );
    // Data attributes rather than classes, so a React re-render can't strip them mid-press.
    delete target.dataset.pressed;
    void target.offsetWidth;
    target.dataset.pressed = "";
  };
  const settle = (event: AnimationEvent) => {
    if (event.animationName === "press-ripple" && event.target instanceof HTMLElement)
      delete event.target.dataset.pressed;
  };
  // iOS Safari only shows :active styles once the page listens for touches.
  const touch = () => {};
  // Capture, so a carousel that stops the event from bubbling can't keep a button held down.
  const options = { capture: true, passive: true };
  document.addEventListener("pointerdown", press, options);
  document.addEventListener("pointerup", release, options);
  document.addEventListener("pointercancel", release, options);
  addEventListener("blur", release);
  document.addEventListener("animationend", settle);
  document.addEventListener("touchstart", touch, { passive: true });
  return () => {
    release();
    document.removeEventListener("pointerdown", press, options);
    document.removeEventListener("pointerup", release, options);
    document.removeEventListener("pointercancel", release, options);
    removeEventListener("blur", release);
    document.removeEventListener("animationend", settle);
    document.removeEventListener("touchstart", touch);
  };
}
