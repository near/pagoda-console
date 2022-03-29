import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MouseEventHandler } from 'react';

export default function IconButton({ icon, onClick }: { icon: IconDefinition; onClick: MouseEventHandler }) {
  return (
    <div className="iconButton" onClick={onClick}>
      <div className="iconChild">
        <FontAwesomeIcon icon={icon} />
      </div>
      <style jsx>{`
        .iconButton {
          cursor: pointer;
          display: flex;
          width: 2rem;
          height: 2rem;
        }
        .iconChild {
          margin: auto;
        }
      `}</style>
    </div>
  );
}
