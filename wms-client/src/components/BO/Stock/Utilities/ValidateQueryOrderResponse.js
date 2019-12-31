// check there is any quantity equals 0 in waitHandleStatus
// if there is a type which is not equal 0, return false; otherwise, return true
export function checkWaitHandleStatusCompletion(waitHandleStatus) {
  let quantityValid = true;

  Object.keys(waitHandleStatus).forEach(productNo => {
    Object.keys(waitHandleStatus[productNo]).forEach(type => {
      if (parseFloat(waitHandleStatus[productNo][type].quantity) !== 0.0) {
        quantityValid = false;

        return quantityValid;
      }
    });
  });

  return quantityValid;
}
