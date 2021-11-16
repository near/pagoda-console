import ConsoleLogoImage from '../public/Developer Console Logo.svg'

function ConsoleLogo() {

    return <div className='logoContainer'>
        <ConsoleLogoImage style={{ width: '100%', height: '100%' }} />
        <style jsx>{`
    .logoContainer {
          width : 36.5rem;
          max-width: 100vw;
        }
    `}</style>
    </div>
}

export default ConsoleLogo