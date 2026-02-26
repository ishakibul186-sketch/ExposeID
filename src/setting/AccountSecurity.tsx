import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, User, RecaptchaVerifier, PhoneAuthProvider, multiFactor, PhoneMultiFactorGenerator } from 'firebase/auth';

const AccountSecurity = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkMfaStatus(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkMfaStatus = (currentUser: User) => {
    const mfaEnrolled = currentUser.multiFactor?.enrolledFactors.length > 0;
    setIsMfaEnabled(mfaEnrolled);
  };

  const handleMfaSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setIsMfaModalOpen(true);
    } else {
      handleDisableMfa();
    }
  };

  const handleEnableMfa = async () => {
    if (!user || !phoneNumber) {
      setError('Phone number is required.');
      return;
    }
    setError(null);
    setInfo('Sending verification code...');

    try {
      // @ts-ignore
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-mfa', {
        'size': 'invisible',
      });

      const multiFactorSession = await multiFactor(user).getSession();
      const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        // @ts-ignore
        window.recaptchaVerifier
      );
      setVerificationId(verificationId);
      setInfo('Verification code sent. Please check your phone.');
    } catch (error: any) {
      setError(`Error sending code: ${error.message}`);
      setInfo(null);
    }
  };

  const handleVerifyCode = async () => {
    if (!user || !verificationId || !verificationCode) {
      setError('Verification code is required.');
      return;
    }

    try {
      const cred = PhoneMultiFactorGenerator.assertion(verificationId, verificationCode);
      await multiFactor(user).enroll(cred, `ExposeID 2FA`);
      checkMfaStatus(user);
      setIsMfaModalOpen(false);
      setVerificationId(null);
      setVerificationCode('');
      setPhoneNumber('');
      setInfo('2FA has been successfully enabled!');
    } catch (error: any) {
      setError(`Error verifying code: ${error.message}`);
    }
  };

  const handleDisableMfa = async () => {
    if (!user || !user.multiFactor.enrolledFactors[0]) {
        setError('No 2FA method found to disable.');
        return;
    }
    try {
        const mfaUid = user.multiFactor.enrolledFactors[0].uid;
        await multiFactor(user).unenroll(mfaUid);
        checkMfaStatus(user);
        setInfo('2FA has been disabled.');
    } catch (error: any) {
        setError(`Failed to disable 2FA: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center pt-20">
        <div className="w-full max-w-2xl p-8 bg-zinc-900 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-center text-emerald-400 mb-8">Account Security</h1>
            {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-center">{error}</p>}
            {info && <p className="bg-emerald-500/20 text-emerald-400 p-3 rounded-md mb-4 text-center">{info}</p>}

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                    <div>
                        <h2 className="font-semibold">Email Verification</h2>
                        <p className="text-sm text-zinc-400">Your email address is {user?.emailVerified ? 'verified' : 'not verified'}.</p>
                    </div>
                    <div className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 cursor-default ${user?.emailVerified ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${user?.emailVerified ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                    <div>
                        <h2 className="font-semibold">SMS Multi-factor Authentication</h2>
                        <p className="text-sm text-zinc-400">Secure your account with a one-time code sent to your phone.</p>
                    </div>
                    <label htmlFor="mfa-toggle" className="cursor-pointer">
                        <div className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${isMfaEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                            <input id="mfa-toggle" type="checkbox" className="hidden" checked={isMfaEnabled} onChange={handleMfaSwitch} />
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${isMfaEnabled ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        {isMfaModalOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-full max-w-sm">
                    {!verificationId ? (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-emerald-400">Enable Two-Factor Authentication</h2>
                            <p className='text-zinc-400'>Enter your phone number to receive a verification code.</p>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+16505551234"
                                className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <div className="flex gap-4">
                                <button onClick={() => setIsMfaModalOpen(false)} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                                <button onClick={handleEnableMfa} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg">Send Code</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-emerald-400">Verify Code</h2>
                            <p className='text-zinc-400'>Enter the code sent to your phone.</p>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="123456"
                                className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                             <div className="flex gap-4">
                                <button onClick={() => {setVerificationId(null); setInfo(null);}} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">Back</button>
                                <button onClick={handleVerifyCode} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg">Verify & Enable</button>
                            </div>
                        </div>
                    )}
                    <div id="recaptcha-container-mfa"></div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AccountSecurity;
