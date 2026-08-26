import type { UnitSystem } from "../data/types";

export default function TopBar(props: {
  system: UnitSystem;
  setSystem: (s: UnitSystem) => void;
  onContents: () => void;
  showContents: boolean;
}) {
  return (
    <div className="topbar">
      <div className="tb-side">
        {props.showContents && (
          <button className="tb-btn" onClick={props.onContents}>← Contents</button>
        )}
      </div>
      <div className="tb-word">The Big Table</div>
      <div className="tb-side right">
        <div className="toggle dark">
          <button
            className={props.system === "metric" ? "active" : ""}
            onClick={() => props.setSystem("metric")}
          >
            Metric
          </button>
          <button
            className={props.system === "us" ? "active" : ""}
            onClick={() => props.setSystem("us")}
          >
            US
          </button>
        </div>
      </div>
    </div>
  );
}
