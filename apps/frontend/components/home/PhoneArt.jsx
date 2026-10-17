/* A generated "phone" used for hero + product art - a flat metallic frame and
 * a solid screen tint (no gradients). Sized by the `--pw` custom property,
 * which scales every radius and the notch proportionally.
 *
 *   <PhoneArt color="#2563eb" />
 */

export default function PhoneArt({ color = "#3b82f6", className = "" }) {
  return (
    <div className={`phone-art ${className}`.trim()} aria-hidden="true">
      <div className="phone-art__body">
        <div className="phone-art__screen" style={{ "--screen": color }}>
          <span className="phone-art__notch" />
        </div>
      </div>
    </div>
  );
}
