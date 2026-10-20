// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import PriceInput from "./PriceInput";

function ServiceFormFields() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);

  return (
    <>
      <input aria-label="Service name" value={name} onChange={(event) => setName(event.target.value)} />
      <PriceInput
        label="Rate"
        value={price}
        onValueChange={(values, sourceInfo) => {
          if (sourceInfo.source === "event") setPrice(values.floatValue ?? 0);
        }}
      />
      <output aria-label="Saved rate">{price}</output>
    </>
  );
}

function LedgerAmountFields() {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <>
      <PriceInput
        label="Amount"
        value={amount}
        onValueChange={(values, sourceInfo) => {
          if (sourceInfo.source === "event") setAmount(values.value);
        }}
      />
      <input aria-label="Source" value={source} onChange={(event) => setSource(event.target.value)} />
      <output aria-label="Submitted amount">{Number(amount)}</output>
    </>
  );
}

describe("PriceInput", () => {
  it("keeps the entered rate when a sibling field changes", () => {
    render(<ServiceFormFields />);

    const rate = screen.getByPlaceholderText("0.00") as HTMLInputElement;
    fireEvent.change(rate, { target: { value: "1250" } });
    expect(screen.getByLabelText("Saved rate").textContent).toBe("1250");

    fireEvent.change(screen.getByLabelText("Service name"), { target: { value: "Support" } });
    expect(rate.value).toBe("1,250");
    expect(screen.getByLabelText("Saved rate").textContent).toBe("1250");

    fireEvent.change(rate, { target: { value: "1350" } });
    expect(rate.value).toBe("1,350");
    expect(screen.getByLabelText("Saved rate").textContent).toBe("1350");
  });

  it("preserves a million-unit ledger amount while other fields change", () => {
    const { container } = render(<LedgerAmountFields />);
    const { getByPlaceholderText, getByLabelText } = within(container);

    const amount = getByPlaceholderText("0.00") as HTMLInputElement;
    for (const digits of ["1", "10", "100", "1000", "10000", "100000", "1000000"]) {
      fireEvent.change(amount, { target: { value: digits } });
    }
    expect(amount.value).toBe("1,000,000");
    expect(getByLabelText("Submitted amount").textContent).toBe("1000000");

    fireEvent.change(getByLabelText("Source"), { target: { value: "Acme" } });
    expect(amount.value).toBe("1,000,000");
    expect(getByLabelText("Submitted amount").textContent).toBe("1000000");
  });
});
