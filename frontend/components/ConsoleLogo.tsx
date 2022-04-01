import ConsoleLogoImage from '@/public/brand/pagoda_dc.svg';

function ConsoleLogo() {
  return (
    <div className="logoContainer">
      <ConsoleLogoImage style={{ width: '100%', height: '100%' }} />
      <style jsx>{`
        .logoContainer {
          max-width: 100vw;
        }
      `}</style>
    </div>
  );
}

export default ConsoleLogo;
