/* Text input wrapped in the styled `.buycart-field` shell.
 *
 *   icon        - optional component rendered on the left (see components/icons.jsx)
 *   label       - accessible name for the input (kept out of the visible UI,
 *                 since the design relies on placeholders rather than labels)
 *   children    - optional node rendered after the input (e.g. a toggle button)
 *   className   - applied to the <input> itself
 *   ...props    - forwarded to <input> (value, onChange, type, placeholder, ...)
 *
 * The whole thing is a <label>, so clicking the icon/shell focuses the input. */

export default function Input({ icon: Icon, label, className = "", children, ...props }) {
  return (
    <label className="buycart-field">
      {Icon ? <Icon /> : null}
      <input aria-label={label} className={className} {...props} />
      {children}
    </label>
  );
}
