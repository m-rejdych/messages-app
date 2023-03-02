import { useRef } from 'react';
import { MdAddAPhoto } from 'react-icons/md';
import Image from 'next/image';

import AppLayout from '../../layout/app';
import InlineEditor from '../../components/common/inlineEditor';
import { getAuthedServerSideProps } from '../../utils/session';
import { trpc } from '../../utils/trpc';
import useAuthError from '../../hooks/useAuthError';
import type { NextPageWithLayout } from '../../types/page';

const Profile: NextPageWithLayout = () => {
  const onError = useAuthError();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const utils = trpc.useContext();
  const { data } = trpc.profile.getProfile.useQuery(undefined, { onError });
  const updateProfileMutation = trpc.profile.updateProfile.useMutation();

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

  const handleUpdateDisplayName = async (value: string): Promise<void> => {
    try {
      const profile = await updateProfileMutation.mutateAsync({
        displayName: value,
      });
      utils.profile.getProfile.setData(undefined, profile);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
      console.log(error);
    }
  };

  const handleValidateDisplayName = (value: string): string | null =>
    value.trim().length < 3
      ? 'Display name needs to be at least 3 characters long.'
      : null;

  return (
    <>
      <div className="h-full py-8 flex flex-col">
        <div
          className={`avatar${
            data.avatarUrl ? '' : ' placeholder'
          } relative self-center`}
        >
          <div className="flex flex-col items-center justify-center bg-secondary-focus text-neutral-content rounded-full w-40 h-40 overflow-hidden">
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
        <h2 className="text-2xl mt-3 self-center">{data.user.username}</h2>
        <InlineEditor
          value={data.displayName}
          label="Display name"
          onAccept={handleUpdateDisplayName}
          validate={handleValidateDisplayName}
        />
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
