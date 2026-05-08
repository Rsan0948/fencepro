import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "../../../src/components/system/Toast";
import type { ToastEntry } from "../../../src/components/system/Toast";

function emailToast(id: string, subject = "Hi there"): ToastEntry {
  return { id, kind: "email", emailId: id.replace(/^t_/, ""), subject, to: "client@example.com" };
}

describe("Toast auto-dismiss", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onDismiss after 8 seconds", () => {
    const onDismiss = vi.fn();
    render(<Toast toasts={[emailToast("t_msg_1")]} onClick={() => {}} onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(7999);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(onDismiss).toHaveBeenCalledWith("t_msg_1");
  });

  it("clears the timer on unmount before it fires", () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <Toast toasts={[emailToast("t_msg_2")]} onClick={() => {}} onDismiss={onDismiss} />,
    );
    unmount();
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("renders an info toast with title and body", () => {
    const info: ToastEntry = {
      id: "t_info_1",
      kind: "info",
      title: "Saved data was unreadable",
      body: "Loaded the default projects instead.",
    };
    render(<Toast toasts={[info]} onClick={() => {}} onDismiss={() => {}} />);
    expect(screen.getByText("Saved data was unreadable")).toBeInTheDocument();
    expect(screen.getByText("Loaded the default projects instead.")).toBeInTheDocument();
    expect(screen.getByText("(SYSTEM)")).toBeInTheDocument();
  });
});
