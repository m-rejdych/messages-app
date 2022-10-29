import type { NextPage } from 'next';
import Link from 'next/link';

const Home: NextPage = () => (
  <div className="hero min-h-screen bg-base-200">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold">Messages App</h1>
        <p className="py-6">
          Create spaces, channels or send direct messages. Sign in and start
          chatting with your friends or co-workers.
        </p>
        <Link href="/login" className="btn btn-primary">
          Get Started
        </Link>
      </div>
    </div>
  </div>
);

export default Home;
