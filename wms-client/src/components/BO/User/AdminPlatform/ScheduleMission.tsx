import React, { useState, useCallback, MouseEvent } from "react";
import { missionTrigger } from "../../../../actions/StockActions";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Spinner } from "../../../Others/Spinner";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notifyRequestFailed } from "../../../../utilities/notifyRequestFailed";

const ScheduleMission: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleMissionTrigger = useCallback((e: MouseEvent<HTMLButtonElement>): void => {
    if (isLoading) {
      return;
    }
    const arr = e.currentTarget.name.split("-");

    setIsLoading(true);
    missionTrigger(arr[0], arr[1]).then(() => {
      toast.success("Misson Complete");
    }).catch((error) => {
      notifyRequestFailed(error);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [isLoading]);

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
