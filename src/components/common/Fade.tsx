import { type FC, type HTMLProps, useRef } from 'react';
import { Transition, TransitionStatus } from 'react-transition-group';

interface Props extends HTMLProps<HTMLDivElement> {
  in: boolean;
  children: React.ReactNode;
  scale?: boolean;
  onEnter?: (isAppearing: boolean) => void;
  onExit?: () => void;
  onEntering?: (isAppearing: boolean) => void;
  onExiting?: () => void;
  onEntered?: (isAppearing: boolean) => void;
  onExited?: () => void;
}

const DURATION = 200;

const Fade: FC<Props> = ({
  children,
  scale,
  in: inProp,
  onEnter,
  onExit,
  onEntering,
  onExiting,
  onEntered,
  onExited,
  ...rest
}) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const transitionStyles: Partial<
    Record<TransitionStatus, HTMLProps<HTMLDivElement>['style']>
  > = {
    entering: { opacity: 1, transform: scale ? 'scale(1)' : undefined },
    entered: { opacity: 1, transform: scale ? 'scale(1)' : undefined },
    exiting: { opacity: 0, transform: scale ? 'scale(0.9)' : undefined },
    exited: { opacity: 0, transform: scale ? 'scale(0.9)' : undefined },
  };

  return (
    <Transition
      nodeRef={nodeRef}
      in={inProp}
      timeout={DURATION}
      onEnter={onEnter}
      onExit={onExit}
      onEntering={onEntering}
      onExiting={onExiting}
      onEntered={onEntered}
      onExited={onExited}
      mountOnEnter
      unmountOnExit
    >
      {(state) => (
        <div
          {...rest}
          ref={nodeRef}
          style={{
            transition: `all ${DURATION}ms ease-in-out`,
            transform: 'scale(0.9)',
            opacity: 0,
            ...transitionStyles[state],
          }}
        >
          {children}
        </div>
      )}
    </Transition>
  );
};

export default Fade;
