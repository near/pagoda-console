import ConsoleLogoImage from '../public/brand/pagoda_dc.svg'

function ConsoleLogo() {

    return <div className='logoContainer'>
        <ConsoleLogoImage style={{ width: '100%', height: '100%' }} />
        <style jsx>{`
        .logoContainer {
            width : 36.5rem;
            max-width: 100vw;
            // TODO update the svg so it doesn't take up whitespace on the right
            margin-right: -3.5rem;
            }
        `}</style>
    </div>
}

export default ConsoleLogo