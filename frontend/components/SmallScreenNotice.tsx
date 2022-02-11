export default function SmallScreenNotice() {
    return <div className="smallScreenOverlay">
        <div className="centeredContainer">
            <div className="contentContainer">
                <h1>See you on the big screen!</h1>
                <p>We’re working to deliver the best mobile experience possible. In the meantime, please visit us on a device with a larger screen.</p>
            </div>
        </div>
        <style jsx>{`
            .smallScreenOverlay {
                width: 100%;
                height: 100vh;
            }
            .centeredContainer {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
            }
            .contentContainer {
                max-width: 25em;
                padding: 3rem;
            }
        `}</style>
    </div>;
}