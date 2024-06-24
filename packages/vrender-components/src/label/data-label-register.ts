const labelComponentMap = {};

export const registerLabelComponent = (type: string, LabelClass: any) => {
  labelComponentMap[type] = LabelClass;
};

export const getLabelComponent = (type: string) => {
  return labelComponentMap[type];
};
