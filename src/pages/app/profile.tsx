import { useRef } from 'react';
import { MdAddAPhoto } from 'react-icons/md';
import Image from 'next/image';

import AppLayout from '../../layout/app';
import { getAuthedServerSideProps } from '../../utils/session';
import { trpc } from '../../utils/trpc';
import useAuthError from '../../hooks/useAuthError';
import type { NextPageWithLayout } from '../../types/page';

const Profile: NextPageWithLayout = () => {
  const onError = useAuthError();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const utils = trpc.useContext();
  const { data } = trpc.profile.getProfile.useQuery(undefined, { onError });

  if (!data) return null;

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    try {
      if (!e.target.files?.length) return;

      const formData = new FormData();
      formData.append(e.target.files[0].name, e.target.files[0]);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_UPLOADS_URL}/avatar`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const { avatarUrl } = await response.json();

      utils.profile.getProfile.setData(undefined, (prev) => ({
        ...prev!,
        avatarUrl,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="h-full py-8">
        <div className="flex justify-center">
          <div
            className={`avatar${data.avatarUrl ? '' : ' placeholder'} relative`}
          >
            <div className="flex items-center justify-center bg-neutral-focus text-neutral-content rounded-full w-40 h-40 overflow-hidden">
              {data.avatarUrl ? (
                <Image
                  priority
                  width={160}
                  height={160}
                  src={data.avatarUrl}
                  alt="profile-avatar"
                />
              ) : (
                <span className="text-3xl">
                  {data.displayName[0].toUpperCase()}
                </span>
              )}
            </div>
            <button
              className="btn btn-circle btn-sm absolute -right-1 -top-1"
              onClick={() => fileRef.current?.click()}
            >
              <MdAddAPhoto />
            </button>
          </div>
        </div>
      </div>
      <input
        hidden
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleUpload}
      />
    </>
  );
};

Profile.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export { getAuthedServerSideProps as getServerSideProps };

export default Profile;
