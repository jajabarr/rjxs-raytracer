import * as React from "react";
import { useMounted } from "../../hooks";

interface IAnchorProps {
  style: React.CSSProperties;
  children: (anchor: DOMRect) => JSX.Element;
}

export const Anchor: React.FC<IAnchorProps> = React.memo(
  ({ style, children }) => {
    const anchorRef = React.createRef<HTMLDivElement>();
    const [anchorProps, updateAnchorProps] = React.useState<DOMRect>(
      new DOMRect()
    );

    const isMounted = useMounted();

    React.useEffect(() => {
      if (!isMounted) {
        if (anchorRef.current) {
          updateAnchorProps(anchorRef.current.getBoundingClientRect());
        }
      }
    }, [isMounted, updateAnchorProps, anchorRef]);

    const memoizedChildren = React.useMemo(
      () => (isMounted ? children(anchorProps) : null),
      [children, anchorProps, isMounted]
    );

    return (
      <div
        ref={anchorRef}
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ...style,
        }}
      >
        {memoizedChildren}
      </div>
    );
  }
);
