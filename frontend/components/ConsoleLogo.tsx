import LogoSvg from '@/public/images/pagoda-logo.svg';

function ConsoleLogo() {
  return (
    <div className="container">
      <div className="logoContainer">
        <LogoSvg style={{ width: '92px', height: 'auto', maxWidth: '100%' }} />
      </div>

      <h1 className="title">Developer Console</h1>

      <style jsx>{`
        .logoContainer {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .title {
          font-size: 2.5rem;
          font-family: 'NB International Pro', sans-serif;
          font-weight: 400;
          letter-spacing: -0.02em;
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default ConsoleLogo;
