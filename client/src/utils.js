export const combineBoxes = (boxes) => {
    const combined = {};
  
    boxes.forEach((box) => {
      if (!combined[box.boxNo]) {
        combined[box.boxNo] = { ...box };
      } else {
        combined[box.boxNo].partsQty += box.partsQty;
        combined[box.boxNo].dateAdded = new Date(
          Math.max(new Date(combined[box.boxNo].dateAdded), new Date(box.dateAdded))
        );
      }
    });
  
    return Object.values(combined);
  };
  