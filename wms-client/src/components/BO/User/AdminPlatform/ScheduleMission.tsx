import React, { useCallback, MouseEvent } from "react";
import { missionTrigger } from "../../../../actions/StockActions";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import { toast } from "react-toastify";
import { notifyRequestFailed } from "../../../../utilities/notifyRequestFailed";
import { useSubmitLock } from "../../../../utilities/useSubmitLock";

const ScheduleMission: React.FC = () => {
  const { isLocked: isLoading, runLocked } = useSubmitLock();

  const handleMissionTrigger = useCallback((e: MouseEvent<HTMLButtonElement>): void => {
    const [periodType, fn] = e.currentTarget.name.split("-");

    void runLocked(() =>
      missionTrigger(periodType, fn)
        .then(() => {
          toast.success("Misson Complete");
        })
        .catch((error) => {
          notifyRequestFailed(error);
        })
    );
  }, [runLocked]);

  return (
    <div className="container">
      <LoadingOverlay active={isLoading} spinner={<Spinner />}>
        <div style={{ height: "80vh" }}>
          <button
            className="btn btn-primary me-2"
            name="daily-stockCompare"
            onClick={handleMissionTrigger}
            disabled={isLoading}
          >
            每日比對
          </button>
          <button
            className="btn btn-primary me-2"
            name="weekly-syncProductCategory"
            onClick={handleMissionTrigger}
            disabled={isLoading}
          >
            貨號類別同步
          </button>
          <button
            className="btn btn-primary"
            name="weekly-syncProductCategory"
            // onClick={handleMissionTrigger}
            disabled
          >
            貨號品名同步
          </button>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default ScheduleMission;
