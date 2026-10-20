import Image from "next/image";
import { useState } from "react";
import PhoneArt from "../home/PhoneArt";

/* Product artwork: the real photo when the record has one, otherwise the
 * generated <PhoneArt> placeholder (seeded/older rows may have no image).
 *
 * It takes over the `.pcard__phone` / `.pdp__phone` / etc. class its caller
 * already applies, so the container keeps its existing box, spacing and
 * `--pw` sizing either way - only the contents differ.
 *
 *   <ProductMedia product={product} className="pdp__phone" alt="..." />
 */
export default function ProductMedia({
  product,
  className = "",
  alt,
  sizes = "(max-width: 900px) 90vw, 420px",
  priority = false,
}) {
  const src = product?.images?.[0];
  const [failed, setFailed] = useState(false);

  /* No image (or the file 404s / fails to decode) -> generated art. */
  if (!src || failed) {
    return <PhoneArt color={product?.color} className={className} />;
  }

  const label = alt ?? `${product?.brand ?? ""} ${product?.name ?? ""}`.trim();

  return (
    <div className={`product-media ${className}`.trim()}>
      <Image
        src={src}
        alt={label}
        fill
        sizes={sizes}
        priority={priority}
        className="product-media__img"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
