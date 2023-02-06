import { MdAddAPhoto } from 'react-icons/md';

import AppLayout from '../../layout/app';
import { getAuthedServerSideProps } from '../../utils/session';
import { trpc } from '../../utils/trpc';
import useAuthError from '../../hooks/useAuthError';
import type { NextPageWithLayout } from '../../types/page';

const Profile: NextPageWithLayout = () => {
  const onError = useAuthError();
  const { data } = trpc.profile.getProfile.useQuery(undefined, { onError });

  if (!data) return null;

  return (
    <div className="h-full py-8">
      <div className="flex justify-center">
        <div className="avatar placeholder relative">
          <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
            <span className="text-3xl">
              {data.displayName[0].toUpperCase()}
            </span>
          </div>
          <button className="btn btn-circle btn-sm absolute -right-1 -top-1">
            <MdAddAPhoto />
          </button>
        </div>
      </div>
    </div>
  );
};

Profile.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export { getAuthedServerSideProps as getServerSideProps };

export default Profile;
