import { describe, expect, it } from "vitest";

import { customRender, screen } from "@/Components/Utilities/Testing";

import { TpdexBadge } from "./TpdexBadge";

describe("TpdexBadge", () => {
  describe("rendering with score prop", () => {
    it("renders A++ badge for score 99", () => {
      customRender(<TpdexBadge score={99} />);

      expect(screen.getByText("A++")).toBeInTheDocument();
      expect(screen.getByText("A++")).toHaveClass("bg-tpdex-a-plus-plus");
    });

    it("renders A+ badge for score 96", () => {
      customRender(<TpdexBadge score={96} />);

      expect(screen.getByText("A+")).toBeInTheDocument();
      expect(screen.getByText("A+")).toHaveClass("bg-tpdex-a-plus");
    });

    it("renders A badge for score 93", () => {
      customRender(<TpdexBadge score={93} />);

      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("A")).toHaveClass("bg-tpdex-a");
    });

    it("renders B badge for score 85", () => {
      customRender(<TpdexBadge score={85} />);

      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("B")).toHaveClass("bg-tpdex-b");
    });

    it("renders C badge for score 70", () => {
      customRender(<TpdexBadge score={70} />);

      expect(screen.getByText("C")).toBeInTheDocument();
      expect(screen.getByText("C")).toHaveClass("bg-tpdex-c");
    });

    it("renders D badge for score 50", () => {
      customRender(<TpdexBadge score={50} />);

      expect(screen.getByText("D")).toBeInTheDocument();
      expect(screen.getByText("D")).toHaveClass("bg-tpdex-d");
    });

    it("renders E badge for score 32", () => {
      customRender(<TpdexBadge score={32} />);

      expect(screen.getByText("E")).toBeInTheDocument();
      expect(screen.getByText("E")).toHaveClass("bg-tpdex-e");
    });

    it("renders F badge for score 18", () => {
      customRender(<TpdexBadge score={18} />);

      expect(screen.getByText("F")).toBeInTheDocument();
      expect(screen.getByText("F")).toHaveClass("bg-tpdex-f");
    });

    it("renders G badge for score 10", () => {
      customRender(<TpdexBadge score={10} />);

      expect(screen.getByText("G")).toBeInTheDocument();
      expect(screen.getByText("G")).toHaveClass("bg-tpdex-g");
    });
  });

  describe("absence versus a real zero", () => {
    it("renders a score of 0 as measured rather than treating it as absent", () => {
      // Guards the `score !== undefined` check: a truthiness test would silently
      // fall back to deriving from responseTime and hide a genuinely awful score.
      customRender(<TpdexBadge score={0} responseTime={10} />);

      expect(screen.getByText("G")).toBeInTheDocument();
    });
  });

  describe("rendering with responseTime prop", () => {
    // A score derived from a response time is an estimate, and the badge marks it with a leading
    // tilde. See the "estimated versus measured" block below for why.
    it("calculates score from response time and displays correct badge", () => {
      // 50ms should give score 96 = A+
      customRender(<TpdexBadge responseTime={50} />);

      expect(screen.getByText("~A+")).toBeInTheDocument();
    });

    it("handles very fast response times", () => {
      // 10ms should give score 99 = A++
      customRender(<TpdexBadge responseTime={10} />);

      expect(screen.getByText("~A++")).toBeInTheDocument();
    });

    it("handles slow response times", () => {
      // 5000ms should give score 12 = G
      customRender(<TpdexBadge responseTime={5000} />);

      expect(screen.getByText("~G")).toBeInTheDocument();
    });
  });

  describe("estimated versus measured", () => {
    // A transaction that has not ended carries no score, so the badge derives one from the
    // response time. That is informative and worth keeping, but filtering treats an unscored
    // transaction as matching no bounded range: a user who sees an A and filters for >= 90
    // watches the row vanish. The badge has to say which kind of claim it is making.
    it("marks an estimate with a tilde and leaves a measurement plain", () => {
      const { unmount } = customRender(<TpdexBadge score={96} />);
      expect(screen.getByText("A+")).toBeInTheDocument();
      unmount();

      customRender(<TpdexBadge responseTime={50} />);
      expect(screen.getByText("~A+")).toBeInTheDocument();
    });

    it("outlines an estimate, so the distinction survives greyscale and small sizes", () => {
      customRender(<TpdexBadge responseTime={50} />);

      expect(screen.getByText("~A+")).toHaveClass("outline-dashed");
    });

    it("does not outline a measurement", () => {
      customRender(<TpdexBadge score={96} />);

      expect(screen.getByText("A+")).not.toHaveClass("outline-dashed");
    });

    it("does not carry the distinction by colour", () => {
      // WCAG 1.4.1. The same grade keeps the same hue whether measured or estimated; the tilde
      // and the outline are what differ.
      const { unmount } = customRender(<TpdexBadge score={96} />);
      const measured = screen.getByText("A+").className;
      unmount();

      customRender(<TpdexBadge responseTime={50} />);

      expect(screen.getByText("~A+")).toHaveClass("bg-tpdex-a-plus");
      expect(measured).toContain("bg-tpdex-a-plus");
    });

    it("announces an estimate as one", () => {
      customRender(<TpdexBadge responseTime={50} />);

      expect(screen.getByRole("img")).toHaveAccessibleName("Estimated TPDEX A+, 96 out of 100, from response time");
    });

    it("announces a measurement as a measurement", () => {
      customRender(<TpdexBadge score={96} />);

      expect(screen.getByRole("img")).toHaveAccessibleName("TPDEX A+, 96 out of 100");
    });

    it("explains in its tooltip what an estimate is", () => {
      customRender(<TpdexBadge responseTime={50} />);

      expect(screen.getByText("~A+").getAttribute("title")).toMatch(/estimated from response time/i);
    });

    it("treats a measured zero as measured", () => {
      // Guards the `score !== undefined` check: a truthiness test would fall back to the response
      // time and dress a genuinely awful measured score as an estimate.
      customRender(<TpdexBadge score={0} responseTime={10} />);

      expect(screen.getByText("G")).toBeInTheDocument();
      expect(screen.getByText("G")).not.toHaveClass("outline-dashed");
    });

    it("trusts a measured score over a response time when it has both", () => {
      customRender(<TpdexBadge score={96} responseTime={5000} />);

      expect(screen.getByText("A+")).toBeInTheDocument();
    });
  });

  describe("showScore prop", () => {
    it("displays score when showScore is true", () => {
      customRender(<TpdexBadge score={95} showScore={true} />);

      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("(95)")).toBeInTheDocument();
    });

    it("does not display score when showScore is false", () => {
      customRender(<TpdexBadge score={95} showScore={false} />);

      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.queryByText("(95)")).not.toBeInTheDocument();
    });

    it("does not display score by default", () => {
      customRender(<TpdexBadge score={95} />);

      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.queryByText("(95)")).not.toBeInTheDocument();
    });
  });

  describe("sizing", () => {
    it("renders at the single canonical inline size", () => {
      customRender(<TpdexBadge score={95} />);

      const badge = screen.getByText("A");
      expect(badge).toHaveClass("px-2", "py-0.5", "text-xs");
    });
  });

  describe("accessibility and styling", () => {
    it("includes proper title attribute", () => {
      customRender(<TpdexBadge score={95} />);

      const badge = screen.getByText("A");
      expect(badge).toHaveAttribute("title", "TPDEX Score: 95/100 (A)");
    });

    it("applies base styling classes", () => {
      customRender(<TpdexBadge score={95} />);

      const badge = screen.getByText("A");
      expect(badge).toHaveClass("inline-flex", "items-center", "rounded", "font-medium");
    });

    /**
     * White text measures under 4:1 on every fill but G's. The colours were
     * chosen by measurement in the `EveryRatingIsReadable` story; this keeps a
     * change of them deliberate.
     */
    it("draws its label in the rating's text colour", () => {
      customRender(<TpdexBadge score={95} />);
      expect(screen.getByText("A")).toHaveClass("text-gray-950");
      expect(screen.getByText("A")).not.toHaveClass("text-white");
    });

    it("keeps white text on the one fill dark enough for it", () => {
      customRender(<TpdexBadge score={0} />);
      expect(screen.getByText("G")).toHaveClass("text-white");
    });

    it("merges custom className", () => {
      customRender(<TpdexBadge score={95} className="custom-class" />);

      const badge = screen.getByText("A");
      expect(badge).toHaveClass("custom-class");
      expect(badge).toHaveClass("bg-tpdex-a"); // Original class should remain
    });

    it("passes through additional props", () => {
      customRender(<TpdexBadge score={95} data-testid="tpdex-badge" />);

      const badge = screen.getByTestId("tpdex-badge");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles score of 0", () => {
      customRender(<TpdexBadge score={0} />);

      expect(screen.getByText("G")).toBeInTheDocument();
    });

    it("handles score of 100", () => {
      customRender(<TpdexBadge score={100} />);

      expect(screen.getByText("A++")).toBeInTheDocument();
    });

    it("handles undefined responseTime and score", () => {
      // Nothing measured and nothing to estimate from: defaults to responseTime 0, which gives
      // score 100, and is marked as the estimate it is.
      customRender(<TpdexBadge />);

      expect(screen.getByText("~A++")).toBeInTheDocument();
    });

    it("prioritizes score over responseTime when both are provided", () => {
      // score=50 should give D, responseTime=10 would give A++
      customRender(<TpdexBadge score={50} responseTime={10} />);

      expect(screen.getByText("D")).toBeInTheDocument();
    });
  });

  describe("snapshot tests", () => {
    it("matches snapshot for A++ rating", () => {
      const { container } = customRender(<TpdexBadge score={99} />);
      expect(container).toMatchSnapshot();
    });

    it("matches snapshot with score shown", () => {
      const { container } = customRender(<TpdexBadge score={85} showScore={true} />);
      expect(container).toMatchSnapshot();
    });
  });
});
