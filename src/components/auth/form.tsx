import type { FC } from 'react';

interface Props {
  card?: boolean;
}

const AuthForm: FC<Props> = ({ card }) => {
  const formContent = (
    <>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="text"
          placeholder="email"
          className="input input-bordered"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <input
          type="text"
          placeholder="password"
          className="input input-bordered"
        />
        <label className="label">
          <a href="#" className="label-text-alt link link-hover">
            Forgot password?
          </a>
        </label>
      </div>
      <div className="form-control mt-6">
        <button className="btn btn-primary">Login</button>
      </div>
    </>
  );

  return card ? (
    <div className="card w-full max-w-sm shadow-2xl bg-base-100">
      <form>
        <div className="card-body">{formContent}</div>
      </form>
    </div>
  ) : (
    <form>{formContent}</form>
  );
};

export default AuthForm;
