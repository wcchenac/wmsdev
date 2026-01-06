interface WaitHandleStatusType {
  quantity: string | number;
}

interface WaitHandleStatus {
  [productNo: string]: {
    [type: string]: WaitHandleStatusType;
  };
}

interface WaitHandleProductStatus {
  [type: string]: WaitHandleStatusType;
}

// check there is any quantity equals 0 in waitHandleStatus
// if there is a type which is not equal 0, return false; otherwise, return true
export function checkWaitHandleStatusCompletion(
  waitHandleStatus: WaitHandleStatus
): boolean {
  let quantityValid = true;

  Object.keys(waitHandleStatus).forEach((productNo) => {
    Object.keys(waitHandleStatus[productNo]).forEach((type) => {
      if (parseFloat(waitHandleStatus[productNo][type].quantity as string) !== 0.0) {
        quantityValid = false;
        return;
      }
    });
  });

  return quantityValid;
}

// check there is any quantity equals 0 in waitHandleProductStatus for SelectionBoard
// if there is a type which is not equal 0, return true; otherwise, return false
export function checkWaitHandleProductStatus(
  waitHandleProductStatus: WaitHandleProductStatus
): boolean {
  let quantityValid = false;

  Object.keys(waitHandleProductStatus).forEach((type) => {
    if (parseFloat(waitHandleProductStatus[type].quantity as string) !== 0.0) {
      quantityValid = true;
      return;
    }
  });

  return quantityValid;
}
