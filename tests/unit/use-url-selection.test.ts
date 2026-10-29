/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUrlSelectionOnPopState } from "@/hooks/use-url-selection";

function visit(url: string) {
  window.history.pushState(null, "", url);
}

function back() {
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function defaults() {
  return {
    year: "2026",
    defaultYear: "2026",
    setYear: vi.fn(),
    USAState: "",
    setUSAState: vi.fn(),
    USACity: "",
    setUSACity: vi.fn(),
  };
}

beforeEach(() => {
  visit("/");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useUrlSelectionOnPopState", () => {
  it("applies the year, state and city the URL navigated back to", () => {
    const props = defaults();
    renderHook(() => useUrlSelectionOnPopState(props));

    visit("/2025/west-virginia/charleston/");
    back();

    expect(props.setYear).toHaveBeenCalledWith("2025");
    expect(props.setUSAState).toHaveBeenCalledWith("west_virginia");
    expect(props.setUSACity).toHaveBeenCalledWith("charleston");
  });

  it("restores the default year at the route root", () => {
    const props = { ...defaults(), year: "2023" };
    renderHook(() => useUrlSelectionOnPopState(props));

    visit("/");
    back();

    expect(props.setYear).toHaveBeenCalledWith("2026");
  });

  it("strips the page's own route prefix before reading segments", () => {
    const props = { ...defaults(), baseRoute: "/tax-tables" };
    renderHook(() => useUrlSelectionOnPopState(props));

    visit("/tax-tables/2024/oregon/");
    back();

    expect(props.setYear).toHaveBeenCalledWith("2024");
    expect(props.setUSAState).toHaveBeenCalledWith("oregon");
  });

  it("clears state and city when navigating back to a bare year", () => {
    const props = { ...defaults(), USAState: "oregon", USACity: "portland" };
    renderHook(() => useUrlSelectionOnPopState(props));

    visit("/2026/");
    back();

    expect(props.setUSAState).toHaveBeenCalledWith("");
    expect(props.setUSACity).toHaveBeenCalledWith("");
  });

  it("does not re-set values that already match the URL", () => {
    const props = {
      ...defaults(),
      year: "2026",
      USAState: "oregon",
      USACity: "portland",
    };
    renderHook(() => useUrlSelectionOnPopState(props));

    visit("/2026/oregon/portland/");
    back();

    expect(props.setYear).not.toHaveBeenCalled();
    expect(props.setUSAState).not.toHaveBeenCalled();
    expect(props.setUSACity).not.toHaveBeenCalled();
  });

  it("hands the page its query params", () => {
    const onQueryParams = vi.fn();
    renderHook(() =>
      useUrlSelectionOnPopState({ ...defaults(), onQueryParams }),
    );

    visit("/2026/oregon/?income=95000");
    back();

    expect(onQueryParams).toHaveBeenCalledTimes(1);
    expect(onQueryParams.mock.calls[0][0].get("income")).toBe("95000");
  });

  // The city-taxes page tracks the year only; omitting the setters opts out
  // rather than tracking against undefined.
  it("leaves state and city alone when their setters are omitted", () => {
    const setYear = vi.fn();
    renderHook(() =>
      useUrlSelectionOnPopState({
        year: "2026",
        defaultYear: "2026",
        setYear,
        baseRoute: "/city-taxes",
      }),
    );

    visit("/city-taxes/2024/");
    back();

    expect(setYear).toHaveBeenCalledWith("2024");
  });

  /**
   * The reason this hook exists. Each call site previously subscribed inside an
   * effect that listed the current selection in its dependencies -- TaxTables
   * listed `taxOptions`, so every recomputation of that array tore down and
   * re-added a window listener. The listener is now registered once and reads
   * current props through a ref.
   */
  describe("subscription stability", () => {
    it("registers exactly one listener across many prop changes", () => {
      const add = vi.spyOn(window, "addEventListener");
      const remove = vi.spyOn(window, "removeEventListener");

      const { rerender } = renderHook(
        (props: ReturnType<typeof defaults>) =>
          useUrlSelectionOnPopState(props),
        { initialProps: defaults() },
      );

      for (const year of ["2023", "2024", "2025", "2026"]) {
        rerender({ ...defaults(), year });
      }

      const popstateAdds = add.mock.calls.filter(
        ([type]) => type === "popstate",
      );
      const popstateRemoves = remove.mock.calls.filter(
        ([type]) => type === "popstate",
      );
      expect(popstateAdds).toHaveLength(1);
      expect(popstateRemoves).toHaveLength(0);
    });

    it("still reads the newest props after a rerender", () => {
      const first = defaults();
      const { rerender } = renderHook(
        (props: ReturnType<typeof defaults>) =>
          useUrlSelectionOnPopState(props),
        { initialProps: first },
      );

      // A stale closure over the initial props would call the first setYear.
      const second = { ...defaults(), year: "2023" };
      rerender(second);

      visit("/2025/");
      back();

      expect(first.setYear).not.toHaveBeenCalled();
      expect(second.setYear).toHaveBeenCalledWith("2025");
    });

    it("unsubscribes on unmount", () => {
      const remove = vi.spyOn(window, "removeEventListener");
      const { unmount } = renderHook(() =>
        useUrlSelectionOnPopState(defaults()),
      );

      unmount();

      expect(
        remove.mock.calls.filter(([type]) => type === "popstate"),
      ).toHaveLength(1);
    });
  });
});
