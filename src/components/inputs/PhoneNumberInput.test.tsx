// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import PhoneNumberInput, { validatePhoneNumber } from "./PhoneNumberInput";

function ControlledPhoneNumber() {
  const [value, setValue] = useState("");
  return (
    <>
      <PhoneNumberInput label="Phone number" value={value} onChange={setValue} />
      <output aria-label="Saved phone number">{value}</output>
    </>
  );
}

describe("PhoneNumberInput", () => {
  it("stores a Nigerian phone number in international format", () => {
    render(<ControlledPhoneNumber />);
    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "08012345678" },
    });

    expect(screen.getByLabelText("Saved phone number").textContent).toBe(
      "+2348012345678",
    );
  });

  it("allows an empty optional number but rejects incomplete numbers", () => {
    expect(validatePhoneNumber("")).toBe(true);
    expect(validatePhoneNumber("+2348012345678")).toBe(true);
    expect(validatePhoneNumber("+23480")).toBe("Enter a valid phone number");
  });
});
