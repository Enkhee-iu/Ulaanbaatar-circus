import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRef } from "react";
import { sizedImage } from "@/lib/site-images";
import { useLanguage } from "./Language";
import { SmartImage } from "./Loading";

export function ShowLightbox({
  images,
  selected,
  onSelect,
  titleOf,
}: {
  images: string[];
  selected: string | null;
  onSelect: (src: string | null) => void;
  titleOf: (src: string) => string;
}) {
  const { t } = useLanguage();
  const opener = useRef<HTMLElement | null>(null);
  const index = selected === null ? -1 : images.indexOf(selected);
  const step = (offset: number) =>
    onSelect(images[(index + offset + images.length) % images.length]);
  return (
    <Dialog.Root
      open={index >= 0}
      onOpenChange={(open) => {
        if (!open) onSelect(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="film-overlay" />
        <Dialog.Content
          className="show-lightbox"
          // There is no Dialog.Trigger, so return focus to the photo that opened the lightbox.
          onOpenAutoFocus={() => {
            opener.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
          onKeyDown={(event) => {
            if (images.length < 2) return;
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              step(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <div className="show-lightbox-heading">
            <Dialog.Title>{selected !== null && titleOf(selected)}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label={t("Close photo")}>
              <X size={23} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{t("Show photo gallery")}</Dialog.Description>
          {selected !== null && (
            <SmartImage src={sizedImage(selected, 2000)} alt={`${titleOf(selected)} · ${index + 1}`} />
          )}
          <div className="show-lightbox-controls">
            {images.length > 1 && (
              <button
                className="icon-button"
                aria-label={t("Previous photo")}
                onClick={() => step(-1)}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <span aria-live="polite">
              {index + 1} / {images.length}
            </span>
            {images.length > 1 && (
              <button className="icon-button" aria-label={t("Next photo")} onClick={() => step(1)}>
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
