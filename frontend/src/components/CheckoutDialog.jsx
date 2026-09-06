import { useEffect } from "react";
import { CreditCard, Truck, X, Check } from "lucide-react";

/**
 * Checkout sheet shared by the cart and the single-product "buy now" flow.
 *
 * Card details never leave the browser — the API is only sent the payment
 * method, address and phone — so the copy here says exactly that rather than
 * implying a real payment processor is involved.
 */
const CheckoutDialog = ({
  open,
  onClose,
  lines,
  total,
  paymentMethod,
  onPaymentMethodChange,
  shippingAddress,
  onShippingAddressChange,
  recipientPhone,
  onRecipientPhoneChange,
  cardDetails,
  onCardChange,
  onSubmit,
  isSubmitting,
  submitLabel,
}) => {
  // Close on Escape, and stop the page behind from scrolling.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const fieldClass =
    "w-full h-10 px-3 rounded-btn border border-base-300 bg-base-100 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral/40 backdrop-blur-[2px] animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[30rem] max-h-[92vh] overflow-y-auto thin-scroll bg-base-100 border border-base-300 rounded-t-box sm:rounded-box shadow-lift animate-riseIn"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 pt-6 pb-4 bg-base-100 border-b border-base-300">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tightish text-base-content">
              Checkout
            </h2>
            <p className="mt-0.5 text-sm text-base-content/55">
              {lines.length} {lines.length === 1 ? "item" : "items"} · $
              <span className="tnum">{total.toFixed(2)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-btn text-base-content/45 hover:text-base-content hover:bg-base-200 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-7">
          {/* Order lines */}
          <section>
            <h3 className="eyebrow mb-3">Your order</h3>
            <ul className="divide-y divide-base-300/70 border-y border-base-300/70">
              {lines.map((line) => (
                <li key={line.id} className="flex items-baseline justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm text-base-content truncate">{line.name}</p>
                    {line.meta && (
                      <p className="text-xs text-base-content/50">{line.meta}</p>
                    )}
                  </div>
                  <p className="text-sm tnum text-base-content shrink-0">
                    ${line.amount.toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Payment method */}
          <section>
            <h3 className="eyebrow mb-3">How would you like to pay?</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "card", icon: CreditCard, label: "Card", blurb: "Pay now" },
                { id: "cod", icon: Truck, label: "On delivery", blurb: "Cash at the door" },
              ].map((option) => {
                const active = paymentMethod === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onPaymentMethodChange(option.id)}
                    className={
                      "relative text-left p-3.5 rounded-box border transition-colors " +
                      (active
                        ? "border-primary bg-primary/[0.06]"
                        : "border-base-300 hover:border-base-content/25")
                    }
                  >
                    <Icon
                      className={
                        "w-[18px] h-[18px] mb-2 " +
                        (active ? "text-primary" : "text-base-content/45")
                      }
                    />
                    <span
                      className={
                        "block text-sm font-medium " +
                        (active ? "text-primary" : "text-base-content")
                      }
                    >
                      {option.label}
                    </span>
                    <span className="block text-xs text-base-content/50 mt-0.5">
                      {option.blurb}
                    </span>
                    {active && (
                      <Check className="absolute top-3 right-3 w-4 h-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <form onSubmit={onSubmit} className="space-y-7">
            {/* Payment details */}
            {paymentMethod === "card" ? (
              <section className="space-y-4">
                <h3 className="eyebrow">Card</h3>

                <div>
                  <label htmlFor="cardHolder" className="field-label">Name on card</label>
                  <input
                    id="cardHolder"
                    type="text"
                    name="cardHolder"
                    value={cardDetails.cardHolder}
                    onChange={onCardChange}
                    className={fieldClass}
                    autoComplete="cc-name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cardNumber" className="field-label">Card number</label>
                  <input
                    id="cardNumber"
                    type="text"
                    name="cardNumber"
                    inputMode="numeric"
                    maxLength="19"
                    value={cardDetails.cardNumber}
                    onChange={onCardChange}
                    className={fieldClass + " tnum"}
                    autoComplete="cc-number"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="field-label">Expiry</label>
                    <input
                      id="expiryDate"
                      type="text"
                      name="expiryDate"
                      inputMode="numeric"
                      maxLength="5"
                      placeholder="MM / YY"
                      value={cardDetails.expiryDate}
                      onChange={onCardChange}
                      className={fieldClass + " tnum"}
                      autoComplete="cc-exp"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="field-label">Security code</label>
                    <input
                      id="cvv"
                      type="password"
                      name="cvv"
                      inputMode="numeric"
                      maxLength="4"
                      value={cardDetails.cvv}
                      onChange={onCardChange}
                      className={fieldClass + " tnum"}
                      autoComplete="cc-csc"
                      required
                    />
                  </div>
                </div>

                <p className="hint leading-relaxed">
                  Card details stay in your browser. This checkout doesn&rsquo;t
                  connect to a real payment provider, so nothing is charged.
                </p>
              </section>
            ) : (
              <section className="rounded-box border border-base-300 bg-base-200/50 p-4">
                <h3 className="text-sm font-medium text-base-content">
                  Paying at the door
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-base-content/60">
                  Have <span className="tnum font-medium text-base-content">${total.toFixed(2)}</span>{" "}
                  ready in cash. You can open the parcel and check it over before
                  you hand anything to the courier.
                </p>
              </section>
            )}

            {/* Delivery */}
            <section className="space-y-4">
              <h3 className="eyebrow">Where is it going?</h3>

              <div>
                <label htmlFor="shippingAddress" className="field-label">Delivery address</label>
                <textarea
                  id="shippingAddress"
                  rows="3"
                  value={shippingAddress}
                  onChange={onShippingAddressChange}
                  className="w-full px-3 py-2.5 rounded-btn border border-base-300 bg-base-100 text-sm leading-relaxed text-base-content focus:outline-none focus:border-primary transition-colors resize-none"
                  autoComplete="street-address"
                  required
                />
                <p className="hint mt-1.5">Street, building or flat number, city, postcode.</p>
              </div>

              <div>
                <label htmlFor="recipientPhone" className="field-label">Contact number</label>
                <input
                  id="recipientPhone"
                  type="tel"
                  value={recipientPhone}
                  onChange={onRecipientPhoneChange}
                  className={fieldClass}
                  autoComplete="tel"
                  required
                />
                <p className="hint mt-1.5">The courier calls this number on arrival.</p>
              </div>
            </section>

            {/* Total */}
            <section className="space-y-1.5 pt-1 border-t border-base-300">
              <div className="flex justify-between text-sm text-base-content/60 pt-3">
                <span>Subtotal</span>
                <span className="tnum">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-base-content/60">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-base-300">
                <span className="text-sm font-medium text-base-content">Total</span>
                <span className="text-lg font-semibold tnum text-base-content">
                  ${total.toFixed(2)}
                </span>
              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost flex-1 normal-case font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex-1 normal-case font-medium"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  submitLabel
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDialog;
