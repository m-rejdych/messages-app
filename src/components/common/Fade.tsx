import { type FC, type HTMLProps, useRef } from 'react';
import { Transition, TransitionStatus } from 'react-transition-group';

interface Props extends HTMLProps<HTMLDivElement> {
  in: boolean;
  children: React.ReactNode;
}

const DURATION = 200;

const TRANSITION_STYLES: Partial<
  Record<TransitionStatus, HTMLProps<HTMLDivElement>['style']>
> = {
  entering: { opacity: 1, transform: 'scale(1)' },
  entered: { opacity: 1, transform: 'scale(1)' },
  exiting: { opacity: 0, transform: 'scale(0.9)' },
  exited: { opacity: 0, transform: 'scale(0.9)' },
};

const Fade: FC<Props> = ({ children, in: inProp, ...rest }) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  return (
    <Transition nodeRef={nodeRef} in={inProp} timeout={DURATION}>
      {(state) => (
        <div
          {...rest}
          ref={nodeRef}
          style={{
            transition: `all ${DURATION}ms ease-in-out`,
            transform: 'scale(0.9)',
            opacity: 0,
            ...TRANSITION_STYLES[state],
          }}
        >
          {children}
        </div>
      )}
    </Transition>
  );
};

export default Fade;
