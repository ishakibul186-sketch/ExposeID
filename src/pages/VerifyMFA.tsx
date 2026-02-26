import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PhoneMultiFactorGenerator, MultiFactorResolver } from 'firebase/auth';

const VerifyMFA = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const resolver = location.state?.resolver as MultiFactorResolver | null;
  const verificationId = location.state?.verificationId as string | null;

  if (!resolver || !verificationId) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
            <p>Error: No verification session found. Please try logging in again.</p>
        </div>
    );
  }

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code.');
      return;
    }

    try {
      const cred = PhoneMultiFactorGenerator.assertion(verificationId, verificationCode);
      const userCredential = await resolver.resolveSignIn(cred);
      
      if(userCredential.user){
        navigate('/dashboard');
      }

    } catch (error: any) {
      setError(`Invalid code. Please try again. (${error.message})`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm p-8 bg-zinc-900 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-emerald-400 mb-4">Two-Factor Authentication</h1>
        <p className='text-center text-zinc-400 mb-6'>A verification code has been sent to your phone.</p>
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-center">{error}</p>}
        
        <div className="space-y-4">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleVerify}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Verify & Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyMFA;
