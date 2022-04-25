import IconSvg from '@/public/images/maintenance.svg';

export default function MaintenanceMode() {
  return (
    <>
      <div className="iconContainer">
        <IconSvg style={{ width: '114px', height: 'auto', maxWidth: '100%' }} />
      </div>

      <div className="message">
        <h2>Under Maintenance</h2>

        <p>
          Sorry, we are currently down for scheduled maintenance.
          <br />
          Please check back again soon.
        </p>
      </div>

      <style jsx>{`
        .iconContainer {
          margin-top: 1rem;
          margin-bottom: 3rem;
        }

        .message {
          text-align: center;
        }

        .message h2 {
          font-size: 1.875rem;
          font-weight: 400;
          letter-spacing: -0.02em;
          margin-bottom: 1.3rem;
        }

        .message p {
          font-size: 1.25rem;
          text-align: center;
        }
      `}</style>
    </>
  );
}
