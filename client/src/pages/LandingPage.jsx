import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Aurora from '../components/common/Aurora';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goHome = () => {
    if (!user) return navigate('/login');
    if (user.role === 'jobposter')   return navigate('/poster/dashboard');
    if (user.role === 'jobseeker')   return navigate('/seeker/dashboard');
    if (user.role === 'systemadmin') return navigate('/admin/dashboard');
  };

  return (
    <div className="landing">
      <div className="hero">

        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <Aurora
            colorStops={["#7cff67","#B497CF","#5227FF"]}
            blend={0.5}
            amplitude={1.0}
            speed={1}
          />
        </div>

        <div style={{ position:'relative', zIndex:1 }}>
          <h1 className="fade-up">Find work that <span>matters</span></h1>
          <p className="fade-up delay-1">
            WorkBridge connects talented freelancers with forward-thinking companies.
            Post jobs, apply with confidence, and build something great together.
          </p>
          <div className="hero-btns fade-up delay-2">
            {user ? (
              <button className="btn btn-primary" onClick={goHome}>Go to Dashboard →</button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started Free</button>
                <button className="btn btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
              </>
            )}
          </div>
          <div className="fade-up delay-3" style={{ marginTop:'3rem', display:'flex', gap:'2.5rem', justifyContent:'center', color:'var(--text2)', fontSize:'.88rem' }}>
            <span>🔒 Secure Payments</span>
            <span>✅ Verified Profiles</span>
            <span>⭐ Trusted Reviews</span>
          </div>
        </div>

      </div>

      <div style={{ padding:'3rem 2rem', maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', marginBottom:'2rem', fontSize:'1.6rem' }}>How it works</h2>
        <div className="grid-3">
          {[
            { icon:'📝', title:'Post a Job',    desc:'Describe your project and the skills you need. It takes less than 5 minutes.' },
            { icon:'🎯', title:'Get Matched',   desc:'Talented freelancers with matching skills will apply to your listing.' },
            { icon:'🚀', title:'Hire & Build',  desc:'Review proposals, hire the best fit, and build something amazing.' },
          ].map(c => (
            <div className="card" key={c.title} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'.75rem' }}>{c.icon}</div>
              <h3 style={{ marginBottom:'.5rem' }}>{c.title}</h3>
              <p style={{ color:'var(--text2)', fontSize:'.9rem' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}