// check there is any quantity equals 0 in waitHandleStatus
// if there is a type which is not equal 0, return false; otherwise, return true
export function checkWaitHandleStatusCompletion(waitHandleStatus) {
  let quantityValid = true;

  Object.keys(waitHandleStatus).forEach(productNo => {
    Object.keys(waitHandleStatus[productNo]).forEach(type => {
      if (parseFloat(waitHandleStatus[productNo][type].quantity) !== 0.0) {
        return (quantityValid = false);
      }
    });
  });

  return quantityValid;
}

// check there is any quantity equals 0 in waitHandleProductStatus for SelectionBoard
// if there is a type which is not equal 0, return true; otherwise, return false
export function checkWaitHandleProductStatus(waitHandleProductStatus) {
  let quantityValid = false;

  Object.keys(waitHandleProductStatus).forEach(type => {
    if (parseFloat(waitHandleProductStatus[type].quantity) !== 0.0) {
      return (quantityValid = true);
    }
  });

  return quantityValid;
}
