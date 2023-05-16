import { useFloating } from "@floating-ui/react";

type Props = {
  children: React.ReactNode;
  title?: string;
};
export const Tooltip = ({ children, title }: Props) => {
  const { x, y, strategy, refs } = useFloating();

  return (
    <>
      <span ref={refs.setReference}>{children}</span>
      <div
        ref={refs.setFloating}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: "max-content",
        }}
      >
        {title}
      </div>
    </>
  );
};
