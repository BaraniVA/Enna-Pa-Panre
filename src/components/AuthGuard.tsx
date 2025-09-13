import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../services/auth';
import SignInScreen from './SignInScreen';
import LoadingScreen from './LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <SignInScreen />;
  }

  return <>{children}</>;
};

export default AuthGuard;