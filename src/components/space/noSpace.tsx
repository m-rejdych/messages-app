import type { FC, HTMLProps } from 'react';

const NoSpace: FC<HTMLProps<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    {...props}
    className={`flex flex-col justify-center items-center mx-8 ${
      className ?? ''
    }`}
  >
    <p className="text-2xl font-bold mb-6">
      Looks like you are not a part of any space yet.
    </p>
    <div className="flex flex-col w-full lg:flex-row">
      <div className="grid flex-grow h-32 card bg-base-300 rounded-box place-items-center">
        <p className="text-lg">Create new</p>
        <button className="btn btn-primary">Create space</button>
      </div>
      <div className="divider lg:divider-horizontal">OR</div>
      <div className="grid flex-grow h-32 card bg-base-300 rounded-box place-items-center">
        <p className="text-lg">Join existing one</p>
        <button className="btn btn-secondary">Join space</button>
      </div>
    </div>
  </div>
);

export default NoSpace;
