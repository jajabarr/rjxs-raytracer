import * as React from "react";

export const useMounted = () => {
  const [isMounted, mount] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!isMounted) {
      mount(true);
    }
  }, [isMounted]);

  return isMounted;
};
